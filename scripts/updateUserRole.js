"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/updateUserRole.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const [, , email, roleArg] = process.argv;
    if (!email || !roleArg) {
        console.error("Uso:");
        console.error("  npx ts-node scripts/updateUserRole.ts <email> <ROLE>");
        console.error("Ejemplo:");
        console.error("  npx ts-node scripts/updateUserRole.ts user@example.com ADMIN");
        process.exit(1);
    }
    const role = roleArg.toUpperCase();
    // Validar que el role exista en el enum
    if (!Object.values(client_1.Role).includes(role)) {
        console.error(`Role inválido: ${roleArg}. Roles válidos: ${Object.values(client_1.Role).join(", ")}`);
        process.exit(1);
    }
    // Buscar usuario por email
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        console.error(`No se encontró usuario con email: ${email}`);
        process.exit(1);
    }
    // Actualizar role
    const updated = await prisma.user.update({
        where: { email },
        data: { role },
    });
    console.log(`✅ Role actualizado: ${updated.email} -> ${updated.role}`);
}
main()
    .catch((err) => {
    console.error("❌ Error ejecutando script:", err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
