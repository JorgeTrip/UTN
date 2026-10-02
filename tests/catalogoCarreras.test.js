/**
 * Pruebas Unitarias TDD: Catálogo y Registro Multi-Carrera de UTN
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import '../js/catalogoCarreras.js';

const {
  obtenerCarrera,
  listarCarreras,
  registrarCarrera
} = globalThis.catalogoCarreras;

describe('Catálogo de Carreras UTN (TDD)', () => {
  it('debe listar al menos la carrera de Ingeniería en Sistemas de Información', () => {
    const carreras = listarCarreras();
    assert.ok(Array.isArray(carreras));
    assert.ok(carreras.length >= 1);
    const sistemas = carreras.find(c => c.id === 'sistemas');
    assert.ok(sistemas);
    assert.strictEqual(sistemas.nombre, 'Ingeniería en Sistemas de Información');
    assert.ok(sistemas.planes.includes('K23'));
  });

  it('debe obtener la información de una carrera por su identificador', () => {
    const info = obtenerCarrera('sistemas');
    assert.ok(info);
    assert.strictEqual(info.id, 'sistemas');
    assert.ok(info.cadenaTroncal.length >= 4);
    assert.strictEqual(info.totalMateriasK23, 38);
  });

  it('debe permitir registrar dinámicamente nuevas especialidades de UTN', () => {
    registrarCarrera({
      id: 'quimica',
      nombre: 'Ingeniería Química',
      planes: ['2023'],
      totalMaterias: 42,
      cadenaTroncal: []
    });

    const info = obtenerCarrera('quimica');
    assert.ok(info);
    assert.strictEqual(info.nombre, 'Ingeniería Química');
  });

  it('debe retornar carrera de Sistemas por defecto si se solicita un ID desconocido', () => {
    const defaultCarrera = obtenerCarrera('desconocida');
    assert.strictEqual(defaultCarrera.id, 'sistemas');
  });
});
