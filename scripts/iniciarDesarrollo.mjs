/**
 * @file iniciarDesarrollo.mjs
 * @description Servidor de desarrollo local para Panel Académico UTN con QR, soporte Range y hot-reloading.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import qrcode from "qrcode-terminal";
import { obtenerIpRedLocal } from "./detectorRedLocal.mjs";
import {
  analizarEstadoLock,
  registrarLock,
  eliminarLock,
  negociarPuertoLibre,
} from "./gestorInstancia.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIRECTORIO_RAIZ = path.resolve(__dirname, "..");
const PUERTO_BASE = Number(process.env.PORT) || 8080;

const TIPOS_MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

/**
 * Abre el navegador de forma desacoplada y multiplataforma usando spawn.
 *
 * @param {string} url - Dirección a abrir.
 */
function abrirNavegador(url) {
  const plataforma = process.platform;
  if (plataforma === "win32") {
    spawn("cmd.exe", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
  } else if (plataforma === "darwin") {
    spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
  } else {
    spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
  }
}

/**
 * Despacha un archivo estático con cabeceras anti-caché y soporte de streaming Range.
 */
function despacharArchivo(rutaArchivo, res, req) {
  fs.stat(rutaArchivo, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 No Encontrado");
      return;
    }

    const ext = path.extname(rutaArchivo).toLowerCase();
    const tipoMime = TIPOS_MIME[ext] || "application/octet-stream";
    const rango = req.headers.range;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");

    if (rango) {
      const partes = rango.replace(/bytes=/, "").split("-");
      const inicio = parseInt(partes[0], 10);
      const fin = partes[1] ? parseInt(partes[1], 10) : stats.size - 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${inicio}-${fin}/${stats.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": fin - inicio + 1,
        "Content-Type": tipoMime,
      });
      fs.createReadStream(rutaArchivo, { start: inicio, end: fin }).pipe(res);
      return;
    }

    res.writeHead(200, {
      "Content-Length": stats.size,
      "Content-Type": tipoMime,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(rutaArchivo).pipe(res);
  });
}

const servidor = http.createServer((req, res) => {
  const urlLimpia = decodeURIComponent(req.url.split("?")[0]);
  const rutaRelativa = urlLimpia === "/" ? "index.html" : urlLimpia.replace(/^\/+/, "");
  const rutaAbsoluta = path.resolve(DIRECTORIO_RAIZ, rutaRelativa);

  if (!rutaAbsoluta.startsWith(DIRECTORIO_RAIZ)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Prohibido");
    return;
  }

  fs.stat(rutaAbsoluta, (err, stats) => {
    if (!err && stats.isDirectory()) {
      despacharArchivo(path.join(rutaAbsoluta, "index.html"), res, req);
    } else {
      despacharArchivo(rutaAbsoluta, res, req);
    }
  });
});

async function iniciar() {
  const { estado, datos } = analizarEstadoLock();
  if (estado === "activo") {
    console.log(`⚠️ El entorno de desarrollo ya se encuentra en ejecución en otra ventana.`);
    process.exit(0);
  }

  const esReinicioWatch = estado === "reinicio_watch";
  const puerto =
    esReinicioWatch && datos?.puerto ? datos.puerto : await negociarPuertoLibre(PUERTO_BASE);
  const ipRed = obtenerIpRedLocal();
  const urlLocal = `http://localhost:${puerto}`;
  const urlRed = `http://${ipRed}:${puerto}`;

  servidor.listen(puerto, "0.0.0.0", () => {
    registrarLock(puerto);
    console.log("\n====================================================");
    console.log("🚀 Entorno de desarrollo local - Panel Académico UTN");
    console.log("====================================================");
    console.log(`💻 Local (PC):        ${urlLocal}`);
    console.log(`📱 Red local (Móvil):  ${urlRed}\n`);

    if (ipRed !== "localhost") {
      console.log("📷 Escanea este código QR con tu móvil (misma red Wi-Fi):");
      qrcode.generate(urlRed, { small: true });
    }
    console.log("====================================================\n");

    if (esReinicioWatch) {
      console.log("🔄 Servidor reiniciado automáticamente por cambios en el código.");
    } else {
      abrirNavegador(urlLocal);
    }
  });
}

process.on("SIGINT", () => {
  eliminarLock();
  servidor.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  servidor.close(() => process.exit(0));
});

iniciar();
