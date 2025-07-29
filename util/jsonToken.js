import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const JsonToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SALT, {
    expiresIn: "1d",
  });
};

export const tokenVerify = (token) => {
  return jwt.verify(token, process.env.SALT);
};
