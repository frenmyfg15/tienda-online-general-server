import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET || "default_secret";

export const createToken = (payload: object): string => {
  return jwt.sign(payload, SECRET, {
    expiresIn: "7d",
  });
};

export const validateToken = (token: string): any => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};
