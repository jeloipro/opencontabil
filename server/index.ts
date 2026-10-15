import { app } from "./app";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

// Servir frontend compilado se existir
const distPath = path.resolve(__dirname, "../frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("==========================================================");
  console.log(`🚀 OpenContabil Phoenix rodando em:`);
  console.log(`   👉 http://localhost:${PORT}`);
  console.log("==========================================================");
});
