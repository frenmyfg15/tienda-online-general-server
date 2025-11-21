"use strict";
// src/utils/errorHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceError = ServiceError;
function ServiceError() {
    return function (_target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (error) {
                console.error("🚨 Error in service:", propertyKey);
                console.error("📌 Arguments:", args);
                console.error("📌 User info:", extractUserInfo(args));
                console.error("📅 Date:", new Date().toISOString());
                console.error("❗ Message:", error?.message || error);
                throw error;
            }
        };
        return descriptor;
    };
}
function extractUserInfo(args) {
    const candidate = args.find((a) => a &&
        (a.userId ||
            a.email ||
            a.id ||
            a.user)) || null;
    if (!candidate)
        return "N/A";
    const user = candidate.user ?? candidate;
    return {
        id: user.userId ?? user.id,
        email: user.email,
        name: user.name,
    };
}
