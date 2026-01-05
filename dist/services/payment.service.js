"use strict";
// src/services/payment.service.ts
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("../prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cart_service_1 = require("./cart.service");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
class PaymentService {
    constructor() {
        this.cartService = new cart_service_1.CartService();
    }
    /**
     * 1) Solo crea la sesión de Stripe.
     * NO crea el pedido.
     * NO descuenta stock.
     * Guarda un snapshot del carrito en metadata.
     */
    async createCheckoutSession(userId, addressId) {
        console.log("🟦 [PaymentService] createCheckoutSession", {
            userId,
            addressId,
        });
        const user = await client_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            const err = new Error("Usuario no encontrado");
            err.status = 400;
            throw err;
        }
        const address = await client_1.prisma.address.findUnique({
            where: { id: addressId },
        });
        if (!address || address.userId !== userId) {
            const err = new Error("Dirección no válida");
            err.status = 400;
            throw err;
        }
        const cart = await this.cartService.getCart(userId);
        if (!cart.items.length) {
            const err = new Error("El carrito está vacío");
            err.status = 400;
            throw err;
        }
        const lineItems = cart.items.map((item) => ({
            price_data: {
                currency: "eur",
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));
        // Snapshot minimal del carrito para recrear el pedido en el webhook
        const snapshot = cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
        }));
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            customer_email: user.email,
            line_items: lineItems,
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
            metadata: {
                userId: String(userId),
                addressId: String(addressId),
                cart: JSON.stringify(snapshot), // OJO: tamaño limitado, pero para carritos pequeños vale
            },
        });
        console.log("💳 [PaymentService] Stripe session created:", {
            sessionId: session.id,
            payment_intent: session.payment_intent,
        });
        // ⛔️ Aquí YA NO se crea pedido ni se limpia el carrito
        return { url: session.url };
    }
    /**
     * 2) Se llama desde el webhook cuando Stripe confirma el pago.
     * Aquí SÍ se crea el pedido, se restan stocks y se limpia el carrito.
     */
    async handleCheckoutSessionCompleted(session) {
        console.log("🟦 [PaymentService] handleCheckoutSessionCompleted", {
            sessionId: session.id,
        });
        const metadata = session.metadata || {};
        const userId = Number(metadata.userId);
        const addressId = Number(metadata.addressId);
        const rawCart = metadata.cart;
        if (!userId || !addressId || !rawCart) {
            const err = new Error("Faltan metadatos para crear el pedido (userId/addressId/cart)");
            err.status = 400;
            throw err;
        }
        let cartItems;
        try {
            cartItems = JSON.parse(rawCart);
        }
        catch (e) {
            const err = new Error("No se pudo parsear el carrito desde metadata");
            err.status = 400;
            throw err;
        }
        if (!cartItems.length) {
            const err = new Error("El carrito en metadata está vacío");
            err.status = 400;
            throw err;
        }
        const productIds = cartItems.map((i) => i.productId);
        // Obtenemos precios y stock actual
        const products = await client_1.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, stock: true, price: true, name: true },
        });
        const productMap = new Map(products.map((p) => [
            p.id,
            { stock: p.stock, price: p.price, name: p.name },
        ]));
        // Comprobar stock y calcular total
        let total = 0;
        for (const item of cartItems) {
            const prod = productMap.get(item.productId);
            if (!prod) {
                const err = new Error(`Producto ${item.productId} no encontrado al confirmar pago`);
                err.status = 400;
                throw err;
            }
            if (prod.stock < item.quantity) {
                const err = new Error(`Stock insuficiente para "${prod.name}". Disponible: ${prod.stock}, solicitado: ${item.quantity}`);
                err.status = 400;
                throw err;
            }
            total += prod.price * item.quantity;
        }
        // Crear pedido + items + restar stock + limpiar carrito, TODO en transacción
        const order = await client_1.prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    userId,
                    addressId,
                    total,
                    status: "PROCESSING",
                    paymentStatus: "PAID",
                    currency: "EUR",
                    items: {
                        create: cartItems.map((item) => {
                            const prod = productMap.get(item.productId);
                            return {
                                productId: item.productId,
                                quantity: item.quantity,
                                unitPrice: prod.price,
                            };
                        }),
                    },
                },
            });
            for (const item of cartItems) {
                const prod = productMap.get(item.productId);
                console.log(`📉 [PaymentService] Decrement stock: productId=${item.productId}, qty=${item.quantity} (stock actual=${prod.stock})`);
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }
            // Limpiar carrito de ese usuario
            await tx.cartItem.deleteMany({
                where: { userId },
            });
            return createdOrder;
        });
        console.log("✅ [PaymentService] Order created from webhook:", order.id);
        return order;
    }
}
exports.PaymentService = PaymentService;
__decorate([
    (0, errorHandler_1.ServiceError)()
], PaymentService.prototype, "createCheckoutSession", null);
__decorate([
    (0, errorHandler_1.ServiceError)()
], PaymentService.prototype, "handleCheckoutSessionCompleted", null);
