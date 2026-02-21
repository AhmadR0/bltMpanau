import express from "express";
import type { Express } from "express";
import authRoutes from "./routes/authRoutes.js";
import wargaRoutes from "./routes/wargaRoutes.js";

const app: Express = express();

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/warga", wargaRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

export default app;
