import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required."],
  },
  usertype: {
    type: String,
    required: [true, "Usertype is required."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required."],
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

const User = model("users", UserSchema);
export default User;
