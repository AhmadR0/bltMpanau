import express from "express";
import type { Express } from "express";
import cors from "cors"
import authRoutes from "./routes/authRoutes.js";
import wargaRoutes from "./routes/wargaRoutes.js";

const app: Express = express();

app.use(cors({
    origin: "*"
}));

app.use(express.json());


app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/warga", wargaRoutes);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

export default app;
