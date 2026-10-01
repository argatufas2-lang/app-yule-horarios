# Radiografía Arquitectónica del Proyecto

Este documento describe la arquitectura global, la estructura de archivos y los componentes activos del sistema de gestión horaria.

---

## 1. Módulos y Componentes de Interfaz de Usuario (UI)

Ubicación: `src/lib/components/`

- **`ActionsView.svelte`**: Vista principal que integra la barra de herramientas, selectores de profesorado/aula, conmutadores de vista y la rejilla horaria principal.
- **`ActionToolbar.svelte`**: Barra de herramientas superior corporativa con controles para cambio de curso, ciclo, opciones de impresión y acceso a modales de administración e importación.
- **`TeacherScheduleGrid.svelte`**: Componente contenedor para la renderización de la cuadrícula horaria de profesorado.
- **`ClassroomScheduleGrid.svelte`**: Componente contenedor para la renderización de la cuadrícula horaria de grupos y aulas.
- **`ScheduleRenderer.svelte`**: Componente encargado de renderizar la tabla de horarios y gestionar la presentación visual de cada celda/sesión.
- **`ScheduleGrid.svelte`**: Componente auxiliar de cuadrícula horaria.
- **`SesionModal.svelte`**: **Modal activo** de edición y creación de sesiones por casilla en la cuadrícula (permite ajustar actividad, clase, aula, rol y duración/posiciones en minutos).
- **`AdminModal.svelte`**: Módulo de administración para gestionar profesores, actividades, aulas y tramos horarios.
- **`ControlJornadaModal.svelte`**: Módulo de control y balance de horas lectivas/no lectivas por profesorado.
- **`import/ImportStagingModal.svelte`**: Modal de ingesta, procesamiento y validación previa (staging) de archivos Excel exportados de aSc Timetables.
- **`import/StagingScheduleGrid.svelte`**: Vista de rejilla previa para la inspección de sesiones importadas en el entorno staging.

---

## 2. Servicios e Integración con Supabase

Ubicación: `src/lib/services/`

- **`supabaseClient.ts`**: Inicialización y configuración del cliente oficial `@supabase/supabase-js`.
- **`scheduleService.ts`**: Consultas y formateo de sesiones, tramos horarios, recuento total y listados de entidades (profesores y aulas).
- **`primaryService.ts`**: Servicios directos de mutación e inserción de sesiones y ajustes de duración en minutos (`ajustes_minutos`).
- **`adminService.ts`**: Funciones CRUD para la gestión de entidades administrativas en Supabase.
- **`importService.ts`**: Operaciones de carga, actualización, implantación definitiva y limpieza de la tabla `sesiones_staging`.
- **`excelImportService.ts`**: Algoritmos de parsing, normalización y extracción de bloques Excel (.xlsx / .xls) de aSc Timetables.
- **`timeCalculationService.ts`**: Lógica de cálculo de resumen de jornada, horas lectivas vs no lectivas y balances de minutos.

---

## 3. Repositorios y Utilidades

- **`src/lib/repositories/scheduleRepository.ts`**: Funciones de persistencia suplementarias para sesiones y relaciones.
- **`src/lib/utils/formatters.ts`**: Funciones auxiliares de formateo visual (`formatJornada`, `formatRol`).
- **`src/lib/constants/calendar.ts`**: Definición de días de la semana y estructuras asociadas al calendario.
- **`src/lib/components/import/excelCellParser.ts`**: Parser de celda individual para separar actividad, clase y grupos a partir del texto extraído.

---

## 4. Estado de Limpieza

- El componente obsoleto `src/lib/components/SessionEditModal.svelte` ha sido retirado del proyecto.
- `SesionModal.svelte` se consolida como la única implementación activa para la edición de sesiones en la cuadrícula.
