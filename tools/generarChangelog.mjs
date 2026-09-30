/**
 * Script de Automatización CI/CD: Generador de Changelog y Versionado Semántico
 * Extrae el historial de git, clasifica cambios y actualiza data/version.json y data/changelog.json.
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, '..');
const dirData = path.join(raiz, 'data');
const rutaVersion = path.join(dirData, 'version.json');
const rutaChangelog = path.join(dirData, 'changelog.json');
const rutaPackage = path.join(raiz, 'package.json');

function obtenerCommitsGit() {
  try {
    const res = spawnSync('git', ['log', '--pretty=format:%h%x09%an%x09%ad%x09%s', '--date=short'], {
      cwd: raiz,
      encoding: 'utf8'
    });
    const raw = res.stdout || '';
    return raw.trim().split('\n').filter(Boolean).map(linea => {
      const [hash, autor, fecha, ...resto] = linea.split('\t');
      const mensaje = resto.join('\t');
      return { hash, autor, fecha, mensaje };
    });
  } catch (e) {
    console.warn('No se pudo ejecutar git log:', e.message);
    return [];
  }
}

function clasificarCommit(mensaje) {
  const msg = mensaje.trim();
  if (/^BREAKING:|^💥/i.test(msg)) {
    return { tipo: 'breaking', insignia: '💥 Cambio Mayor', bump: 'major' };
  }
  if (/^feat:|^🚀/i.test(msg)) {
    return { tipo: 'feat', insignia: '🚀 Nueva Funcionalidad', bump: 'minor' };
  }
  if (/^fix:|^🔧/i.test(msg)) {
    return { tipo: 'fix', insignia: '🔧 Corrección', bump: 'patch' };
  }
  if (/^docs:|^📝/i.test(msg)) {
    return { tipo: 'docs', insignia: '📝 Documentación', bump: 'patch' };
  }
  return { tipo: 'chore', insignia: '⚙️ Mantenimiento', bump: 'patch' };
}

function calcularVersion(commits) {
  let major = 1;
  let minor = 0;
  let patch = 0;

  // Analizamos los commits en orden cronológico (los más viejos primero)
  const commitsCronologicos = [...commits].reverse();
  for (const c of commitsCronologicos) {
    const { bump } = clasificarCommit(c.mensaje);
    if (bump === 'major') {
      major += 1;
      minor = 0;
      patch = 0;
    } else if (bump === 'minor') {
      minor += 1;
      patch = 0;
    } else if (bump === 'patch') {
      patch += 1;
    }
  }
  return `${major}.${minor}.${patch}`;
}

function generar() {
  if (!fs.existsSync(dirData)) {
    fs.mkdirSync(dirData, { recursive: true });
  }

  const commits = obtenerCommitsGit();
  const versionCalculada = commits.length > 0 ? calcularVersion(commits) : '1.0.0';

  const commitsFormateados = commits.map(c => {
    const clasificacion = clasificarCommit(c.mensaje);
    const mensajeLimpio = c.mensaje.replace(/^(?:feat|fix|BREAKING|docs|chore):?\s*/i, '').trim();
    return {
      hash: c.hash,
      autor: c.autor,
      fecha: c.fecha,
      tipo: clasificacion.tipo,
      insignia: clasificacion.insignia,
      mensaje: mensajeLimpio || c.mensaje
    };
  });

  const changelogEstructurado = [
    {
      version: `v${versionCalculada}`,
      fecha: commits[0]?.fecha || new Date().toISOString().split('T')[0],
      totalCambios: commitsFormateados.length,
      cambios: commitsFormateados
    }
  ];

  const infoVersion = {
    version: `v${versionCalculada}`,
    actualizado: new Date().toISOString(),
    commitsTotales: commits.length,
    ultimoCommit: commits[0]?.hash || ''
  };

  fs.writeFileSync(rutaVersion, JSON.stringify(infoVersion, null, 2), 'utf8');
  fs.writeFileSync(rutaChangelog, JSON.stringify(changelogEstructurado, null, 2), 'utf8');

  // Sincronizar package.json si existe
  if (fs.existsSync(rutaPackage)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(rutaPackage, 'utf8'));
      pkg.version = versionCalculada;
      fs.writeFileSync(rutaPackage, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    } catch (e) {
      console.warn('No se pudo actualizar package.json:', e.message);
    }
  }

  console.log(`✅ Changelog y Versión (${infoVersion.version}) generados exitosamente.`);
}

generar();
