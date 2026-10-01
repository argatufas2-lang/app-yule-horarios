import { c as create_ssr_component, v as validate_component, d as createEventDispatcher, e as escape, f as add_attribute, h as each, i as onDestroy, p as public_env } from './index.js-BvSy97Pb.js';
import { createClient } from '@supabase/supabase-js';

const PrintSingleButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  return `<button type="button" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs" title="Imprimir el horario actualmente visible en A4 horizontal" data-svelte-h="svelte-axvaux">🖨️ Imprimir Horario</button>`;
});
function getCleanName(item) {
  const raw = item.nombre || item.labelText || "";
  return raw.split("-")[0].trim().toUpperCase();
}
const PrintBulkModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let itemsKey;
  createEventDispatcher();
  let { isOpen = false } = $$props;
  let { activeTab = "profesorado" } = $$props;
  let { items = [] } = $$props;
  let selectedIds = [];
  let lastInitializedItemsKey = "";
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.activeTab === void 0 && $$bindings.activeTab && activeTab !== void 0) $$bindings.activeTab(activeTab);
  if ($$props.items === void 0 && $$bindings.items && items !== void 0) $$bindings.items(items);
  itemsKey = items.map((i) => i.id).join(",");
  {
    if (isOpen && itemsKey !== lastInitializedItemsKey) {
      selectedIds = items.map((item) => item.id);
      lastInitializedItemsKey = itemsKey;
    }
  }
  {
    if (!isOpen) {
      lastInitializedItemsKey = "";
    }
  }
  return `${isOpen ? ` <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden" role="dialog" aria-modal="true"><div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700 w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden"> <div class="px-5 py-4 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between bg-slate-50/50 dark:bg-gray-800/80"><div><h3 class="text-base font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2" data-svelte-h="svelte-37992q">📑 Impresión Masiva de Horarios</h3> <p class="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Modo actual: <strong class="text-sky-600 dark:text-sky-400 uppercase">${escape(activeTab === "profesorado" ? "Profesorado" : "Aulas y Grupos")}</strong></p></div> <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 text-lg font-bold p-1 rounded-lg" data-svelte-h="svelte-5bfvsl">✕</button></div>  <div class="px-5 py-2.5 bg-slate-100/70 dark:bg-gray-700/50 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between text-xs"><span class="font-semibold text-slate-700 dark:text-gray-300">Seleccionados: <strong class="text-sky-700 dark:text-sky-400">${escape(selectedIds.length)}</strong> / ${escape(items.length)}</span> <div class="flex items-center gap-2"><button type="button" class="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800 transition-colors" data-svelte-h="svelte-wzxenj">Seleccionar todo</button> <button type="button" class="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-bold border border-slate-300 dark:border-gray-500 transition-colors" data-svelte-h="svelte-1kebhqx">Deseleccionar todo</button></div></div>  <div class="p-4 overflow-y-auto flex-1">${items.length === 0 ? `<p class="text-xs text-slate-500 text-center py-6" data-svelte-h="svelte-10kap1z">No hay elementos disponibles para seleccionar.</p>` : `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${each(items, (item) => {
    return `<label class="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700/40 p-2 rounded-lg border border-slate-100 dark:border-gray-700/60 transition-colors"><input type="checkbox" ${selectedIds.includes(item.id) ? "checked" : ""} class="w-4 h-4 text-sky-600 rounded-md border-slate-300 dark:border-gray-600 focus:ring-sky-500 shrink-0"> <span class="text-sm font-bold text-slate-800 dark:text-gray-100 uppercase tracking-tight truncate">${escape(getCleanName(item))}</span> </label>`;
  })}</div>`}</div>  <div class="px-5 py-3 border-t border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/80 flex items-center justify-end gap-2"><button type="button" class="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-300 transition-colors" data-svelte-h="svelte-pvfw6x">Cancelar</button> <button type="button" ${selectedIds.length === 0 ? "disabled" : ""} class="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1.5">🖨️ Imprimir Selección (${escape(selectedIds.length)})</button></div></div></div>` : ``}`;
});
const css = {
  code: "@media print{@page{size:A4 landscape;margin:4mm 6mm}body{background-color:#ffffff !important;color:#000000 !important;margin:0 !important;padding:0 !important;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;height:100vh !important;overflow:hidden !important}.print-area{width:100% !important;max-width:100% !important;margin:0 auto !important;padding:0 !important;display:flex !important;flex-direction:column !important;justify-content:space-between !important;height:100% !important;max-height:190mm !important;page-break-inside:avoid !important;-moz-column-break-inside:avoid !important;break-inside:avoid !important}}",
  map: `{"version":3,"file":"ActionToolbar.svelte","sources":["ActionToolbar.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { createEventDispatcher } from \\"svelte\\";\\nimport PrintSingleButton from \\"./PrintSingleButton.svelte\\";\\nimport PrintBulkModal from \\"./PrintBulkModal.svelte\\";\\nconst dispatch = createEventDispatcher();\\nexport let selectedCurso = \\"2026-2027\\";\\nexport let selectedCiclo = \\"LH\\";\\nexport let totalProfesorado = 0;\\nexport let selectedProfesor = \\"\\";\\nexport let profesoresDisponibles = [];\\nexport let activeTab = \\"profesorado\\";\\n$: ;\\nlet isBulkPrintModalOpen = false;\\nfunction toggleCiclo(ciclo) {\\n  selectedCiclo = ciclo;\\n  dispatch(\\"selectCiclo\\", ciclo);\\n}\\nfunction handleCursoChange(event) {\\n  const target = event.target;\\n  dispatch(\\"selectCurso\\", target.value);\\n}\\nfunction handlePrintSingle() {\\n  dispatch(\\"imprimirHorario\\");\\n}\\nfunction openBulkModal() {\\n  dispatch(\\"imprimirTodos\\");\\n  isBulkPrintModalOpen = true;\\n}\\nfunction handleExecuteBulkPrint(event) {\\n  dispatch(\\"executeBulkPrint\\", event.detail);\\n}\\nfunction handleImageError(event) {\\n  const target = event.target;\\n  if (target) {\\n    target.style.display = \\"none\\";\\n  }\\n}\\n<\/script>\\r\\n\\r\\n<style>\\r\\n    @media print {\\r\\n        @page {\\r\\n            size: A4 landscape;\\r\\n            margin: 4mm 6mm;\\r\\n        }\\r\\n\\r\\n        :global(body) {\\r\\n            background-color: #ffffff !important;\\r\\n            color: #000000 !important;\\r\\n            margin: 0 !important;\\r\\n            padding: 0 !important;\\r\\n            -webkit-print-color-adjust: exact !important;\\r\\n            print-color-adjust: exact !important;\\r\\n            height: 100vh !important;\\r\\n            overflow: hidden !important;\\r\\n        }\\r\\n\\r\\n        :global(.print-area) {\\r\\n            width: 100% !important;\\r\\n            max-width: 100% !important;\\r\\n            margin: 0 auto !important;\\r\\n            padding: 0 !important;\\r\\n            display: flex !important;\\r\\n            flex-direction: column !important;\\r\\n            justify-content: space-between !important;\\r\\n            height: 100% !important;\\r\\n            max-height: 190mm !important;\\r\\n            page-break-inside: avoid !important;\\r\\n            -moz-column-break-inside: avoid !important;\\r\\n                 break-inside: avoid !important;\\r\\n        }\\r\\n    }\\r\\n</style>\\r\\n\\r\\n<header class=\\"bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-xs\\">\\r\\n    \\r\\n    <!-- 1. Cabecera Principal Centrada con Título Más Grande -->\\r\\n    <div class=\\"max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-5 flex flex-col items-center justify-center text-center border-b border-slate-100 dark:border-gray-700/60\\">\\r\\n        <div class=\\"flex flex-col sm:flex-row items-center justify-center gap-3\\">\\r\\n            <div class=\\"h-10 sm:h-12 flex items-center justify-center overflow-hidden shrink-0\\">\\r\\n                <img src=\\"/Logo.png\\" alt=\\"Ganivet Logo\\" class=\\"h-10 sm:h-12 w-auto object-contain\\" on:error={handleImageError} />\\r\\n            </div>\\r\\n            <h1 class=\\"text-3xl sm:text-4xl font-black text-slate-900 dark:text-gray-100 tracking-tight font-sans\\">\\r\\n                Gestión de Horarios\\r\\n            </h1>\\r\\n        </div>\\r\\n        <p class=\\"text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium mt-1\\">\\r\\n            Colegio Público Ganivet / Ganivet Ikastetxea\\r\\n        </p>\\r\\n    </div>\\r\\n\\r\\n    <!-- 2. Barra Superior de Contexto Alineada con el Bloque Inferior -->\\r\\n    <div class=\\"py-2 border-b border-amber-200/60 dark:border-amber-900/30 bg-amber-50/80 dark:bg-amber-950/20\\">\\r\\n        <div class=\\"max-w-7xl mx-auto px-2 sm:px-4 md:px-6 text-xs text-slate-700 dark:text-gray-300 flex flex-wrap items-center justify-between gap-3\\">\\r\\n            <div class=\\"flex flex-wrap items-center gap-3\\">\\r\\n                <span class=\\"inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-gray-200\\">\\r\\n                    <span class=\\"w-2.5 h-2.5 rounded-full bg-emerald-500\\"></span>\\r\\n                    Ciclo Activo: <strong class=\\"text-sky-800 dark:text-sky-300 ml-1\\">{selectedCiclo === 'LH' ? 'Primaria (LH)' : 'Infantil (HH)'}</strong>\\r\\n                </span>\\r\\n                <span class=\\"text-amber-300 dark:text-amber-800\\">|</span>\\r\\n                <span class=\\"inline-flex items-center gap-1 font-medium\\">\\r\\n                    📅 Curso: <strong class=\\"text-slate-900 dark:text-gray-100\\">{selectedCurso}</strong>\\r\\n                </span>\\r\\n                <span class=\\"text-amber-300 dark:text-amber-800\\">|</span>\\r\\n                <span class=\\"inline-flex items-center gap-1 font-medium\\">\\r\\n                    👥 Total Profesorado: <strong class=\\"text-sky-800 dark:text-sky-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 font-bold\\">{totalProfesorado}</strong>\\r\\n                </span>\\r\\n            </div>\\r\\n\\r\\n            <!-- Botones de Alternancia de Ciclo Integrados en la Franja -->\\r\\n            <div class=\\"flex items-center bg-white dark:bg-gray-800 p-0.5 rounded-full border border-amber-200 dark:border-amber-900/40 shadow-xs\\">\\r\\n                <button\\r\\n                    type=\\"button\\"\\r\\n                    on:click={() => toggleCiclo('HH')}\\r\\n                    class=\\"px-3 py-1 text-[11px] font-bold rounded-full transition-all {selectedCiclo === 'HH' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-300 hover:text-slate-900'}\\"\\r\\n                >\\r\\n                    Infantil (HH)\\r\\n                </button>\\r\\n                <button\\r\\n                    type=\\"button\\"\\r\\n                    on:click={() => toggleCiclo('LH')}\\r\\n                    class=\\"px-3 py-1 text-[11px] font-bold rounded-full transition-all {selectedCiclo === 'LH' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-gray-300 hover:text-slate-900'}\\"\\r\\n                >\\r\\n                    Primaria (LH)\\r\\n                </button>\\r\\n            </div>\\r\\n        </div>\\r\\n    </div>\\r\\n\\r\\n    <!-- 3. Barra de Acciones Corporativa Alineada con el Bloque Inferior -->\\r\\n    <div class=\\"py-2.5 bg-slate-50/60 dark:bg-gray-800/50\\">\\r\\n        <div class=\\"max-w-7xl mx-auto px-2 sm:px-4 md:px-6 flex flex-wrap items-center justify-between gap-2.5\\">\\r\\n            \\r\\n            <!-- Desplegable de Curso -->\\r\\n            <div class=\\"flex items-center space-x-1.5 shrink-0\\">\\r\\n                <label for=\\"cursoSelect\\" class=\\"text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider\\">\\r\\n                    Curso:\\r\\n                </label>\\r\\n                <select\\r\\n                    id=\\"cursoSelect\\"\\r\\n                    value={selectedCurso}\\r\\n                    on:change={handleCursoChange}\\r\\n                    class=\\"bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 text-xs font-bold rounded-md border border-slate-300 dark:border-gray-600 px-2.5 py-1 focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-xs\\"\\r\\n                >\\r\\n                    <option value=\\"2026-2027\\">2026-2027</option>\\r\\n                </select>\\r\\n            </div>\\r\\n\\r\\n            <!-- Grupo de Botones de Acción Modulares -->\\r\\n            <div class=\\"flex flex-wrap items-center gap-1.5\\">\\r\\n                <!-- Fin de Curso (LH) -->\\r\\n                <button \\r\\n                    type=\\"button\\"\\r\\n                    on:click={() => dispatch('finDeCurso')}\\r\\n                    class=\\"inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-xs\\"\\r\\n                >\\r\\n                    🎓 Fin de Curso (LH)\\r\\n                </button>\\r\\n\\r\\n                <!-- Control de Jornada -->\\r\\n                <button \\r\\n                    type=\\"button\\"\\r\\n                    on:click={() => dispatch('controlJornada')}\\r\\n                    class=\\"inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-sky-700 hover:bg-sky-800 active:bg-sky-900 transition-colors shadow-xs\\"\\r\\n                >\\r\\n                    ⏱️ Control de Jornada\\r\\n                </button>\\r\\n\\r\\n                <!-- Módulo de Impresión Individual Encapsulado -->\\r\\n                <PrintSingleButton on:print={handlePrintSingle} />\\r\\n\\r\\n                <!-- Imprimir Todos (Abre Modal de Selección) -->\\r\\n                <button \\r\\n                    type=\\"button\\"\\r\\n                    on:click={openBulkModal}\\r\\n                    class=\\"inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-xs\\"\\r\\n                >\\r\\n                    📑 Imprimir Todos\\r\\n                </button>\\r\\n\\r\\n                <!-- Administración -->\\r\\n                <button \\r\\n                    type=\\"button\\"\\r\\n                    on:click={() => dispatch('administracion')}\\r\\n                    class=\\"inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-slate-700 hover:bg-slate-800 active:bg-slate-900 transition-colors shadow-xs\\"\\r\\n                >\\r\\n                    ⚙️ Administración\\r\\n                </button>\\r\\n\\r\\n                <!-- Importar Excel / Staging -->\\r\\n                <button \\r\\n                    type=\\"button\\"\\r\\n                    on:click={() => dispatch('importarAsc')}\\r\\n                    class=\\"inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-sky-500 hover:bg-sky-600 active:bg-sky-700 transition-colors shadow-xs\\"\\r\\n                >\\r\\n                    📄 Importar Excel / Staging\\r\\n                </button>\\r\\n            </div>\\r\\n        </div>\\r\\n    </div>\\r\\n</header>\\r\\n\\r\\n<!-- Componente Modal Modular de Impresión Masiva -->\\r\\n<PrintBulkModal\\r\\n    bind:isOpen={isBulkPrintModalOpen}\\r\\n    {activeTab}\\r\\n    items={profesoresDisponibles}\\r\\n    on:executeBulkPrint={handleExecuteBulkPrint}\\r\\n/>\\r\\n"],"names":[],"mappings":"AAuCI,OAAO,KAAM,CACT,KAAM,CACF,IAAI,CAAE,EAAE,CAAC,SAAS,CAClB,MAAM,CAAE,GAAG,CAAC,GAChB,CAEQ,IAAM,CACV,gBAAgB,CAAE,OAAO,CAAC,UAAU,CACpC,KAAK,CAAE,OAAO,CAAC,UAAU,CACzB,MAAM,CAAE,CAAC,CAAC,UAAU,CACpB,OAAO,CAAE,CAAC,CAAC,UAAU,CACrB,0BAA0B,CAAE,KAAK,CAAC,UAAU,CAC5C,kBAAkB,CAAE,KAAK,CAAC,UAAU,CACpC,MAAM,CAAE,KAAK,CAAC,UAAU,CACxB,QAAQ,CAAE,MAAM,CAAC,UACrB,CAEQ,WAAa,CACjB,KAAK,CAAE,IAAI,CAAC,UAAU,CACtB,SAAS,CAAE,IAAI,CAAC,UAAU,CAC1B,MAAM,CAAE,CAAC,CAAC,IAAI,CAAC,UAAU,CACzB,OAAO,CAAE,CAAC,CAAC,UAAU,CACrB,OAAO,CAAE,IAAI,CAAC,UAAU,CACxB,cAAc,CAAE,MAAM,CAAC,UAAU,CACjC,eAAe,CAAE,aAAa,CAAC,UAAU,CACzC,MAAM,CAAE,IAAI,CAAC,UAAU,CACvB,UAAU,CAAE,KAAK,CAAC,UAAU,CAC5B,iBAAiB,CAAE,KAAK,CAAC,UAAU,CACnC,wBAAwB,CAAE,KAAK,CAAC,UAAU,CACrC,YAAY,CAAE,KAAK,CAAC,UAC7B,CACJ"}`
};
const ActionToolbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  let { selectedCurso = "2026-2027" } = $$props;
  let { selectedCiclo = "LH" } = $$props;
  let { totalProfesorado = 0 } = $$props;
  let { selectedProfesor = "" } = $$props;
  let { profesoresDisponibles = [] } = $$props;
  let { activeTab = "profesorado" } = $$props;
  let isBulkPrintModalOpen = false;
  if ($$props.selectedCurso === void 0 && $$bindings.selectedCurso && selectedCurso !== void 0) $$bindings.selectedCurso(selectedCurso);
  if ($$props.selectedCiclo === void 0 && $$bindings.selectedCiclo && selectedCiclo !== void 0) $$bindings.selectedCiclo(selectedCiclo);
  if ($$props.totalProfesorado === void 0 && $$bindings.totalProfesorado && totalProfesorado !== void 0) $$bindings.totalProfesorado(totalProfesorado);
  if ($$props.selectedProfesor === void 0 && $$bindings.selectedProfesor && selectedProfesor !== void 0) $$bindings.selectedProfesor(selectedProfesor);
  if ($$props.profesoresDisponibles === void 0 && $$bindings.profesoresDisponibles && profesoresDisponibles !== void 0) $$bindings.profesoresDisponibles(profesoresDisponibles);
  if ($$props.activeTab === void 0 && $$bindings.activeTab && activeTab !== void 0) $$bindings.activeTab(activeTab);
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<header class="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-xs"> <div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-5 flex flex-col items-center justify-center text-center border-b border-slate-100 dark:border-gray-700/60"><div class="flex flex-col sm:flex-row items-center justify-center gap-3"><div class="h-10 sm:h-12 flex items-center justify-center overflow-hidden shrink-0"><img src="/Logo.png" alt="Ganivet Logo" class="h-10 sm:h-12 w-auto object-contain"></div> <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-gray-100 tracking-tight font-sans" data-svelte-h="svelte-19m32zh">Gestión de Horarios</h1></div> <p class="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium mt-1" data-svelte-h="svelte-168ix14">Colegio Público Ganivet / Ganivet Ikastetxea</p></div>  <div class="py-2 border-b border-amber-200/60 dark:border-amber-900/30 bg-amber-50/80 dark:bg-amber-950/20"><div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 text-xs text-slate-700 dark:text-gray-300 flex flex-wrap items-center justify-between gap-3"><div class="flex flex-wrap items-center gap-3"><span class="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-gray-200"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Ciclo Activo: <strong class="text-sky-800 dark:text-sky-300 ml-1">${escape(selectedCiclo === "LH" ? "Primaria (LH)" : "Infantil (HH)")}</strong></span> <span class="text-amber-300 dark:text-amber-800" data-svelte-h="svelte-19qqa58">|</span> <span class="inline-flex items-center gap-1 font-medium">📅 Curso: <strong class="text-slate-900 dark:text-gray-100">${escape(selectedCurso)}</strong></span> <span class="text-amber-300 dark:text-amber-800" data-svelte-h="svelte-19qqa58">|</span> <span class="inline-flex items-center gap-1 font-medium">👥 Total Profesorado: <strong class="text-sky-800 dark:text-sky-300 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 font-bold">${escape(totalProfesorado)}</strong></span></div>  <div class="flex items-center bg-white dark:bg-gray-800 p-0.5 rounded-full border border-amber-200 dark:border-amber-900/40 shadow-xs"><button type="button" class="${"px-3 py-1 text-[11px] font-bold rounded-full transition-all " + escape(
      selectedCiclo === "HH" ? "bg-sky-600 text-white shadow-xs" : "text-slate-600 dark:text-gray-300 hover:text-slate-900",
      true
    )}">Infantil (HH)</button> <button type="button" class="${"px-3 py-1 text-[11px] font-bold rounded-full transition-all " + escape(
      selectedCiclo === "LH" ? "bg-sky-600 text-white shadow-xs" : "text-slate-600 dark:text-gray-300 hover:text-slate-900",
      true
    )}">Primaria (LH)</button></div></div></div>  <div class="py-2.5 bg-slate-50/60 dark:bg-gray-800/50"><div class="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 flex flex-wrap items-center justify-between gap-2.5"> <div class="flex items-center space-x-1.5 shrink-0"><label for="cursoSelect" class="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider" data-svelte-h="svelte-12tfmqx">Curso:</label> <select id="cursoSelect"${add_attribute("value", selectedCurso, 0)} class="bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 text-xs font-bold rounded-md border border-slate-300 dark:border-gray-600 px-2.5 py-1 focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-xs"><option value="2026-2027" data-svelte-h="svelte-7fptfy">2026-2027</option></select></div>  <div class="flex flex-wrap items-center gap-1.5"> <button type="button" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-xs" data-svelte-h="svelte-1au6itd">🎓 Fin de Curso (LH)</button>  <button type="button" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-sky-700 hover:bg-sky-800 active:bg-sky-900 transition-colors shadow-xs" data-svelte-h="svelte-15vvwl9">⏱️ Control de Jornada</button>  ${validate_component(PrintSingleButton, "PrintSingleButton").$$render($$result, {}, {}, {})}  <button type="button" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors shadow-xs" data-svelte-h="svelte-1fvgwlc">📑 Imprimir Todos</button>  <button type="button" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-slate-700 hover:bg-slate-800 active:bg-slate-900 transition-colors shadow-xs" data-svelte-h="svelte-1rx4hl4">⚙️ Administración</button>  <button type="button" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-sky-500 hover:bg-sky-600 active:bg-sky-700 transition-colors shadow-xs" data-svelte-h="svelte-12250f1">📄 Importar Excel / Staging</button></div></div></div></header>  ${validate_component(PrintBulkModal, "PrintBulkModal").$$render(
      $$result,
      {
        activeTab,
        items: profesoresDisponibles,
        isOpen: isBulkPrintModalOpen
      },
      {
        isOpen: ($$value) => {
          isBulkPrintModalOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const __vite_import_meta_env__ = {};
const supabaseUrl = public_env.PUBLIC_SUPABASE_URL || (typeof import.meta !== "undefined" && __vite_import_meta_env__ ? "https://gecshkodnighzkghjlgw.supabase.co" : void 0);
const supabaseAnonKey = public_env.PUBLIC_SUPABASE_ANON_KEY || (typeof import.meta !== "undefined" && __vite_import_meta_env__ ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlY3Noa29kbmlnaHprZ2hqbGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NTI2MjcsImV4cCI6MjEwNDEyODYyN30.RAXVd7RMXZCEyPkw9A-KFG_Mor3yit58dilDM3iAmWE" : void 0);
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Faltan las variables de entorno de Supabase (PUBLIC_SUPABASE_* o VITE_SUPABASE_*).");
}
const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);
async function getAdminProfesores(curso) {
  const { data, error } = await supabase.from("profesores").select("*").eq("curso_escolar", curso).order("nombre", { ascending: true });
  if (error) throw new Error(`Error al cargar profesores: ${error.message}`);
  return data || [];
}
async function getAdminAulas(curso) {
  const { data, error } = await supabase.from("aulas").select("*").eq("curso_escolar", curso).order("nombre", { ascending: true });
  if (error) throw new Error(`Error al cargar aulas: ${error.message}`);
  return data || [];
}
const AdminModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { selectedCurso = "2026-2027" } = $$props;
  createEventDispatcher();
  let activeTab = "profesores";
  let loading = false;
  let errorMessage = "";
  let profesores = [];
  const opcionesPerfil = ["Tutor", "Especialista", "Consultor", "Orientador", "PT", "AL"];
  const opcionesJornada = ["Jornada completa", "2/3 de jornada", "1/2 jornada", "1/3 de jornada"];
  let newProfesor = {
    nombre: ""
  };
  async function loadData() {
    loading = true;
    errorMessage = "";
    try {
      if (activeTab === "profesores") {
        profesores = await getAdminProfesores(selectedCurso);
      }
    } catch (e) {
      errorMessage = e.message || "Error al cargar datos";
    } finally {
      loading = false;
    }
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.selectedCurso === void 0 && $$bindings.selectedCurso && selectedCurso !== void 0) $$bindings.selectedCurso(selectedCurso);
  {
    if (isOpen && selectedCurso) {
      loadData();
    }
  }
  return `${isOpen ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6"><div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-6xl h-[90vh] max-h-[920px] flex flex-col overflow-hidden transition-all"> <div class="px-8 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0"><div class="flex items-center space-x-3"><span class="text-2xl" data-svelte-h="svelte-ilodbd">⚙️</span> <div><h2 class="text-xl font-black tracking-wide" data-svelte-h="svelte-1hxr4xt">Módulo de Administración</h2> <p class="text-xs text-slate-400 font-medium">Gestión de datos de configuración general — Curso ${escape(selectedCurso)}</p></div></div> <button type="button" class="text-slate-400 hover:text-white text-2xl font-bold p-2 rounded-xl hover:bg-slate-800 transition-colors" title="Cerrar ventana" data-svelte-h="svelte-9m407e">✕</button></div>  <div class="flex border-b border-slate-200 dark:border-gray-700 bg-slate-100/80 dark:bg-gray-900 px-8 pt-4 space-x-3 overflow-x-auto shrink-0"><button type="button" class="${"px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-2 " + escape(
    "border-sky-600 bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-xs",
    true
  )}"><span data-svelte-h="svelte-1l1j359">👨‍🏫</span> Profesorado</button> <button type="button" class="${"px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-2 " + escape(
    "border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 hover:bg-slate-200/50",
    true
  )}"><span data-svelte-h="svelte-1rsry1">📚</span> Asignaturas / Actividades</button> <button type="button" class="${"px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-2 " + escape(
    "border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 hover:bg-slate-200/50",
    true
  )}"><span data-svelte-h="svelte-78zbxn">🏫</span> Aulas y Espacios</button> <button type="button" class="${"px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-2 " + escape(
    "border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 hover:bg-slate-200/50",
    true
  )}"><span data-svelte-h="svelte-1ms50i2">⏱️</span> Tramos Horarios Primaria</button></div>  ${errorMessage ? `<div class="mx-8 mt-5 p-4 bg-red-100 text-red-800 border border-red-300 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0"><span class="text-base" data-svelte-h="svelte-rk4thn">⚠️</span> ${escape(errorMessage)}</div>` : ``} ${``}  <div class="flex-1 overflow-y-auto p-8 space-y-6">${loading ? `<div class="text-center py-20 text-slate-500 font-semibold text-sm" data-svelte-h="svelte-162hfft">Cargando datos de Supabase...</div>` : `${` <div class="bg-slate-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-slate-200 dark:border-gray-700 flex flex-wrap items-end gap-4 shadow-xs"><div class="flex-1 min-w-[240px]"><label for="new-prof-nombre" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5" data-svelte-h="svelte-1adkekx">Nombre completo</label> <input id="new-prof-nombre" type="text" placeholder="Ej. Ana Garcia Lopez" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-medium focus:ring-2 focus:ring-sky-500"${add_attribute("value", newProfesor.nombre, 0)}></div> <div class="w-52"><label for="new-prof-perfil" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5" data-svelte-h="svelte-124knuc">Perfil</label> <select id="new-prof-perfil" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500">${each(opcionesPerfil, (item) => {
    return `<option${add_attribute("value", item, 0)}>${escape(item)}</option>`;
  })}</select></div> <div class="w-52"><label for="new-prof-jornada" class="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5" data-svelte-h="svelte-6yq9vm">Jornada</label> <select id="new-prof-jornada" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500">${each(opcionesJornada, (item) => {
    return `<option${add_attribute("value", item, 0)}>${escape(item)}</option>`;
  })}</select></div> <button type="button" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0" data-svelte-h="svelte-5jwcx4">+ Añadir Profesor</button></div>  <div class="rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden shadow-xs"><table class="w-full text-xs text-left border-collapse"><thead class="bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-200 uppercase font-extrabold tracking-wider" data-svelte-h="svelte-1q8pjj2"><tr><th class="p-3.5 border-b border-slate-200 dark:border-gray-600">Nombre</th> <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-52">Perfil</th> <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-52">Jornada</th> <th class="p-3.5 border-b border-slate-200 dark:border-gray-600 w-24 text-center">Acciones</th></tr></thead> <tbody class="divide-y divide-slate-200 dark:divide-gray-700 bg-white dark:bg-gray-800">${each(profesores, (p) => {
    return `<tr class="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"><td class="p-2 border-r border-slate-100 dark:border-gray-700"><input type="text" class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-bold transition-all focus:outline-hidden"${add_attribute("value", p.nombre, 0)}></td> <td class="p-2 border-r border-slate-100 dark:border-gray-700"><select class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-semibold transition-all focus:outline-hidden cursor-pointer">${each(opcionesPerfil, (item) => {
      return `<option${add_attribute("value", item, 0)}>${escape(item)}</option>`;
    })}${p.perfil && !opcionesPerfil.includes(p.perfil) ? `<option${add_attribute("value", p.perfil, 0)}>${escape(p.perfil)}</option>` : ``}</select></td> <td class="p-2 border-r border-slate-100 dark:border-gray-700"><select class="w-full p-2 border border-slate-200 dark:border-gray-700 focus:border-sky-500 rounded-lg text-xs bg-slate-50/50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 dark:text-white font-semibold transition-all focus:outline-hidden cursor-pointer">${each(opcionesJornada, (item) => {
      return `<option${add_attribute("value", item, 0)}>${escape(item)}</option>`;
    })}${p.jornada && !opcionesJornada.includes(p.jornada) ? `<option${add_attribute("value", p.jornada, 0)}>${escape(p.jornada)}</option>` : ``}</select></td> <td class="p-2 text-center"><button type="button" class="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors font-bold cursor-pointer" title="Eliminar profesor" data-svelte-h="svelte-16f8cgq">🗑️</button></td> </tr>`;
  })}</tbody></table></div>`}`}</div>  <div class="px-8 py-4 bg-slate-100 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 flex justify-end shrink-0"><button type="button" class="px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs" data-svelte-h="svelte-z22iib">Cerrar Módulo</button></div></div></div>` : ``}`;
});
const SesionModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let diaEuskera;
  let activeAulas;
  let actividadesFiltradas;
  let { isOpen = false } = $$props;
  let { profesorNombre = "" } = $$props;
  let { dia = null } = $$props;
  let { franja = null } = $$props;
  let { diaNombre = "" } = $$props;
  let { franjaNombre = "" } = $$props;
  let { sesionData = {} } = $$props;
  let { actividadesDisponibles = [] } = $$props;
  let { aulasDisponibles = [] } = $$props;
  let { maxMinutosFranja = 60 } = $$props;
  let { ajusteMinutos = 60 } = $$props;
  let { ajusteParte = "inicio" } = $$props;
  createEventDispatcher();
  const euskaraDays = {
    "Lunes": "Astelehena",
    "Martes": "Asteartea",
    "Miércoles": "Asteazkena",
    "Jueves": "Osteguna",
    "Viernes": "Ostirala",
    "Sábado": "Larunbata",
    "Domingo": "Igandea"
  };
  let tipoLectiva = "lectiva";
  let actividad = "";
  let loadedAulas = [];
  async function fetchAulasFromSupabase() {
    try {
      const data = await getAdminAulas("2026-2027");
      if (data) {
        loadedAulas = data.map((a) => ({ id: a.id, nombre: a.nombre }));
      }
    } catch (e) {
      console.error("Error cargando aulas directamente en SesionModal:", e);
    }
  }
  let lastOpenKey = null;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.profesorNombre === void 0 && $$bindings.profesorNombre && profesorNombre !== void 0) $$bindings.profesorNombre(profesorNombre);
  if ($$props.dia === void 0 && $$bindings.dia && dia !== void 0) $$bindings.dia(dia);
  if ($$props.franja === void 0 && $$bindings.franja && franja !== void 0) $$bindings.franja(franja);
  if ($$props.diaNombre === void 0 && $$bindings.diaNombre && diaNombre !== void 0) $$bindings.diaNombre(diaNombre);
  if ($$props.franjaNombre === void 0 && $$bindings.franjaNombre && franjaNombre !== void 0) $$bindings.franjaNombre(franjaNombre);
  if ($$props.sesionData === void 0 && $$bindings.sesionData && sesionData !== void 0) $$bindings.sesionData(sesionData);
  if ($$props.actividadesDisponibles === void 0 && $$bindings.actividadesDisponibles && actividadesDisponibles !== void 0) $$bindings.actividadesDisponibles(actividadesDisponibles);
  if ($$props.aulasDisponibles === void 0 && $$bindings.aulasDisponibles && aulasDisponibles !== void 0) $$bindings.aulasDisponibles(aulasDisponibles);
  if ($$props.maxMinutosFranja === void 0 && $$bindings.maxMinutosFranja && maxMinutosFranja !== void 0) $$bindings.maxMinutosFranja(maxMinutosFranja);
  if ($$props.ajusteMinutos === void 0 && $$bindings.ajusteMinutos && ajusteMinutos !== void 0) $$bindings.ajusteMinutos(ajusteMinutos);
  if ($$props.ajusteParte === void 0 && $$bindings.ajusteParte && ajusteParte !== void 0) $$bindings.ajusteParte(ajusteParte);
  diaEuskera = euskaraDays[diaNombre] || diaNombre;
  activeAulas = aulasDisponibles && aulasDisponibles.length > 0 ? aulasDisponibles : loadedAulas;
  {
    {
      const currentKey = isOpen ? `${sesionData?.id || ""}_${dia}_${franja}` : null;
      if (isOpen && currentKey !== lastOpenKey) {
        lastOpenKey = currentKey;
        if (!aulasDisponibles || aulasDisponibles.length === 0) {
          fetchAulasFromSupabase();
        }
        if (sesionData) {
          const actNombre = sesionData.actividad || "";
          sesionData.rol_aula || "";
          sesionData.aula || "";
          if (sesionData.es_lectiva !== void 0) {
            tipoLectiva = sesionData.es_lectiva ? "lectiva" : "no_lectiva";
          } else if (actNombre) {
            const foundAct = actividadesDisponibles.find((a) => a.nombre.toLowerCase().trim() === actNombre.toLowerCase().trim());
            if (foundAct && foundAct.es_lectiva !== void 0) {
              tipoLectiva = foundAct.es_lectiva ? "lectiva" : "no_lectiva";
            } else {
              tipoLectiva = "lectiva";
            }
          } else {
            tipoLectiva = "lectiva";
          }
          actividad = actNombre;
          tipoLectiva === "no_lectiva" ? "" : sesionData.clase || "";
        }
      } else if (!isOpen) {
        lastOpenKey = null;
      }
    }
  }
  actividadesFiltradas = actividadesDisponibles.filter((act) => {
    if (act.es_lectiva === void 0) return true;
    return tipoLectiva === "lectiva" ? act.es_lectiva : !act.es_lectiva;
  });
  return `${isOpen ? `<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" role="button" tabindex="-1"><div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-lg overflow-hidden flex flex-col"> <div class="px-6 py-4 bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between"><div><h3 class="text-lg font-bold text-slate-800 dark:text-gray-100">${escape(profesorNombre ? profesorNombre : sesionData?.id ? "Editar Sesión" : "Nueva Sesión")}</h3> <p class="text-xs font-semibold text-sky-700 dark:text-sky-400">${escape(diaEuskera)} ${escape(franjaNombre ? `• ${franjaNombre}` : "")}</p></div> <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold p-1 rounded-lg transition-colors" data-svelte-h="svelte-1icc6c">×</button></div>  <form class="p-6 space-y-4 text-sm"> <div><span class="block font-semibold text-slate-700 dark:text-gray-300 mb-1.5" data-svelte-h="svelte-1g1o102">Mota / Tipo de Actividad</span> <div class="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-gray-700/60 p-1 rounded-lg border border-slate-200 dark:border-gray-600"><button type="button" class="${"py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 " + escape(
    tipoLectiva === "lectiva" ? "bg-sky-600 text-white shadow-xs" : "text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600",
    true
  )}">📚 Lectiva (Irakaskuntza)</button> <button type="button" class="${"py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 " + escape(
    tipoLectiva === "no_lectiva" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600",
    true
  )}">📝 No Lectiva (Bestelakoak)</button></div></div>  <div><label for="actividad" class="block font-semibold text-slate-700 dark:text-gray-300 mb-1">Actividad / Asignatura (${escape(tipoLectiva === "lectiva" ? "Lectiva" : "No Lectiva")})</label> ${actividadesFiltradas.length > 0 ? `<select id="actividad" class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2.5 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer"><option value="" data-svelte-h="svelte-1anpca3">-- Seleccionar Actividad --</option>${each(actividadesFiltradas, (act) => {
    return `<option${add_attribute("value", act.nombre, 0)}>${escape(act.nombre)}</option>`;
  })}</select>` : `<input type="text" id="actividad"${add_attribute(
    "placeholder",
    tipoLectiva === "lectiva" ? "Ej. Matematika" : "Ej. Tutoretza / Guardia",
    0
  )} class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2.5 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500"${add_attribute("value", actividad, 0)}>`}</div>  <div><label for="clase" class="block font-semibold text-slate-700 dark:text-gray-300 mb-1">Grupo / Clase ${escape(tipoLectiva === "no_lectiva" ? "(No aplica en No Lectivas)" : "")}</label> ${tipoLectiva === "no_lectiva" ? `<input type="text" id="clase" value="" disabled placeholder="Sin grupo asignado" class="w-full bg-slate-100 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600 rounded-lg p-2.5 text-slate-400 dark:text-gray-500 cursor-not-allowed italic">` : `<select id="clase" class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2.5 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer"><option value="" data-svelte-h="svelte-vbi9zc">-- Seleccionar Grupo / Clase --</option>${each(activeAulas, (aulaItem) => {
    return `<option${add_attribute("value", aulaItem.nombre, 0)}>${escape(aulaItem.nombre)}</option>`;
  })}</select>`}</div>  <div><label for="rol_aula" class="block font-semibold text-slate-700 dark:text-gray-300 mb-1" data-svelte-h="svelte-1o4owve">Rol (Rola)</label> <select id="rol_aula" class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2.5 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer"><option value="" data-svelte-h="svelte-73dbli">-- Aukeratu Rola / Seleccionar Rol --</option><option value="Principal" data-svelte-h="svelte-1ajk36u">Principal</option><option value="PT" data-svelte-h="svelte-1cjwa1a">PT</option><option value="Laguntza" data-svelte-h="svelte-f0q21q">Laguntza</option><option value="Eusle" data-svelte-h="svelte-uo818a">Eusle</option><option value="Hezitzaile" data-svelte-h="svelte-11cfbda">Hezitzaile</option></select></div>  <div class="pt-3 border-t border-slate-200 dark:border-gray-700 space-y-2"><span class="block text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider" data-svelte-h="svelte-4r0ekw">⏱️ Ajuste de Duración y Posición</span> <div class="grid grid-cols-2 gap-3"><div><label for="ajusteMinutosInput" class="block font-semibold text-slate-700 dark:text-gray-300 mb-1">Minutos (máx. ${escape(maxMinutosFranja)}):</label> <input id="ajusteMinutosInput" type="number" min="1"${add_attribute("max", maxMinutosFranja, 0)} class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 font-medium"${add_attribute("value", ajusteMinutos, 0)}></div> <div><label for="ajusteParteSelect" class="block font-semibold text-slate-700 dark:text-gray-300 mb-1" data-svelte-h="svelte-4wj6cm">Posición (Parte):</label> <select id="ajusteParteSelect" class="w-full bg-slate-50 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg p-2 text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 font-medium cursor-pointer"><option value="inicio" data-svelte-h="svelte-q2hl0a">Desde el inicio</option><option value="final" data-svelte-h="svelte-1har4u8">Hasta el final</option></select></div></div></div>  <div class="pt-4 border-t border-slate-200 dark:border-gray-700 flex items-center justify-between">${sesionData?.id ? `<button type="button" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition-colors" data-svelte-h="svelte-13kzyne">Eliminar Sesión</button>` : `<div></div>`} <div class="flex items-center gap-2"><button type="button" class="px-4 py-2 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-lg font-semibold text-xs transition-colors" data-svelte-h="svelte-rfyjpr">Cancelar</button> <button type="submit" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs" data-svelte-h="svelte-9yrmz1">Guardar</button></div></div></form></div></div>` : ``}`;
});
function formatJornada(jornadaRaw) {
  if (!jornadaRaw) return "JC";
  const jLower = jornadaRaw.toLowerCase().trim();
  if (jLower.includes("completa") || jLower.includes("100") || jLower.includes("1/1") || jLower === "jc" || jLower === "completo") {
    return "JC";
  }
  return jornadaRaw;
}
function fallbackTimeSlotsProfesorado() {
  return [
    { orden: 0, time: "09:00 - 09:30", label: "1ª Franja", type: "lectiva" },
    { orden: 1, time: "09:30 - 10:15", label: "2ª Franja", type: "lectiva" },
    { orden: 2, time: "10:15 - 11:00", label: "3ª Franja", type: "lectiva" },
    { orden: 3, time: "11:00 - 11:30", label: "ATSEDENALDIA", type: "recreo" },
    { orden: 4, time: "11:30 - 12:15", label: "4ª Franja", type: "lectiva" },
    { orden: 5, time: "12:15 - 13:00", label: "5ª Franja", type: "lectiva" },
    { orden: 6, time: "13:00 - 14:00", label: "6ª Franja", type: "lectiva" },
    { orden: 7, time: "14:00 - 15:00", label: "BAZKARIA", type: "comedor" },
    { orden: 8, time: "15:00 - 15:45", label: "7ª Franja", type: "lectiva" },
    { orden: 9, time: "15:45 - 16:30", label: "8ª Franja", type: "lectiva" }
  ];
}
const daysOfWeek = [
  { id: 0, name: "Astelehena" },
  { id: 1, name: "Asteartea" },
  { id: 2, name: "Asteazkena" },
  { id: 3, name: "Osteguna" },
  { id: 4, name: "Ostirala" }
];
const ScheduleRenderer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { teacherId = "" } = $$props;
  let { classroomId = "" } = $$props;
  let { selectedEntityId = "" } = $$props;
  let { gridData = {} } = $$props;
  let { activeSlots = [] } = $$props;
  let { isJornadaCompleta = false } = $$props;
  let { showDebug = false } = $$props;
  let { getSession } = $$props;
  let { onCellClick = () => {
  } } = $$props;
  if ($$props.teacherId === void 0 && $$bindings.teacherId && teacherId !== void 0) $$bindings.teacherId(teacherId);
  if ($$props.classroomId === void 0 && $$bindings.classroomId && classroomId !== void 0) $$bindings.classroomId(classroomId);
  if ($$props.selectedEntityId === void 0 && $$bindings.selectedEntityId && selectedEntityId !== void 0) $$bindings.selectedEntityId(selectedEntityId);
  if ($$props.gridData === void 0 && $$bindings.gridData && gridData !== void 0) $$bindings.gridData(gridData);
  if ($$props.activeSlots === void 0 && $$bindings.activeSlots && activeSlots !== void 0) $$bindings.activeSlots(activeSlots);
  if ($$props.isJornadaCompleta === void 0 && $$bindings.isJornadaCompleta && isJornadaCompleta !== void 0) $$bindings.isJornadaCompleta(isJornadaCompleta);
  if ($$props.showDebug === void 0 && $$bindings.showDebug && showDebug !== void 0) $$bindings.showDebug(showDebug);
  if ($$props.getSession === void 0 && $$bindings.getSession && getSession !== void 0) $$bindings.getSession(getSession);
  if ($$props.onCellClick === void 0 && $$bindings.onCellClick && onCellClick !== void 0) $$bindings.onCellClick(onCellClick);
  return `  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-slate-300 dark:border-gray-600 overflow-hidden print:border print:border-black print:shadow-none print:rounded-none"><div class="overflow-x-auto"><table class="w-full border-collapse border-2 border-slate-300 dark:border-gray-600 text-center text-xs md:text-sm print:border print:border-black print:text-[10px]"><thead><tr class="bg-sky-100 dark:bg-sky-950/70 text-sky-950 dark:text-sky-100 border-b-2 border-slate-300 dark:border-gray-600 font-bold print:border-b print:border-black print:bg-sky-50"><th class="p-3 border-r-2 border-slate-300 dark:border-gray-600 w-40 font-extrabold text-sky-900 dark:text-sky-200 text-base print:p-1 print:text-[10px] print:w-24 print:border-r print:border-black" data-svelte-h="svelte-s30lz5">Ordua</th> ${each(daysOfWeek, (day) => {
    return `<th class="p-3 border-r-2 border-slate-300 dark:border-gray-600 min-w-[140px] print:p-1 print:min-w-0 print:border-r print:border-black"><span class="block text-lg font-black text-sky-900 dark:text-sky-100 tracking-wide print:text-[11px] print:font-bold">${escape(day.name)}</span> </th>`;
  })}</tr></thead> <tbody class="divide-y-2 divide-slate-300 dark:divide-gray-600 print:divide-y print:divide-black"><tr class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black"><td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-200/70 dark:bg-gray-700 font-bold text-base text-slate-800 dark:text-slate-100 whitespace-nowrap print:p-0.5 print:text-[9px] print:border-r print:border-black" data-svelte-h="svelte-1apmipw">📌 Presencia / Zaintza</td> ${each(daysOfWeek, (day) => {
    return `<td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 text-xs font-semibold text-sky-800 dark:text-sky-300 bg-slate-50 dark:bg-slate-800/60 print:p-0.5 print:text-[9px] print:border-r print:border-black" data-svelte-h="svelte-4c6qjq">09:00 - 16:30 (4h 30m)
                        </td>`;
  })}</tr> ${each(activeSlots, (slot) => {
    let isRecreo = slot.type === "recreo" || slot.orden === 3 || slot.time.includes("11:00 - 11:30"), isComedor = slot.type === "comedor" || slot.orden === 7 || slot.time.includes("14:00 - 15:00");
    return `  <tr class="border-b-2 border-slate-300 dark:border-gray-600 print:border-b print:border-black"><td class="p-2.5 border-r-2 border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/30 font-bold text-base text-slate-700 dark:text-gray-200 whitespace-nowrap print:p-0.5 print:text-[9px] print:border-r print:border-black">${escape(slot.time)}</td> ${each(daysOfWeek, (day) => {
      let session = getSession(gridData, teacherId, day.id, slot.orden);
      return ` <td class="${"p-1.5 border-r-2 border-slate-300 dark:border-gray-600 h-16 align-middle transition-colors relative print:p-0.5 print:h-9 print:border-r print:border-black cursor-pointer hover:bg-slate-100/60 dark:hover:bg-gray-700/40 " + escape(
        !session && (isRecreo || isComedor) ? "bg-emerald-100/70 dark:bg-emerald-950/40" : "",
        true
      )}" role="button" tabindex="0"${add_attribute(
        "title",
        showDebug ? `[DEBUG] Día: ${day.id} | Franja: ${slot.orden} | Asignatura: ${session?.actividad || "Ninguna"} | Clase: ${session?.clase || session?.aula || "Ninguna"}` : "Haz clic para editar la sesión",
        0
      )}>${session ? `<div class="flex flex-col items-center justify-center space-y-0.5"><span class="block font-black text-slate-900 dark:text-gray-100 text-sm uppercase tracking-wide print:text-[9px]">${escape(session.actividad?.toUpperCase() || "")}</span> ${session.clase || session.aula ? `<span class="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase print:text-[8px]">${escape((session.clase || session.aula)?.toUpperCase() || "")} </span>` : ``} </div>` : `${isRecreo ? `<span class="block text-center text-xs tracking-wider uppercase font-extrabold text-emerald-900 dark:text-emerald-200 print:text-[8px]" data-svelte-h="svelte-12qq2at">ATSEDENALDIA
                                    </span>` : `${isComedor ? `<span class="block text-center text-xs tracking-wider uppercase font-extrabold text-emerald-900 dark:text-emerald-200 print:text-[8px]" data-svelte-h="svelte-kprzt7">BAZKARIA
                                    </span>` : ``}`}`} ${showDebug ? `<div class="mt-1 text-[9px] font-mono leading-tight bg-amber-100/90 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100 p-1 rounded-sm border border-amber-400/80 text-left space-y-0.5 shadow-xs print:hidden"><div><strong class="font-bold" data-svelte-h="svelte-1903ytw">Día:</strong> ${escape(day.id)} | <strong class="font-bold" data-svelte-h="svelte-1ie4cea">Franja:</strong> ${escape(slot.orden)}</div> <div><strong class="font-bold" data-svelte-h="svelte-13uru0e">Act:</strong> ${escape(session?.actividad || "---")}</div> <div><strong class="font-bold" data-svelte-h="svelte-1y7l71g">Clase:</strong> ${escape(session?.clase || session?.aula || "---")}</div> <div class="truncate text-[8px] text-amber-800 dark:text-amber-300"><strong class="font-bold" data-svelte-h="svelte-1p2s8ut">ID:</strong> ${escape(session?.id || "sin_sesion")}</div> </div>` : ``} </td>`;
    })} </tr>`;
  })}</tbody></table></div></div>`;
});
const TeacherScheduleGrid = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let targetId;
  let activeSlots;
  let { selectedEntityId = "" } = $$props;
  let { teacherId = "" } = $$props;
  let { classroomId = "" } = $$props;
  let { gridData = {} } = $$props;
  let { timeSlots = [] } = $$props;
  let { isJornadaCompleta = false } = $$props;
  let { showDebug = false } = $$props;
  let { onCellClick = () => {
  } } = $$props;
  function getSession(gridObj, tId, dayId, slotOrden) {
    if (!gridObj) return void 0;
    const activeId = tId || targetId || selectedEntityId;
    const grid = activeId ? gridObj[activeId] : void 0;
    if (!grid) return void 0;
    const d = Number(dayId);
    const f = Number(slotOrden);
    if (grid[`${d}_${f}`]) return grid[`${d}_${f}`];
    if (f === 8 && grid[`${d}_6`]) return grid[`${d}_6`];
    if (f === 9 && grid[`${d}_7`]) return grid[`${d}_7`];
    const entry = Object.entries(grid).find(([key, cell]) => {
      if (!cell) return false;
      const parts = key.split("_");
      if (parts.length === 2) {
        const keyDay = Number(parts[0]);
        const keyFranja = Number(parts[1]);
        if (keyDay === d && keyFranja === f) return true;
      }
      if (cell.rawData) {
        const s = cell.rawData;
        const rawDia = Number(s.dia ?? s.day_of_week ?? s.dia_semana);
        const rawFranja = Number(s.franja ?? s.slot ?? s.time_slot_id ?? s.tramo_horario_id ?? s.tramo_id ?? s.orden);
        const timeStr = String(s.hora_inicio || s.time || s.tramo || s.hora || "").trim();
        const rawDiaNorm = rawDia >= 1 && rawDia <= 5 ? rawDia - 1 : rawDia;
        if (rawDiaNorm === d || rawDia === d) {
          if (f === 8 && (timeStr.includes("15:00") || rawFranja === 8 || rawFranja === 6)) return true;
          if (f === 9 && (timeStr.includes("15:45") || timeStr.includes("16:00") || rawFranja === 9 || rawFranja === 7)) return true;
          if (rawFranja === f) return true;
        }
      }
      return false;
    });
    return entry ? entry[1] : void 0;
  }
  if ($$props.selectedEntityId === void 0 && $$bindings.selectedEntityId && selectedEntityId !== void 0) $$bindings.selectedEntityId(selectedEntityId);
  if ($$props.teacherId === void 0 && $$bindings.teacherId && teacherId !== void 0) $$bindings.teacherId(teacherId);
  if ($$props.classroomId === void 0 && $$bindings.classroomId && classroomId !== void 0) $$bindings.classroomId(classroomId);
  if ($$props.gridData === void 0 && $$bindings.gridData && gridData !== void 0) $$bindings.gridData(gridData);
  if ($$props.timeSlots === void 0 && $$bindings.timeSlots && timeSlots !== void 0) $$bindings.timeSlots(timeSlots);
  if ($$props.isJornadaCompleta === void 0 && $$bindings.isJornadaCompleta && isJornadaCompleta !== void 0) $$bindings.isJornadaCompleta(isJornadaCompleta);
  if ($$props.showDebug === void 0 && $$bindings.showDebug && showDebug !== void 0) $$bindings.showDebug(showDebug);
  if ($$props.onCellClick === void 0 && $$bindings.onCellClick && onCellClick !== void 0) $$bindings.onCellClick(onCellClick);
  targetId = teacherId || classroomId || selectedEntityId;
  activeSlots = timeSlots && timeSlots.length >= 8 ? timeSlots : fallbackTimeSlotsProfesorado();
  return `${validate_component(ScheduleRenderer, "ScheduleRenderer").$$render(
    $$result,
    {
      teacherId,
      classroomId,
      selectedEntityId,
      gridData,
      activeSlots,
      isJornadaCompleta,
      showDebug,
      getSession,
      onCellClick
    },
    {},
    {}
  )}`;
});
function formatMinutes(minutes) {
  const isNegative = minutes < 0;
  const totalRounded = Math.round(Math.abs(minutes));
  const hours = Math.floor(totalRounded / 60);
  const mins = totalRounded % 60;
  const formatted = `${hours}h ${mins}m`;
  return isNegative ? `-${formatted}` : formatted;
}
function normalizeText(text) {
  if (!text) return "";
  return text.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function isLectivaSession(session, actividadesCatalogo) {
  if (!session.actividad) {
    return session.es_lectiva ?? false;
  }
  const actLimpia = session.actividad.trim().toUpperCase();
  if (actividadesCatalogo && actividadesCatalogo.length > 0) {
    const encontrada = actividadesCatalogo.find(
      (a) => a.nombre.trim().toUpperCase() === actLimpia
    );
    if (encontrada && encontrada.es_lectiva !== void 0 && encontrada.es_lectiva !== null) {
      return encontrada.es_lectiva;
    }
  }
  const normActividad = normalizeText(session.actividad);
  const patronesNoLectivos = [
    "no lectiva",
    "ez irakaskuntza",
    "recreo",
    "atsedenaldia",
    "coordinacion",
    "koordinazioa",
    "formakuntza",
    "formacion",
    "guardia",
    "zaintza",
    "tutoretza",
    "tutoria",
    "mintegia",
    "seminario",
    "bilera",
    "reunion",
    "bazkaria",
    "comedor",
    "presencia",
    "bat",
    "pedagogika",
    "maila",
    "zikloa",
    "gurasoak",
    "lan pertsonala",
    "obk",
    "ikt",
    "irratsaioa",
    "exklusiba",
    "beste batzuk",
    "besteak",
    "atentzioa",
    "atencion"
  ];
  const esPatronNoLectivo = patronesNoLectivos.some((patron) => normActividad.includes(patron));
  if (esPatronNoLectivo) {
    return false;
  }
  if (session.es_lectiva !== void 0 && session.es_lectiva !== null) {
    return session.es_lectiva;
  }
  return true;
}
function calculateScheduleSummary(sessions, jornadaConfig, actividadesCatalogo) {
  let minutosLectivos = 0;
  let minutosNoLectivos = 0;
  const franjasProcesadas = /* @__PURE__ */ new Map();
  for (const session of sessions) {
    const diaKey = session.dia ?? session.dia_semana;
    const franjaKey = session.franja ?? session.tramo_id ?? session.time_slot_id;
    if (diaKey === void 0 || franjaKey === void 0) {
      const actNorm = session.actividad ? session.actividad.trim().toUpperCase() : "";
      if (!actNorm || actNorm === "BAZKARIA" || actNorm === "ATSEDENALDIA" || actNorm === "RECREO") {
        continue;
      }
      const mins = Number(session.minutos) > 0 ? Number(session.minutos) : 45;
      if (mins > 0) {
        if (isLectivaSession(session, actividadesCatalogo)) {
          minutosLectivos += mins;
        } else {
          minutosNoLectivos += mins;
        }
      }
      continue;
    }
    const slotKey = session.id ? `id_${session.id}` : `${diaKey}_${franjaKey}_${session.actividad?.trim().toUpperCase() || "empty"}`;
    if (!franjasProcesadas.has(slotKey)) {
      franjasProcesadas.set(slotKey, session);
    }
  }
  for (const session of franjasProcesadas.values()) {
    const actNorm = session.actividad ? session.actividad.trim().toUpperCase() : "";
    if (!actNorm || actNorm === "BAZKARIA" || actNorm === "ATSEDENALDIA" || actNorm === "RECREO") {
      continue;
    }
    const mins = Number(session.minutos) > 0 ? Number(session.minutos) : 45;
    if (mins <= 0) continue;
    if (isLectivaSession(session, actividadesCatalogo)) {
      minutosLectivos += mins;
    } else {
      minutosNoLectivos += mins;
    }
  }
  const minutosTotales = minutosLectivos + minutosNoLectivos;
  const minutosTotalesObjetivo = jornadaConfig.minutosLectivosObjetivo + jornadaConfig.minutosNoLectivosObjetivo;
  const balanceLectivasMinutos = minutosLectivos - jornadaConfig.minutosLectivosObjetivo;
  const balanceNoLectivasMinutos = minutosNoLectivos - jornadaConfig.minutosNoLectivosObjetivo;
  const balanceTotalMinutos = minutosTotales - minutosTotalesObjetivo;
  return {
    minutosLectivos,
    minutosNoLectivos,
    minutosTotales,
    horasLectivasFormatted: formatMinutes(minutosLectivos),
    horasNoLectivasFormatted: formatMinutes(minutosNoLectivos),
    horasTotalesFormatted: formatMinutes(minutosTotales),
    balanceLectivasMinutos,
    balanceLectivasFormatted: formatMinutes(balanceLectivasMinutos),
    balanceNoLectivasMinutos,
    balanceNoLectivasFormatted: formatMinutes(balanceNoLectivasMinutos),
    balanceTotalMinutos,
    balanceTotalFormatted: formatMinutes(balanceTotalMinutos)
  };
}
async function getActividadesCatalogo(curso) {
  const { data, error } = await supabase.from("actividades").select("nombre, es_lectiva, curso_escolar").eq("curso_escolar", curso);
  if (error) {
    console.error("Error fetching actividades catalogo:", error);
    return [];
  }
  return data || [];
}
async function getTeachers(curso) {
  const { data, error } = await supabase.from("profesores").select("*").eq("curso_escolar", curso).order("orden", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("Error fetching teachers:", error);
    throw new Error(`Error al obtener los profesores: ${error.message}`);
  }
  return data || [];
}
async function getTimeSlots() {
  const { data, error } = await supabase.from("tramos_horarios_primaria").select("*").order("orden", { ascending: true });
  if (error) {
    console.error("Error fetching time slots:", error);
    throw new Error(`Error al obtener los tramos horarios: ${error.message}`);
  }
  return data || [];
}
async function getSessionsForTeacher(curso, profesorNombre) {
  if (!profesorNombre) return [];
  const { data, error } = await supabase.from("sesiones").select("*").eq("curso_escolar", curso).eq("profesor_nombre", profesorNombre);
  if (error) {
    console.error("Error fetching sessions for teacher:", error);
    throw new Error(`Error al obtener las sesiones del profesor: ${error.message}`);
  }
  return (data || []).map((s) => ({
    ...s,
    minutos: s.minutos ?? 45
  }));
}
const ActionsView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let selectorOptions;
  let currentTeacher;
  let isJornadaCompleta;
  let scheduleSummary;
  createEventDispatcher();
  let { selectedCurso = "2026-2027" } = $$props;
  let { selectedCiclo = "LH" } = $$props;
  let activeTab = "profesorado";
  let showDebug = false;
  let showAdminModal = false;
  let isSesionModalOpen = false;
  let selectedCellDia = null;
  let selectedCellFranja = null;
  let selectedCellDiaNombre = "";
  let selectedCellFranjaNombre = "";
  let maxMinutosFranja = 60;
  let ajusteMinutosValor = 60;
  let ajusteParteValor = "inicio";
  let selectedCellData = {};
  let { profesoresDisponibles = [] } = $$props;
  let { aulasDisponibles = [] } = $$props;
  let { actividadesDisponibles = [] } = $$props;
  let { totalProfesoradoCount = 0 } = $$props;
  let { selectedEntityId = "" } = $$props;
  let timeSlots = [];
  let teacherScheduleGrid = {};
  let teacherSessionsList = [];
  async function handleCellClick(dayId, dayName, slot, session) {
    selectedCellDia = dayId;
    let dbFranja = slot.orden;
    selectedCellFranja = dbFranja;
    selectedCellDiaNombre = dayName;
    selectedCellFranjaNombre = slot.time;
    const foundSlot = timeSlots.find((ts) => ts.orden === slot.orden);
    maxMinutosFranja = foundSlot?.minutos_maximos || slot.minutos_maximos || 60;
    if (session && session.rawData && typeof session.rawData.minutos === "number") {
      ajusteMinutosValor = Math.min(session.rawData.minutos, maxMinutosFranja);
    } else {
      ajusteMinutosValor = maxMinutosFranja;
    }
    ajusteParteValor = "inicio";
    selectedCellData = session ? {
      id: session.id,
      actividad: session.actividad,
      clase: session.clase,
      aula: session.aula,
      rol_aula: session.rawData?.rol_aula,
      es_lectiva: session.rawData?.es_lectiva
    } : {};
    isSesionModalOpen = true;
  }
  if ($$props.selectedCurso === void 0 && $$bindings.selectedCurso && selectedCurso !== void 0) $$bindings.selectedCurso(selectedCurso);
  if ($$props.selectedCiclo === void 0 && $$bindings.selectedCiclo && selectedCiclo !== void 0) $$bindings.selectedCiclo(selectedCiclo);
  if ($$props.profesoresDisponibles === void 0 && $$bindings.profesoresDisponibles && profesoresDisponibles !== void 0) $$bindings.profesoresDisponibles(profesoresDisponibles);
  if ($$props.aulasDisponibles === void 0 && $$bindings.aulasDisponibles && aulasDisponibles !== void 0) $$bindings.aulasDisponibles(aulasDisponibles);
  if ($$props.actividadesDisponibles === void 0 && $$bindings.actividadesDisponibles && actividadesDisponibles !== void 0) $$bindings.actividadesDisponibles(actividadesDisponibles);
  if ($$props.totalProfesoradoCount === void 0 && $$bindings.totalProfesoradoCount && totalProfesoradoCount !== void 0) $$bindings.totalProfesoradoCount(totalProfesoradoCount);
  if ($$props.selectedEntityId === void 0 && $$bindings.selectedEntityId && selectedEntityId !== void 0) $$bindings.selectedEntityId(selectedEntityId);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    selectorOptions = profesoresDisponibles;
    currentTeacher = profesoresDisponibles.find((p) => p.id === selectedEntityId) || profesoresDisponibles[0];
    aulasDisponibles.find((a) => a.id === selectedEntityId) || aulasDisponibles[0];
    isJornadaCompleta = currentTeacher?.jornada ? formatJornada(currentTeacher.jornada) === "JC" : false;
    scheduleSummary = (() => {
      const isJC = isJornadaCompleta;
      const config = {
        minutosLectivosObjetivo: isJC ? 900 : 450,
        // 15h JC / 7h 30m parcial
        minutosNoLectivosObjetivo: isJC ? 480 : 240
      };
      const catMap = actividadesDisponibles.map((a) => ({
        nombre: a.nombre,
        es_lectiva: Boolean(a.es_lectiva)
      }));
      return calculateScheduleSummary(teacherSessionsList, config, catMap);
    })();
    $$rendered = `<div class="flex flex-col min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors"> <div class="print:hidden">${validate_component(ActionToolbar, "ActionToolbar").$$render(
      $$result,
      {
        selectedCurso,
        selectedCiclo,
        totalProfesorado: totalProfesoradoCount,
        selectedProfesor: selectedEntityId,
        profesoresDisponibles: selectorOptions,
        activeTab
      },
      {},
      {}
    )}</div>  <main class="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-4 print-area print:p-0 print:m-0 print:space-y-1"> <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden"><div class="flex flex-col md:flex-row md:items-center justify-start gap-4 flex-1"> <div class="flex items-center space-x-1 shrink-0"><button type="button" class="${"px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border " + escape(
      "border-sky-600 bg-sky-600 text-white shadow-xs",
      true
    )}">👨‍🏫 Profesorado</button> <button type="button" class="${"px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border " + escape(
      "border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700",
      true
    )}">🏫 Aulas y Grupos</button></div>  <div class="flex items-center space-x-2 w-full md:w-auto flex-1 max-w-2xl"><label for="entitySelector" class="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">${escape(
      "SELECCIONAR PROFESORADO:"
    )}</label> <select id="entitySelector"${add_attribute("value", selectedEntityId, 0)} class="w-full bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-gray-100 text-xs font-semibold rounded-lg border border-slate-300 dark:border-gray-500 px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-xs">${`${selectorOptions.length === 0 ? `<option value="" data-svelte-h="svelte-hid0aq">Sin registros disponibles</option>` : `${each(selectorOptions, (option) => {
      return `<option${add_attribute("value", option.id, 0)}>${escape(option.labelText || option.nombre)}</option>`;
    })}`}`}</select></div></div>  <button type="button" class="${"px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1 border " + escape(
      "bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 border-slate-300 dark:border-gray-600 hover:bg-slate-200",
      true
    )}" title="Activar/desactivar visor técnico de auditoría de datos en cada celda">🐛 Debug Datos</button></div>  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-4 flex items-center justify-center print:border-none print:shadow-none print:bg-transparent print:p-1 print:mb-1">${`<div class="flex flex-wrap items-center justify-center gap-4 text-center sm:text-left print:gap-2"><div class="h-10 sm:h-12 flex items-center justify-center overflow-hidden shrink-0 print:h-7"><img src="/Logo.png" alt="Ganivet Logo" class="h-10 sm:h-12 w-auto object-contain print:h-7"></div> <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-gray-100 uppercase tracking-tight print:text-lg">${escape(currentTeacher?.nombre ? currentTeacher.nombre.toUpperCase() : "SIN PROFESORADO DISPONIBLE")}</h2> <div class="flex flex-wrap items-center gap-1.5"><span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800 print:text-[9px] print:py-0.5 print:px-2" data-svelte-h="svelte-qrj1ib">Primaria (LH)</span> <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 print:text-[9px] print:py-0.5 print:px-2">${escape(currentTeacher?.rol || "Especialista")}</span> <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 print:text-[9px] print:py-0.5 print:px-2">${escape(currentTeacher?.jornada || "Jornada completa")}</span></div></div>`}</div>  ${`${validate_component(TeacherScheduleGrid, "TeacherScheduleGrid").$$render(
      $$result,
      {
        teacherId: selectedEntityId,
        selectedEntityId,
        gridData: teacherScheduleGrid,
        timeSlots,
        isJornadaCompleta,
        showDebug,
        onCellClick: handleCellClick
      },
      {},
      {}
    )}`}  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-slate-200 dark:border-gray-700 p-4 space-y-3 print:border-none print:p-0 print:shadow-none print:bg-transparent print:mt-1"><div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-700 gap-2 print:pb-0.5 print:mb-0.5 print:border-b"><div><h3 class="text-sm font-bold text-slate-900 dark:text-gray-100 print:text-[10px]" data-svelte-h="svelte-dlq0o8">Resumen Horario y Balance de Jornada</h3> <p class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[8px]">Tipo de Jornada: <strong class="text-slate-800 dark:text-gray-200">${escape(currentTeacher?.jornada || "Jornada completa")}</strong></p></div> <div class="bg-slate-50 dark:bg-gray-700 px-3 py-1 rounded-lg border border-slate-200 dark:border-gray-600 text-xs font-semibold text-slate-700 dark:text-gray-300 print:text-[8px] print:py-0 print:px-1.5 print:border">Objetivo Oficial: <span class="text-sky-700 dark:text-sky-300 font-bold">${escape(isJornadaCompleta ? "23h 00m" : "11h 30m")}</span></div></div> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-1.5"> <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent"><div><span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]" data-svelte-h="svelte-99m32j">Horas Lectivas</span> <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block print:text-[10px]">${escape(scheduleSummary.horasLectivasFormatted)}</strong> <span class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[7px]">Objetivo: ${escape(isJornadaCompleta ? "15h 00m" : "7h 30m")}</span></div> <div class="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]" data-svelte-h="svelte-1vum0r7">📚</div></div>  <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent"><div><span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]" data-svelte-h="svelte-1s9r0lm">Horas No Lectivas</span> <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block print:text-[10px]">${escape(scheduleSummary.horasNoLectivasFormatted)}</strong> <span class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[7px]">Objetivo: ${escape(isJornadaCompleta ? "8h 00m" : "4h 00m")}</span></div> <div class="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]" data-svelte-h="svelte-14o12vw">📝</div></div>  <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent"><div><span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]" data-svelte-h="svelte-duhqx">Total Asignado</span> <strong class="text-lg font-bold text-slate-800 dark:text-gray-100 mt-0.5 block print:text-[10px]">${escape(scheduleSummary.horasTotalesFormatted)}</strong> <span class="text-[11px] text-slate-500 dark:text-gray-400 print:text-[7px]">Total Jornada: ${escape(isJornadaCompleta ? "23h 00m" : "11h 30m")}</span></div> <div class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]" data-svelte-h="svelte-pz3ihk">⏱️</div></div>  <div class="bg-slate-50 dark:bg-gray-700/50 rounded-xl p-3 border border-slate-200 dark:border-gray-700 flex items-center justify-between print:p-1 print:border print:bg-transparent"><div><span class="block text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider print:text-[7px]" data-svelte-h="svelte-8xv1lt">Balance Horario</span> <strong class="${"text-lg font-bold " + escape(
      scheduleSummary.balanceTotalMinutos >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
      true
    ) + " mt-0.5 block print:text-[10px]"}">${escape(scheduleSummary.balanceTotalFormatted)}</strong> <span class="${"text-[11px] " + escape(
      scheduleSummary.balanceTotalMinutos === 0 ? "text-emerald-600 dark:text-emerald-400" : scheduleSummary.balanceTotalMinutos > 0 ? "text-sky-600 dark:text-sky-400" : "text-amber-600 dark:text-amber-400",
      true
    ) + " font-medium print:text-[7px]"}">${escape(scheduleSummary.balanceTotalMinutos === 0 ? "Jornada equilibrada" : scheduleSummary.balanceTotalMinutos > 0 ? "Exceso asignado" : "Horas pendientes")}</span></div> <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base print:w-5 print:h-5 print:text-[10px]" data-svelte-h="svelte-lmxval">⚖️</div></div></div></div></main>  ${validate_component(AdminModal, "AdminModal").$$render($$result, { isOpen: showAdminModal, selectedCurso }, {}, {})}  ${validate_component(SesionModal, "SesionModal").$$render(
      $$result,
      {
        profesorNombre: currentTeacher?.nombre || "",
        dia: selectedCellDia,
        franja: selectedCellFranja,
        diaNombre: selectedCellDiaNombre,
        franjaNombre: selectedCellFranjaNombre,
        sesionData: selectedCellData,
        actividadesDisponibles,
        aulasDisponibles,
        maxMinutosFranja,
        isOpen: isSesionModalOpen,
        ajusteMinutos: ajusteMinutosValor,
        ajusteParte: ajusteParteValor
      },
      {
        isOpen: ($$value) => {
          isSesionModalOpen = $$value;
          $$settled = false;
        },
        ajusteMinutos: ($$value) => {
          ajusteMinutosValor = $$value;
          $$settled = false;
        },
        ajusteParte: ($$value) => {
          ajusteParteValor = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  return $$rendered;
});
const ControlJornadaModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let filteredRows;
  let { isOpen = false } = $$props;
  let { selectedCurso = "2026-2027" } = $$props;
  createEventDispatcher();
  let loading = false;
  let teacherRows = [];
  let actividadesCatalogo = [];
  let searchTerm = "";
  function getJornadaMinutosObjetivo(jornadaRaw) {
    const j = formatJornada(jornadaRaw);
    if (j === "JC") {
      return {
        minutosLectivosObjetivo: 900,
        // 15 horas lectivas
        minutosNoLectivosObjetivo: 480
      };
    }
    if (j.includes("1/2") || j.includes("50%")) {
      return {
        minutosLectivosObjetivo: 450,
        // 7.5 horas lectivas
        minutosNoLectivosObjetivo: 240
      };
    }
    return {
      minutosLectivosObjetivo: 900,
      minutosNoLectivosObjetivo: 480
    };
  }
  async function loadControlJornadaData() {
    loading = true;
    try {
      const [teachers, tramos, catalogo] = await Promise.all([
        getTeachers(selectedCurso),
        getTimeSlots(),
        getActividadesCatalogo(selectedCurso)
      ]);
      actividadesCatalogo = catalogo;
      const rows = await Promise.all(teachers.map(async (teacher) => {
        const sessions = await getSessionsForTeacher(selectedCurso, teacher.nombre);
        const jornadaConfig = getJornadaMinutosObjetivo(teacher.jornada);
        const summary = calculateScheduleSummary(sessions, jornadaConfig, actividadesCatalogo);
        return {
          teacher,
          summary,
          sessionsCount: sessions.length
        };
      }));
      teacherRows = rows;
    } catch (error) {
      console.error("Error cargando datos de control de jornada:", error);
    } finally {
      loading = false;
    }
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.selectedCurso === void 0 && $$bindings.selectedCurso && selectedCurso !== void 0) $$bindings.selectedCurso(selectedCurso);
  {
    if (isOpen) {
      loadControlJornadaData();
    }
  }
  filteredRows = teacherRows.filter((r) => {
    return true;
  });
  return `${isOpen ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto" role="button" tabindex="-1"><div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"> <div class="px-6 py-4 bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-700 flex items-center justify-between"><div><h2 class="text-xl font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2" data-svelte-h="svelte-vw6wkv">📊 Control y Balance de Jornada del Profesorado</h2> <p class="text-xs text-slate-500 dark:text-gray-400">Curso Escolar: <strong class="text-sky-600 dark:text-sky-400">${escape(selectedCurso)}</strong></p></div> <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold p-1 rounded-lg transition-colors cursor-pointer" data-svelte-h="svelte-18javwb">×</button></div>  <div class="p-4 bg-slate-50/50 dark:bg-gray-900/30 border-b border-slate-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3"><div class="w-full sm:w-80"><input type="text" placeholder="🔍 Buscar profesor o especialidad..." class="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"${add_attribute("value", searchTerm, 0)}></div> <div class="text-xs text-slate-500 dark:text-gray-400 font-medium">Mostrando <strong>${escape(filteredRows.length)}</strong> de <strong>${escape(teacherRows.length)}</strong> profesores</div></div>  <div class="p-6 overflow-y-auto flex-1 space-y-4">${loading ? `<div class="flex flex-col items-center justify-center py-12 space-y-3" data-svelte-h="svelte-kir738"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div> <p class="text-xs font-semibold text-slate-500 dark:text-gray-400">Calculando horas y balance de jornada para el profesorado...</p></div>` : `${filteredRows.length === 0 ? `<div class="text-center py-12 text-slate-400 text-xs" data-svelte-h="svelte-1jts6xt">No se encontraron registros de profesorado para la búsqueda o el curso seleccionado.</div>` : `<div class="overflow-x-auto border border-slate-200 dark:border-gray-700 rounded-xl"><table class="w-full text-left text-xs"><thead class="bg-slate-100 dark:bg-gray-700/80 text-slate-700 dark:text-gray-200 font-bold sticky top-0" data-svelte-h="svelte-xiw2ix"><tr><th class="p-3">Profesor / Especialidad</th> <th class="p-3 text-center">Jornada</th> <th class="p-3 text-center">Horas Lectivas</th> <th class="p-3 text-center">Horas No Lectivas</th> <th class="p-3 text-center">Total Asignado</th> <th class="p-3 text-center">Balance</th></tr></thead> <tbody class="divide-y divide-slate-200 dark:divide-gray-700">${each(filteredRows, (row) => {
    let isJC = formatJornada(row.teacher.jornada) === "JC";
    return ` <tr class="hover:bg-slate-50 dark:hover:bg-gray-800/60 transition-colors"><td class="p-3"><div class="font-bold text-slate-800 dark:text-gray-100 uppercase">${escape(row.teacher.nombre)}</div> <div class="text-[11px] text-slate-500 dark:text-gray-400">${escape(row.teacher.perfil || "Especialista")} </div></td> <td class="p-3 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300 border border-slate-200 dark:border-gray-600">${escape(isJC ? "JC (23h)" : "Parcial")} </span></td> <td class="p-3 text-center"><span class="font-bold text-slate-800 dark:text-gray-200">${escape(row.summary.horasLectivasFormatted)}</span> <span class="block text-[10px] text-slate-400">Obj: ${escape(isJC ? "15h" : "7h 30m")}</span></td> <td class="p-3 text-center"><span class="font-bold text-slate-800 dark:text-gray-200">${escape(row.summary.horasNoLectivasFormatted)}</span> <span class="block text-[10px] text-slate-400">Obj: ${escape(isJC ? "8h" : "4h")}</span></td> <td class="p-3 text-center"><span class="font-bold text-slate-900 dark:text-gray-100">${escape(row.summary.horasTotalesFormatted)}</span> <span class="block text-[10px] text-slate-400">Obj: ${escape(isJC ? "23h" : "11h 30m")}</span></td> <td class="p-3 text-center"><span class="${"font-extrabold px-2 py-1 rounded-md text-xs " + escape(
      row.summary.balanceTotalMinutos === 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : row.summary.balanceTotalMinutos > 0 ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      true
    )}">${escape(row.summary.balanceTotalFormatted)} </span></td> </tr>`;
  })}</tbody></table></div>`}`}</div>  <div class="px-6 py-4 bg-slate-50 dark:bg-gray-800/80 border-t border-slate-200 dark:border-gray-700 flex items-center justify-end"><button type="button" class="px-4 py-2 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded-lg font-semibold text-xs transition-colors cursor-pointer" data-svelte-h="svelte-1t6wdyk">Cerrar</button></div></div></div>` : ``}`;
});
const ImportStagingModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { selectedCurso = "2026-2027" } = $$props;
  createEventDispatcher();
  let targetCurso = selectedCurso;
  let stagingRows = [];
  let pendingBatchInfo = null;
  onDestroy(() => {
  });
  async function checkPendingStaging() {
    if (!isOpen) return;
    try {
      const { data, error } = await supabase.from("sesiones_staging").select("batch_id").eq("curso_escolar", targetCurso).limit(1);
      if (error) throw error;
      if (data && data.length > 0) {
        const batchId = data[0].batch_id;
        const { count, error: countErr } = await supabase.from("sesiones_staging").select("*", { count: "exact", head: true }).eq("batch_id", batchId);
        if (!countErr && count) {
          pendingBatchInfo = { batchId, count };
        } else {
          pendingBatchInfo = null;
        }
      } else {
        pendingBatchInfo = null;
      }
    } catch (err) {
      console.error("Error al comprobar borrador en staging:", err);
      pendingBatchInfo = null;
    } finally {
    }
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.selectedCurso === void 0 && $$bindings.selectedCurso && selectedCurso !== void 0) $$bindings.selectedCurso(selectedCurso);
  {
    if (isOpen) {
      if (!targetCurso) {
        targetCurso = selectedCurso;
      }
      checkPendingStaging();
    }
  }
  Array.from(new Set((stagingRows || []).map((r) => r.profesor_nombre?.trim()).filter((nombre) => Boolean(nombre && nombre.length > 0)))).sort((a, b) => a.localeCompare(b));
  return `${isOpen ? `<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"><div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden relative"> <div class="px-6 pt-4 bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-700"><div class="flex items-center justify-between pb-3"><div><h2 class="text-xl font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2" data-svelte-h="svelte-1nxgns7">📥 Importación de Horarios (Staging) - Bloques aSc</h2> <p class="text-xs text-slate-500 dark:text-gray-400">Curso activo: <strong class="text-sky-600 dark:text-sky-400">${escape(selectedCurso)}</strong></p></div> <button class="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer" data-svelte-h="svelte-1j4phl7">×</button></div>  <div class="flex items-center gap-2 border-b border-slate-200 dark:border-gray-700 -mb-px"><button type="button" class="${"px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer " + escape(
    "border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-800 rounded-t-md",
    true
  )}">🔄 Actualizar Curso Actual</button> <button type="button" class="${"px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer " + escape(
    "border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200",
    true
  )}">📅 Importar Nuevo Curso</button></div></div>  <div class="p-6 overflow-y-auto flex-1 space-y-4"> <div class="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"><div class="text-xs">${`<span class="font-bold text-sky-900 dark:text-sky-200" data-svelte-h="svelte-y19xow">Modo Actualizar:</span> <span class="text-slate-600 dark:text-gray-300" data-svelte-h="svelte-1adoe6j">Los datos existentes no se sobrescriben. Solo se añadirán/actualizarán los nuevos registros.</span>`}</div> <div class="flex items-center gap-2 shrink-0"><label for="input-target-curso" class="text-xs font-bold text-slate-700 dark:text-gray-300" data-svelte-h="svelte-1d2qjxt">Curso Objetivo:</label> <input id="input-target-curso" type="text" placeholder="ej. 2026-2027" class="px-2.5 py-1 text-xs font-bold rounded-md border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 focus:outline-none w-28 text-center"${add_attribute("value", targetCurso, 0)}></div></div> ${``} ${``}  ${pendingBatchInfo && true ? `<div class="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3"><div class="flex items-center gap-3"><span class="text-2xl" data-svelte-h="svelte-dqd05v">📑</span> <div><h3 class="text-sm font-bold text-amber-900 dark:text-amber-200" data-svelte-h="svelte-17snjw1">Borrador pendiente en base de datos</h3> <p class="text-xs text-amber-700 dark:text-amber-300">Se han encontrado <strong>${escape(pendingBatchInfo.count ?? 0)}</strong> sesiones previamente procesadas para el curso ${escape(targetCurso)}.</p></div></div> <div class="flex items-center gap-2 w-full sm:w-auto justify-end"><button type="button" class="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer" data-svelte-h="svelte-1sfsgtc">Nueva importación</button> <button type="button" class="px-4 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer">Cargar borrador pendiente (${escape(pendingBatchInfo.count ?? 0)} sesiones)</button></div></div>` : ``} ${` <div class="space-y-4 bg-slate-50 dark:bg-gray-900/40 p-5 rounded-lg border border-slate-200 dark:border-gray-700"> <div><span class="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-2" data-svelte-h="svelte-94ia2m">Formato / Plantilla de Origen</span> <div class="grid grid-cols-1 md:grid-cols-2 gap-3"><button type="button" class="${"p-4 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer " + escape(
    "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500/20",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="font-bold text-sm" data-svelte-h="svelte-1je7oqo">Importar Excel de aSc (Estructura de Bloques)</span> <input type="radio" name="format" ${"checked"} class="text-sky-600 focus:ring-sky-500"></div> <p class="text-xs text-slate-500 dark:text-gray-400" data-svelte-h="svelte-111dom9">Procesa bloques verticales por profesor separando Asignatura (Fila 1) y Clase/Aula (Fila 2).</p></button> <button type="button" class="${"p-4 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer " + escape(
    "border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:border-slate-400",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="font-bold text-sm" data-svelte-h="svelte-1cyauu0">Matriz por Profesor</span> <input type="radio" name="format" ${""} class="text-sky-600 focus:ring-sky-500"></div> <p class="text-xs text-slate-500 dark:text-gray-400" data-svelte-h="svelte-k13fd1">Hojas individuales por profesor (matriz de actividades y clases).</p></button></div></div>  <div><span class="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1" data-svelte-h="svelte-fao0l">Seleccionar Archivo Excel (.xlsx / .xls)</span> <div class="flex items-center gap-3"><input type="file" accept=".xlsx, .xls" ${""} class="hidden" id="excel-file-input"> <label for="excel-file-input" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors">📁 ${escape("Seleccionar Archivo")}</label> ${`<span class="text-xs text-slate-400 italic" data-svelte-h="svelte-1oq8yj5">Ningún archivo seleccionado</span>`}</div></div>  <div class="pt-2 flex justify-end"><button type="button" ${"disabled"} class="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed">⚡ Ejecutar Procesamiento</button></div>  ${``}</div>`}</div>  <div class="px-6 py-4 bg-slate-50 dark:bg-gray-800/80 border-t border-slate-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3"><div class="flex flex-wrap items-center gap-2">${pendingBatchInfo ? `<button type="button" ${""} class="px-3.5 py-2 rounded-md border border-red-300 dark:border-red-800/60 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer">🗑️ Desechar Borrador</button>` : ``} <button type="button" ${""} class="px-3.5 py-2 rounded-md border border-amber-300 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer" title="Elimina todos los borradores temporales acumulados en la tabla sesiones_staging">🧹 Vaciar Tabla Temporal</button></div> <div class="flex items-center gap-3"><button type="button" class="px-4 py-2 rounded-md border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" data-svelte-h="svelte-107skod">Cancelar / Cerrar</button> ${``}</div></div>  ${``}</div></div>` : ``}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isControlJornadaOpen = false;
  let showImportModal = false;
  let isAdminOpen = false;
  let selectedCurso = "2026-2027";
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="min-h-screen bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100"><main class="max-w-7xl mx-auto p-4"> ${validate_component(ActionsView, "ActionsView").$$render($$result, {}, {}, {})}</main>  ${validate_component(ControlJornadaModal, "ControlJornadaModal").$$render(
      $$result,
      {
        selectedCurso,
        isOpen: isControlJornadaOpen
      },
      {
        isOpen: ($$value) => {
          isControlJornadaOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}  ${validate_component(ImportStagingModal, "ImportStagingModal").$$render(
      $$result,
      { selectedCurso, isOpen: showImportModal },
      {
        isOpen: ($$value) => {
          showImportModal = $$value;
          $$settled = false;
        }
      },
      {}
    )}  ${validate_component(AdminModal, "AdminModal").$$render(
      $$result,
      { selectedCurso, isOpen: isAdminOpen },
      {
        isOpen: ($$value) => {
          isAdminOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-Cyhsgioy.js.map
