import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import auth from "./routes/auth.js";
import snacks from "./routes/snacks.js";
import cors from "cors";
const app = express();

dotenv.config();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", auth);
app.use("/api", snacks);

const port = process.env.PORT || 7000;

app.listen(port, () => {
  connectDB();
});
