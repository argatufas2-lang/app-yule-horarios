# INFORME TÉCNICO Y GUÍA DE PROMPTS PARA IA
## Sistema de Gestión de Horarios de Profesorado y Aulas
**Centro:** Angel Ganivet- Santa Lucía, Jacinto Benavente, Vitoria-Gasteiz  
**Optimizado para:** Google AI Studio (API Free / Contexto Limitado)

---

## 1. DIRECTIVAS BÁSICAS Y SEGURIDAD (ÓRDENES CRÍTICAS)

- **ACCIÓN NO DESTRUCTIVA:** Mantener intactos datos reales, perfiles, jornadas, horarios existentes y `AjustesMinutos`.
- **PROHIBIDO:** No ejecutar ni sugerir jamás `crearHorariosProfesorado()`. Función desactivada en V5.
- **SINCRONIZACIÓN:** Usar `sincronizarConfiguracion()` o `estabilizarSistema()` tras cambios en configuración o profesorado.
- **CÓDIGO DE COLORES UNIFICADO (`colorDiferencia_`):**
  - Verde (`#D9EAD3`): Horas exactas/cumplidas.
  - Amarillo (`#FFF2CC`): Por debajo del objetivo.
  - Rojo (`#FCE5CD`): Por encima del objetivo.
- **MODIFICACIÓN DE CÓDIGO:** Reutilizar y modificar funciones existentes. No duplicar lógica.
- **FORMATO DE TIEMPO:** Siempre formato humano (`14h 45min`, `17 min`). Evitar decimales (`14.75h`).

---

## 2. ARQUITECTURA DEL PROYECTO

### A. Entorno Google Apps Script / Sheets
- **`Código.js`**: Script principal (~417 KB) con la lógica completa del sistema.
- **`appsscript.json`**: Configuración runtime V8, zona horaria `Europe/Madrid`.
- **`AjustesMinutos`**: Gestión de sesiones parciales.
- **`Impresion`**: Vista de impresión limpia individual.
- **`Aulas` / `Aula XX`**: Pestañas consolidadas por aula generadas automáticamente.

### B. Módulo de Migración y WebApp Standalone (`EXPORT_PARA_NUEVA_APP/`)
- **`export_supabase_schema_and_data.sql`**: Script SQL con 9 tablas PostgreSQL/Supabase e inserción idempotente de los 34 profesores reales.
- **`export_data_complete.json`**: Dump JSON completo de la base de datos.
- **`csv/`**: Archivos CSV individuales por tabla.
- **`importador_asc_standalone.html` / `.js`**: Importador PDF aSc desacoplado de Google Sheets (`window.open`).
- **`import_asc_pdf_utils.js`**: Módulo de integración con Supabase.

---

## 3. MODELO DE DATOS Y TABLAS (SUPABASE / SHEETS)

1. **`profesorado`**: `id`, `nombre`, `perfil` (`Tutor`/`Especialista`), `clase_base`, `jornada`, `observaciones`, `dossier_seleccionado`.
2. **`configuracion`**:
   - `tutorLectivas` (Col A): Matematika, Gazte, Euskara, Inguru, Tutoretza, Plastika, Balioak, etc.
   - `especialistaLectivas` (Col B): Ingelesa, HF, Musika, Robotika, Eusle, PT.
   - `comunesLectivas` (Col C): Laguntza, Atsedenaldia.
   - `noLectivas` (Col D): Koordinazioa, Zikloa, Maila, Gurasoak, Formakuntza, Lan Pertsonala, BAT, OBK, IKT, Beste batzuk, Pedagogika, Irratsaioa, Exklusiba.
   - `clases` (Col E): 1A, 1B, 2A, 2B, etc.
   - `profesorado` (Col U): Lista editable de docentes.
3. **`ajustes_minutos`**: `profesor`, `dia`, `franja`, `minutos_reales`, `parte_sesion` (`Desde el inicio`/`Hasta el final`), `maximo`, `comprobacion` (`OK`/`SIN ACTIVIDAD`).
4. **`aulas` & `horarios_aulas`**: Mapeo consolidado por aula. Varios docentes en una celda = APOYO/PT/Laguntza (NO es conflicto).
5. **`horarios_profesorado`**: Matriz 5x10 por profesor (Días x Franjas).
6. **`webapp_notas`**, **`webapp_cambios`**, **`asc_meta_grupos`**: Notas, log de cambios/auditoría y metadatos de importación aSc.

