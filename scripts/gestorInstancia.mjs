/**
 * @file gestorInstancia.mjs
 * @description Gestión de instancia única, soporte para recarga --watch, negociación de puertos y locks efímeros.
 */

import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const NOMBRE_PROYECTO = "panel_academico_utn";
const RUTA_ARCHIVO_LOCK = path.join(os.tmpdir(), `${NOMBRE_PROYECTO}_dev.lock`);

/**
 * Comprueba si un proceso sigue activo en el sistema operativo mediante señal 0.
 *
 * @param {number} pid - Identificador del proceso.
 * @returns {boolean} Verdadero si el proceso está activo.
 */
export function estaProcesoVivo(pid) {
  if (!pid || typeof pid !== "number" || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Analiza el estado del lock efímero diferenciando entre instancia duplicada,
 * reinicio en caliente (--watch) y locks huérfanos.
 *
 * @returns {{ estado: "libre" | "reinicio_watch" | "activo", datos: object | null }}
 */
export function analizarEstadoLock() {
  if (!fs.existsSync(RUTA_ARCHIVO_LOCK)) {
    return { estado: "libre", datos: null };
  }

  try {
    const datos = JSON.parse(fs.readFileSync(RUTA_ARCHIVO_LOCK, "utf-8"));
    const supervisorVivo = estaProcesoVivo(datos.pidSupervisor);
    const workerVivo = estaProcesoVivo(datos.pidWorker);

    if (
      datos.esModoWatch &&
      supervisorVivo &&
      datos.pidSupervisor === process.ppid &&
      datos.pidWorker !== process.pid
    ) {
      return { estado: "reinicio_watch", datos };
    }

    if ((supervisorVivo || workerVivo) && datos.pidWorker !== process.pid) {
      return { estado: "activo", datos };
    }

    fs.unlinkSync(RUTA_ARCHIVO_LOCK);
    return { estado: "libre", datos: null };
  } catch {
    try {
      fs.unlinkSync(RUTA_ARCHIVO_LOCK);
    } catch {}
    return { estado: "libre", datos: null };
  }
}

/**
 * Registra el bloqueo de la sesión activa con su supervisor, worker y puerto.
 *
 * @param {number} puerto - Puerto en el que corre el servidor.
 */
export function registrarLock(puerto) {
  const datos = {
    pidSupervisor: process.ppid || process.pid,
    pidWorker: process.pid,
    esModoWatch: true,
    puerto,
    iniciadoEn: Date.now(),
  };
  fs.writeFileSync(RUTA_ARCHIVO_LOCK, JSON.stringify(datos, null, 2), "utf-8");
}

/**
 * Elimina de manera segura el archivo de bloqueo al cerrar intencionalmente la aplicación.
 */
export function eliminarLock() {
  try {
    if (fs.existsSync(RUTA_ARCHIVO_LOCK)) {
      fs.unlinkSync(RUTA_ARCHIVO_LOCK);
    }
  } catch {}
}

/**
 * Verifica si un puerto TCP específico está disponible en todas las interfaces.
 *
 * @param {number} puerto - Puerto a probar.
 * @returns {Promise<boolean>}
 */
function probarPuertoDisponible(puerto) {
  return new Promise((resolve) => {
    const servidor = net.createServer();
    servidor.once("error", () => resolve(false));
    servidor.once("listening", () => {
      servidor.close(() => resolve(true));
    });
    servidor.listen(puerto, "0.0.0.0");
  });
}

/**
 * Negocia secuencialmente el primer puerto libre a partir del puerto base indicado.
 *
 * @param {number} [puertoBase=8080] - Puerto inicial preferido.
 * @returns {Promise<number>} Puerto disponible confirmado.
 */
export async function negociarPuertoLibre(puertoBase = 8080) {
  let puertoActual = puertoBase;

  while (!(await probarPuertoDisponible(puertoActual))) {
    console.log(
      `⚠️ Puerto ${puertoActual} en uso por otro proceso. Asignando automáticamente puerto ${puertoActual + 1}.`
    );
    puertoActual++;
  }

  return puertoActual;
}

if (process.argv.includes("--verificar")) {
  const { estado, datos } = analizarEstadoLock();
  if (estado === "activo" && datos) {
    console.log(`====================================================`);
    console.log(`⚠️ El entorno de desarrollo ya se encuentra en ejecución.`);
    console.log(`📌 Instancia activa: PID ${datos.pidWorker} en el puerto ${datos.puerto}.`);
    console.log(`Cerrando esta ventana secundaria para evitar duplicados...`);
    console.log(`====================================================`);
    setTimeout(() => {
      process.exit(2);
    }, 1500);
  } else {
    process.exit(0);
  }
}
