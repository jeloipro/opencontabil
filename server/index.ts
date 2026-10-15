import { app } from "./app";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let PORT = Number(process.env.PORT) || 3000;

// Servir frontend compilado se existir
const distPath = path.resolve(__dirname, "../frontend/dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log("==========================================================");
    console.log(`  OpenContabil Phoenix rodando com sucesso em:`);
    console.log(`  -> http://localhost:${port}`);
    console.log("==========================================================");
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Porta ${port} ocupada, tentando porta ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("Erro no servidor:", err);
    }
  });
}

startServer(PORT);