---

## 4. ESTRUCTURA TEMPORAL Y REGLAS DE NEGOCIO

### Días (5)
`Astelehena`, `Asteartea`, `Asteazkena`, `Osteguna`, `Ostirala`

### Franjas Horarias (10)
1. `09:00 - 09:30` (30 min)
2. `09:30 - 10:15` (45 min)
3. `10:15 - 11:00` (45 min)
4. `11:00 - 11:30` (30 min - `Atsedenaldia` / Recreo)
5. `11:30 - 12:15` (45 min)
6. `12:15 - 13:00` (45 min)
7. `13:00 - 14:00` (60 min)
8. `14:00 - 15:00` (60 min)
9. `15:00 - 15:45` (45 min)
10. `15:45 - 16:30` (45 min)

### Lógica Automática Mediodía (13:00 - 15:00) para Jornada Completa
- **Función Clave:** `aplicarDisponibilidadMediodia_(s, nombre, reglaNoLectiva)`
- **Lunes:** 13:00-14:00 → `Maila` | 14:00-15:00 → `BAZKARIA`
- **Martes:** 13:00-14:00 → `Zikloa` | 14:00-15:00 → `BAZKARIA`
- **Miércoles:** 13:00-14:00 → `Formakuntza` | 14:00-15:00 → `Formakuntza`
- **Jueves:** 13:00-14:00 → `Gurasoak` | 14:00-15:00 → `BAZKARIA`
- **Viernes:** 13:00-15:00 → Sin sesión asignada (libre).
- **Nota Computable:** `BAZKARIA` NUNCA suma a las horas de jornada laboral.
- **Exklusiba:** Reuniones fuera del horario lectivo presencial.

---

## 5. FORMATO DE VISTAS E IMPRESIÓN

### Vista Individual (`Impresion`)
- Cabecera limpia sin datos administrativos internos.
- Resumen final en euskera:
  - `Eskola-ordutegia: Xh Ymin egiten du  Zh Wmin dagozkio`
  - `Eskolaz kanpokoa: Xh Ymin egiten du  Zh Wmin dagozkio`
  - `Guztira: Xh Ymin egiten du  Zh Wmin dagozkio`
- Intervalos diarios de presencia real abajo de cada día (ej: `9:00-12:40`, `9:00-13:00 / 15:30-16:30`).

### Vista de Aula (`Aula XX`)
- Formato por celda:
  ```
  ASIGNATURA (Mayúsculas, negrita, tamaño mayor)
  Profesor/a (Centrado, tamaño menor)
  ```
- Si hay varios profesores (ej. Tutor + PT/Laguntza), se concatenan dentro de la misma celda.
- Las sesiones parciales de `AjustesMinutos` se muestran como sesión completa en el aula.

---

## 6. COMANDOS RÁPIDOS PARA INSTRUIR A LA IA (PROMPTS DE ACCIÓN)

A continuación se indican órdenes cortas para indicarle a cualquier IA qué hacer sin gastar tokens en contexto:

- **Para sincronizar cambios de profesores/clases:**
  > "Ejecuta únicamente `sincronizarConfiguracion()`. No modifiques horarios ni ejecutes `crearHorariosProfesorado()`."

- **Para corregir diferencias de horas o colores:**
  > "Revisa la función `actualizarResumenProfesor_` y `pintarDiferencia_` asegurando usar `colorDiferencia_()` (verde=correcto, amarillo=bajo, rojo=alto)."

- **Para ajustar la lógica de mediodía (13:00-15:00):**
  > "Modifica la función `aplicarDisponibilidadMediodia_()`. No crees una función nueva. BAZKARIA no computa horas."

- **Para modificar el cálculo con AjustesMinutos:**
  > "Asegúrate de actualizar `sincronizarAjustesMinutos_()` calculando los minutos reales sobre la franja correspondiente sin borrar la celda."

- **Para exportar datos a Supabase/Nueva App:**
  > "Utiliza la función `exportarASupabaseDesdeGoogleSheets()` en `Código.js` o aplica el script `export_supabase_schema_and_data.sql`."
