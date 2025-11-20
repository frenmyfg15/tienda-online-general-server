// src/utils/errorHandler.ts

export function ServiceError() {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error: any) {
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

function extractUserInfo(args: any[]) {
  const candidate =
    args.find(
      (a: any) =>
        a &&
        (a.userId ||
          a.email ||
          a.id ||
          a.user)
    ) || null;

  if (!candidate) return "N/A";

  const user = candidate.user ?? candidate;

  return {
    id: user.userId ?? user.id,
    email: user.email,
    name: user.name,
  };
}
