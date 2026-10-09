import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import qrcode from "qrcode-terminal";

/**
 * Servidor de desarrollo local para UTN FRBA - Panel Académico.
 * Sirve archivos estáticos con módulos ES, soporte CORS y streaming,
 * muestra código QR en consola y abre automáticamente el navegador.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIRECTORIO_RAIZ = path.resolve(__dirname, "..");

const PUERTO = process.env.PORT || 8080;
const URL_LOCAL = `http://localhost:${PUERTO}`;
const IP_RED = obtenerIpRedLocal();
const URL_RED = `http://${IP_RED}:${PUERTO}`;

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
    ".txt": "text/plain; charset=utf-8"
};

/**
 * Detecta la dirección IPv4 local del equipo en la red (LAN/Wi-Fi).
 *
 * @returns {string} Dirección IP o 'localhost'.
 */
function obtenerIpRedLocal() {
    const interfaces = os.networkInterfaces();
    const patronesExcluidos = /vethernet|virtual|vbox|vmware|wsl|pseudo|loopback/i;
    let ipCandidata = null;

    for (const [nombre, lista] of Object.entries(interfaces)) {
        if (!lista || patronesExcluidos.test(nombre)) continue;
        for (const detalle of lista) {
            if (detalle.family === "IPv4" && !detalle.internal) {
                if (detalle.address.startsWith("192.168.56.")) continue;
                if (detalle.address.startsWith("192.168.") || detalle.address.startsWith("10.")) {
                    return detalle.address;
                }
                if (!ipCandidata) ipCandidata = detalle.address;
            }
        }
    }
    return ipCandidata || "localhost";
}

/**
 * Abre el navegador predeterminado en la URL especificada.
 *
 * @param {string} url - Dirección a abrir.
 */
function abrirNavegador(url) {
    const comando = process.platform === "win32"
        ? `start "" "${url}"`
        : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
    exec(comando);
}

/**
 * Despacha un archivo estático al cliente HTTP.
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

        if (rango) {
            const partes = rango.replace(/bytes=/, "").split("-");
            const inicio = parseInt(partes[0], 10);
            const fin = partes[1] ? parseInt(partes[1], 10) : stats.size - 1;
            res.writeHead(206, {
                "Content-Range": `bytes ${inicio}-${fin}/${stats.size}`,
                "Accept-Ranges": "bytes",
                "Content-Length": fin - inicio + 1,
                "Content-Type": tipoMime
            });
            fs.createReadStream(rutaArchivo, { start: inicio, end: fin }).pipe(res);
            return;
        }

        res.writeHead(200, {
            "Content-Length": stats.size,
            "Content-Type": tipoMime,
            "Accept-Ranges": "bytes"
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

servidor.listen(PUERTO, "0.0.0.0", () => {
    console.log("\n====================================================");
    console.log("🚀 Entorno de desarrollo local - Panel Académico UTN");
    console.log("====================================================");
    console.log(`💻 Local (PC):        ${URL_LOCAL}`);
    console.log(`📱 Red local (Móvil):  ${URL_RED}\n`);

    if (IP_RED !== "localhost") {
        console.log("📷 Escanea este código QR con tu móvil (debe estar conectado en la misma red Wi-Fi que esta PC):");
        qrcode.generate(URL_RED, { small: true });
    }
    console.log("====================================================\n");

    abrirNavegador(URL_LOCAL);
});

process.on("SIGINT", () => {
    servidor.close(() => process.exit(0));
});
