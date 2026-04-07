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

// Serve folder uploads agar gambar bisa diakses dari Frontend via URL
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/warga", wargaRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

export default app;
