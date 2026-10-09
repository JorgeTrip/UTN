# 🎓 Dashboard Académico · UTN FRBA

[![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.46.2-indigo.svg)](#)
[![Institución](https://img.shields.io/badge/UTN%20FRBA-Ingenier%C3%ADa%20en%20Sistemas-amber.svg)](https://www.frba.utn.edu.ar/)
[![Firebase](https://img.shields.io/badge/Backend-Firebase%20Auth%20%26%20Firestore-orange.svg)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/IA-Google%20Gemini-purple.svg)](#)
[![Vitest](https://img.shields.io/badge/Pruebas-Vitest%20%7C%20Playwright-emerald.svg)](https://vitest.dev/)

Plataforma académica integral y simulador de cursada para estudiantes de la Universidad Tecnológica Nacional (UTN FRBA), con seguimiento de correlativas, análisis de avance, integración con SIU Guaraní y planificador estratégico con IA.

---

## ✨ Características Principales

- **Visualización y Malla de Correlativas:** Mapa interactivo de materias de la carrera (Planes K08 y K23) con estado de aprobación, cursada y correlatividades desbloqueadas.
- **Importador Inteligente SIU Guaraní:** Parser de historia académica, finales y horarios directamente desde el portal oficial del estudiante.
- **Simulador de Ritmo y Proyección:** Cálculo automatizado de promedio, ritmo de cursada, peso de materias y estimación de fecha de graduación.
- **Planificador de Cursada con IA:** Recomendación personalizada de combinaciones óptimas de materias por cuatrimestre mediante Google Gemini (`servicioGeminiEstrategia.js`).
- **Persistencia en la Nube y Modo Offline:** Autenticación y sincronización en tiempo real con Firebase (Firestore), junto a importación/exportación soberana de copias de seguridad en formato JSON.
- **Integración con Google Calendar:** Exportación de comisiones y horarios de cursada a calendarios digitales.
- **Experiencia Móvil de Alta Fidelidad:** Diseño adaptable con barras de navegación inferiores (*Bottom Tab Bar*), controles táctiles y alternancia de tema claro/oscuro.

---

## 🛠️ Stack Tecnológico

- **Frontend:** HTML5, CSS3 moderno (arquitectura modular de hojas de estilo), JavaScript ES Modules.
- **Backend as a Service:** Firebase Authentication y Cloud Firestore.
- **Servicios de IA:** Google Gemini API.
- **Testing & Automatización:** Vitest, Playwright, `dependency-cruiser`.
- **Despliegue:** Netlify (`netlify.toml`).

---

## 💻 Instalación y Uso Local

### Prerrequisitos
- Node.js versión 20 o superior.

### Pasos
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor local de desarrollo
npm run dev
# O hacer doble clic en Iniciar.bat o iniciarDesarrollo.bat

# 3. Ejecutar pruebas unitarias
npm test

# 4. Ejecutar pruebas E2E con Playwright
npm run e2e

# 5. Ejecutar auditoría de gobernanza de código
npm run auditar
```

---

## 👥 Autoría

- **Autor:** **Jorge O. Tripodi**
