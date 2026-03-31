import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma";
import clinicasRouter from "./routes/clinicas";
import emailRouter from "./routes/email";

const app = express();
const port = Number(process.env.PORT || 3000);

// ─── Middlewares ────────────────────────────────────────────────
app.use(express.json());

// CORS simples (ajuste as origens conforme seu front-end)
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  if (_req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// ─── Rotas ──────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: "ok", database: "up" });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      database: "down",
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
});

app.use("/clinicas", clinicasRouter);
app.use("/email", emailRouter);

// ─── Inicialização ─────────────────────────────────────────────
const server = app.listen(port, () => {
  console.log(`🚀 API online em http://localhost:${port}`);
  console.log(`   GET  /health`);
  console.log(`   GET  /clinicas`);
  console.log(`   GET  /clinicas/:id`);
  console.log(`   PATCH /clinicas/:id`);
  console.log(`   GET  /clinicas/stats/overview`);
  console.log(`   POST /email/send`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
