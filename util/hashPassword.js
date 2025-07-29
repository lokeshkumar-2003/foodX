import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(Number(process.env.ROUNDS));
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const hashCompare = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
