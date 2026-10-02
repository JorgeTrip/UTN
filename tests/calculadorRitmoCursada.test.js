/**
 * Pruebas Unitarias TDD: Calculador de Ritmo de Cursada y Proyecciones Temporales
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import '../js/calculadorRitmoCursada.js';

const {
  calcularRitmoHistorico,
  calcularEstimacionGraduacion,
  generarDiagnosticoRitmo
} = globalThis.calculadorRitmoCursada;

describe('Calculador de Ritmo de Cursada (TDD)', () => {
  describe('calcularRitmoHistorico', () => {
    it('debe calcular el promedio de materias aprobadas por año transcurrido', () => {
      const ritmo = calcularRitmoHistorico(2023, 16, 2026);
      assert.strictEqual(ritmo, 4);
    });

    it('debe considerar 1 año mínimo si ingresó el mismo año actual para evitar división por cero', () => {
      const ritmo = calcularRitmoHistorico(2026, 4, 2026);
      assert.strictEqual(ritmo, 4);
    });

    it('debe retornar 0 si no tiene materias aprobadas', () => {
      const ritmo = calcularRitmoHistorico(2024, 0, 2026);
      assert.strictEqual(ritmo, 0);
    });

    it('debe redondear a un decimal representativo', () => {
      const ritmo = calcularRitmoHistorico(2024, 10, 2026);
      assert.strictEqual(ritmo, 3.3);
    });
  });

  describe('calcularEstimacionGraduacion', () => {
    it('debe proyectar años según el ritmo y respetar la cadena crítica troncal', () => {
      const resultado = calcularEstimacionGraduacion({
        materiasAprobadas: [{ id: '082021' }],
        materiasEnCurso: [],
        ritmoPorAnio: 5,
        anioActual: 2026,
        totalMateriasPlan: 38
      });

      assert.strictEqual(resultado.materiasPendientes, 37);
      assert.strictEqual(resultado.eslabonesTroncalesMinimos, 4);
      assert.strictEqual(resultado.aniosRestantes, 8);
      assert.strictEqual(resultado.anioEstimadoGraduacion, 2034);
    });

    it('debe predominar la cadena crítica si el ritmo supera la velocidad troncal', () => {
      const resultado = calcularEstimacionGraduacion({
        materiasAprobadas: [{ id: '082021' }],
        materiasEnCurso: [],
        ritmoPorAnio: 8,
        anioActual: 2026,
        totalMateriasPlan: 5
      });

      assert.strictEqual(resultado.materiasPendientes, 4);
      assert.strictEqual(resultado.eslabonesTroncalesMinimos, 4);
      assert.strictEqual(resultado.aniosRestantes, 4);
      assert.strictEqual(resultado.anioEstimadoGraduacion, 2030);
    });

    it('debe retornar 0 años restantes si el plan está completado', () => {
      const materias38 = Array.from({ length: 38 }, (_, i) => ({ id: `mat_${i}` }));
      const resultado = calcularEstimacionGraduacion({
        materiasAprobadas: materias38,
        materiasEnCurso: [],
        ritmoPorAnio: 6,
        anioActual: 2026,
        totalMateriasPlan: 38
      });

      assert.strictEqual(resultado.materiasPendientes, 0);
      assert.strictEqual(resultado.aniosRestantes, 0);
      assert.strictEqual(resultado.anioEstimadoGraduacion, 2026);
    });
  });

  describe('generarDiagnosticoRitmo', () => {
    it('debe explicar cuando la cadena crítica es el factor limitante', () => {
      const texto = generarDiagnosticoRitmo(8, 4, 2);
      assert.ok(texto.includes('cadena correlativa troncal'));
    });

    it('debe explicar cuando el volumen total de materias es el factor limitante', () => {
      const texto = generarDiagnosticoRitmo(4, 2, 6);
      assert.ok(texto.includes('volumen global'));
    });
  });
});
