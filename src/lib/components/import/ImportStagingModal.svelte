<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { processAndUploadExcel, type ImportFormat, type StagingSessionRow } from '$lib/services/excelImportService';
	import { getStagingRowsByBatch, updateStagingRow, implantarStaging, desecharStaging, vaciarTablaStaging } from '$lib/services/importService';
	import { supabase } from '$lib/services/supabaseClient';
	import StagingScheduleGrid from './StagingScheduleGrid.svelte';
	import { parseExcelCellContent } from './excelCellParser';

	export let isOpen: boolean = false;
	export let selectedCurso: string = '2026-2027';

	const dispatch = createEventDispatcher<{
		close: void;
		imported: { count: number };
	}>();

	// Pestañas / Modos de Importación
	type ImportTabMode = 'actualizar' | 'nuevo_curso';
	let activeTab: ImportTabMode = 'actualizar';

	// Campo de curso escolar editable
	let targetCurso: string = selectedCurso;

	let fileInput: HTMLInputElement;
	let selectedFile: File | null = null;
	let format: ImportFormat = 'periodo_multilinea';
	let isProcessing: boolean = false;
	let errorMessage: string | null = null;
	let successMessage: string | null = null;

	let activeBatchId: string | null = null;
	let stagingRows: StagingSessionRow[] = [];

	// Modo de vista previa: 'tabla' | 'rejilla'
	let viewMode: 'tabla' | 'rejilla' = 'tabla';

	// Verificación de borrador pendiente en DB
	let pendingBatchInfo: { batchId: string; count: number } | null = null;
	let isCheckingPending: boolean = false;

	// Modal de Confirmación para Implantación
	let showConfirmModal: boolean = false;
	let countdownSeconds: number = 5;
	let countdownInterval: any = null;

	// Filtros
	let filterProfesor: string = '';
	let filterDia: string = '';
	let filterFranja: string = '';

	let reemplazarExistentes: boolean = false;

	// Calcular siguiente curso académico por defecto (ej. "2026-2027" -> "2027-2028")
	function calculateNextCurso(cursoStr: string): string {
		if (!cursoStr) return '2027-2028';
		const parts = cursoStr.split('-');
		if (parts.length === 2) {
			const y1 = parseInt(parts[0], 10);
			const y2 = parseInt(parts[1], 10);
			if (!isNaN(y1) && !isNaN(y2)) {
				return `${y1 + 1}-${y2 + 1}`;
			}
		}
		return cursoStr;
	}

	$: if (isOpen) {
		if (!targetCurso) {
			targetCurso = selectedCurso;
		}
		checkPendingStaging();
	}

	function handleTabChange(tab: ImportTabMode) {
		activeTab = tab;
		if (tab === 'actualizar') {
			targetCurso = selectedCurso;
			reemplazarExistentes = false;
		} else if (tab === 'nuevo_curso') {
			targetCurso = calculateNextCurso(selectedCurso);
			reemplazarExistentes = false;
		}
	}

	onDestroy(() => {
		if (countdownInterval) clearInterval(countdownInterval);
	});

	async function checkPendingStaging() {
		if (!isOpen) return;
		isCheckingPending = true;
		try {
			const { data, error } = await supabase
				.from('sesiones_staging')
				.select('batch_id')
				.eq('curso_escolar', targetCurso)
				.limit(1);

			if (error) throw error;

			if (data && data.length > 0) {
				const batchId = data[0].batch_id;
				const { count, error: countErr } = await supabase
					.from('sesiones_staging')
					.select('*', { count: 'exact', head: true })
					.eq('batch_id', batchId);

				if (!countErr && count) {
					pendingBatchInfo = { batchId, count };
				} else {
					pendingBatchInfo = null;
				}
			} else {
				pendingBatchInfo = null;
			}
		} catch (err: any) {
			console.error('Error al comprobar borrador en staging:', err);
			pendingBatchInfo = null;
		} finally {
			isCheckingPending = false;
		}
	}

	async function loadPendingBatch() {
		if (!pendingBatchInfo) return;
		activeBatchId = pendingBatchInfo.batchId;
		pendingBatchInfo = null;
		await loadStagingRows();
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			selectedFile = target.files[0];
			errorMessage = null;
			successMessage = null;
		}
	}

	async function handleExecuteProcess() {
		if (!selectedFile) {
			errorMessage = 'Por favor selecciona un archivo Excel primero.';
			return;
		}

		if (!targetCurso || !targetCurso.trim()) {
			errorMessage = 'Por favor especifica un curso escolar válido.';
			return;
		}

		isProcessing = true;
		errorMessage = null;
		successMessage = null;

		try {
			const res = await processAndUploadExcel(selectedFile, format, targetCurso.trim());
			activeBatchId = res.batchId;
			pendingBatchInfo = null;
			successMessage = `Archivo parseado con éxito. ${res.totalProcessed} sesiones consolidadas para el curso ${targetCurso}.`;
			await loadStagingRows();
		} catch (err: any) {
			errorMessage = err?.message || 'Error al procesar el archivo Excel';
		} finally {
			isProcessing = false;
		}
	}

	async function loadStagingRows() {
		if (!activeBatchId) return;
		try {
			const rows = await getStagingRowsByBatch(activeBatchId);
			stagingRows = Array.isArray(rows) ? rows : [];
		} catch (err: any) {
			errorMessage = err?.message || 'Error al cargar las filas de borrador';
		}
	}

	async function handleCellBlur(row: StagingSessionRow, field: keyof StagingSessionRow, value: any) {
		if (!row?.id) return;
		try {
			const updated = await updateStagingRow(row.id, { [field]: value });
			stagingRows = stagingRows.map((r) => (r.id === updated.id ? updated : r));
		} catch (err: any) {
			errorMessage = `Error guardando cambios: ${err?.message || 'Error desconocido'}`;
		}
	}

	function openImplantarConfirmation() {
		if (!activeBatchId || stagingRows.length === 0) return;
		showConfirmModal = true;
		countdownSeconds = 5;

		if (countdownInterval) clearInterval(countdownInterval);
		countdownInterval = setInterval(() => {
			if (countdownSeconds > 0) {
				countdownSeconds -= 1;
			} else {
				clearInterval(countdownInterval);
			}
		}, 1000);
	}

	function closeConfirmModal() {
		showConfirmModal = false;
		if (countdownInterval) clearInterval(countdownInterval);
	}

	async function handleImplantarConfirmado() {
		if (!activeBatchId || countdownSeconds > 0) return;
		showConfirmModal = false;
		isProcessing = true;
		errorMessage = null;

		try {
			const count = await implantarStaging(activeBatchId, targetCurso.trim(), reemplazarExistentes);
			dispatch('imported', { count });
			handleClose();
		} catch (err: any) {
			errorMessage = err?.message || 'Error al implantar sesiones';
		} finally {
			isProcessing = false;
		}
	}

	async function handleDesechar() {
		const batchIdToDiscard = activeBatchId || pendingBatchInfo?.batchId;
		if (!batchIdToDiscard) return;
		if (!confirm('⚠️ ¿Seguro que deseas descartar permanentemente este borrador importado?')) return;

		isProcessing = true;
		errorMessage = null;
		successMessage = null;

		try {
			await desecharStaging(batchIdToDiscard);
			activeBatchId = null;
			stagingRows = [];
			selectedFile = null;
			pendingBatchInfo = null;
			filterProfesor = '';
			filterDia = '';
			filterFranja = '';
			if (fileInput) {
				fileInput.value = '';
			}
			successMessage = 'Borrador desechado correctamente de la base de datos.';
		} catch (err: any) {
			console.error('Error al desechar borrador:', err);
			errorMessage = err?.message || 'Error al desechar borrador';
		} finally {
			isProcessing = false;
		}
	}

	async function handleVaciarTablaStaging() {
		if (!confirm('⚠️ ¿Seguro que deseas vaciar completamente la tabla temporal "sesiones_staging"?\n\nEsta acción eliminará todo el borrador e histórico acumulado en la base de datos.')) {
			return;
		}

		isProcessing = true;
		errorMessage = null;
		successMessage = null;

		try {
			await vaciarTablaStaging();
			activeBatchId = null;
			stagingRows = [];
			selectedFile = null;
			pendingBatchInfo = null;
			filterProfesor = '';
			filterDia = '';
			filterFranja = '';
			if (fileInput) {
				fileInput.value = '';
			}
			successMessage = 'La tabla temporal "sesiones_staging" ha sido vaciada completamente.';
		} catch (err: any) {
			console.error('Error al vaciar la tabla temporal:', err);
			errorMessage = err?.message || 'Error al vaciar la tabla temporal';
		} finally {
			isProcessing = false;
		}
	}

	function handleClose() {
		isOpen = false;
		showConfirmModal = false;
		if (countdownInterval) clearInterval(countdownInterval);
		activeBatchId = null;
		stagingRows = [];
		selectedFile = null;
		pendingBatchInfo = null;
		errorMessage = null;
		successMessage = null;
		dispatch('close');
	}

	// Normalización y deduplicación con .trim() de la lista de profesores
	$: profesoresUnicos = Array.from(
		new Set(
			(stagingRows || [])
				.map((r) => r.profesor_nombre?.trim())
				.filter((nombre): nombre is string => Boolean(nombre && nombre.length > 0))
		)
	).sort((a, b) => a.localeCompare(b));

	// Filtrado reactivo estricto
	$: filteredRows = (stagingRows || []).filter((r) => {
		if (!r) return false;
		
		if (filterProfesor) {
			const profNombre = (r.profesor_nombre ?? '').trim().toLowerCase();
			const targetFilter = filterProfesor.trim().toLowerCase();
			if (profNombre !== targetFilter && !profNombre.includes(targetFilter)) {
				return false;
			}
		}

		if (filterDia && (r.dia ?? '').toString() !== filterDia) return false;
		if (filterFranja && (r.franja ?? '').toString() !== filterFranja) return false;
		return true;
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden relative">
			
			<!-- Header con Pestañas de Importación -->
			<div class="px-6 pt-4 bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-700">
				<div class="flex items-center justify-between pb-3">
					<div>
						<h2 class="text-xl font-bold text-slate-900 dark:text-gray-100 flex items-center gap-2">
							📥 Importación de Horarios (Staging) - Bloques aSc
						</h2>
						<p class="text-xs text-slate-500 dark:text-gray-400">
							Curso activo: <strong class="text-sky-600 dark:text-sky-400">{selectedCurso}</strong>
						</p>
					</div>
					<button on:click={handleClose} class="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer">&times;</button>
				</div>

				<!-- Pestañas de Modo -->
				<div class="flex items-center gap-2 border-b border-slate-200 dark:border-gray-700 -mb-px">
					<button
						type="button"
						on:click={() => handleTabChange('actualizar')}
						class="px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'actualizar'
							? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-800 rounded-t-md'
							: 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'}"
					>
						🔄 Actualizar Curso Actual
					</button>
					<button
						type="button"
						on:click={() => handleTabChange('nuevo_curso')}
						class="px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer {activeTab === 'nuevo_curso'
							? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-800 rounded-t-md'
							: 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'}"
					>
						📅 Importar Nuevo Curso
					</button>
				</div>
			</div>

			<!-- Body -->
			<div class="p-6 overflow-y-auto flex-1 space-y-4">
				<!-- Configuración de Curso Objetivo Editable -->
				<div class="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
					<div class="text-xs">
						{#if activeTab === 'actualizar'}
							<span class="font-bold text-sky-900 dark:text-sky-200">Modo Actualizar:</span>
							<span class="text-slate-600 dark:text-gray-300"> Los datos existentes no se sobrescriben. Solo se añadirán/actualizarán los nuevos registros.</span>
						{:else}
							<span class="font-bold text-sky-900 dark:text-sky-200">Modo Nuevo Curso:</span>
							<span class="text-slate-600 dark:text-gray-300"> Los datos del curso actual quedarán intactos y los nuevos horarios se asociarán al nuevo periodo lectivo.</span>
						{/if}
					</div>

					<div class="flex items-center gap-2 shrink-0">
						<label for="input-target-curso" class="text-xs font-bold text-slate-700 dark:text-gray-300">
							Curso Objetivo:
						</label>
						<input
							id="input-target-curso"
							type="text"
							bind:value={targetCurso}
							placeholder="ej. 2026-2027"
							class="px-2.5 py-1 text-xs font-bold rounded-md border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 focus:outline-none w-28 text-center"
						/>
					</div>
				</div>

				{#if errorMessage}
					<div class="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm">
						⚠️ {errorMessage}
					</div>
				{/if}

				{#if successMessage}
					<div class="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-md text-sm">
						✅ {successMessage}
					</div>
				{/if}

				<!-- Alerta de borrador pendiente -->
				{#if pendingBatchInfo && !activeBatchId}
					<div class="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
						<div class="flex items-center gap-3">
							<span class="text-2xl">📑</span>
							<div>
								<h3 class="text-sm font-bold text-amber-900 dark:text-amber-200">
									Borrador pendiente en base de datos
								</h3>
								<p class="text-xs text-amber-700 dark:text-amber-300">
									Se han encontrado <strong>{pendingBatchInfo.count ?? 0}</strong> sesiones previamente procesadas para el curso {targetCurso}.
								</p>
							</div>
						</div>
						<div class="flex items-center gap-2 w-full sm:w-auto justify-end">
							<button
								type="button"
								on:click={() => (pendingBatchInfo = null)}
								class="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer"
							>
								Nueva importación
							</button>
							<button
								type="button"
								on:click={loadPendingBatch}
								class="px-4 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
							>
								Cargar borrador pendiente ({pendingBatchInfo.count ?? 0} sesiones)
							</button>
						</div>
					</div>
				{/if}

				{#if !activeBatchId}
					<!-- Selección de Configuración e Ingesta -->
					<div class="space-y-4 bg-slate-50 dark:bg-gray-900/40 p-5 rounded-lg border border-slate-200 dark:border-gray-700">
						<!-- Selección de Formato mediante Botones de Opción -->
						<div>
							<span class="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-2">
								Formato / Plantilla de Origen
							</span>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
								<button
									type="button"
									on:click={() => (format = 'periodo_multilinea')}
									class="p-4 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer {format === 'periodo_multilinea'
										? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500/20'
										: 'border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:border-slate-400'}"
								>
									<div class="flex items-center justify-between mb-1">
										<span class="font-bold text-sm">Importar Excel de aSc (Estructura de Bloques)</span>
										<input type="radio" name="format" checked={format === 'periodo_multilinea'} class="text-sky-600 focus:ring-sky-500" />
									</div>
									<p class="text-xs text-slate-500 dark:text-gray-400">
										Procesa bloques verticales por profesor separando Asignatura (Fila 1) y Clase/Aula (Fila 2).
									</p>
								</button>

								<button
									type="button"
									on:click={() => (format = 'matriz_profesor')}
									class="p-4 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer {format === 'matriz_profesor'
										? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500/20'
										: 'border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 hover:border-slate-400'}"
								>
									<div class="flex items-center justify-between mb-1">
										<span class="font-bold text-sm">Matriz por Profesor</span>
										<input type="radio" name="format" checked={format === 'matriz_profesor'} class="text-sky-600 focus:ring-sky-500" />
									</div>
									<p class="text-xs text-slate-500 dark:text-gray-400">
										Hojas individuales por profesor (matriz de actividades y clases).
									</p>
								</button>
							</div>
						</div>

						<!-- Selección de Archivo -->
						<div>
							<span class="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase mb-1">
								Seleccionar Archivo Excel (.xlsx / .xls)
							</span>
							<div class="flex items-center gap-3">
								<input
									type="file"
									accept=".xlsx, .xls"
									bind:this={fileInput}
									on:change={handleFileSelect}
									disabled={isProcessing}
									class="hidden"
									id="excel-file-input"
								/>
								<label
									for="excel-file-input"
									class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-semibold cursor-pointer transition-colors"
								>
									📁 {selectedFile ? 'Cambiar Archivo' : 'Seleccionar Archivo'}
								</label>
								{#if selectedFile}
									<span class="text-xs font-medium text-slate-700 dark:text-gray-300 bg-slate-200 dark:bg-gray-700 px-3 py-1.5 rounded-md">
										📄 {selectedFile.name ?? 'archivo'} ({((selectedFile.size ?? 0) / 1024).toFixed(1)} KB)
									</span>
								{:else}
									<span class="text-xs text-slate-400 italic">Ningún archivo seleccionado</span>
								{/if}
							</div>
						</div>

						<!-- Botón de Ejecutar Procesamiento -->
						<div class="pt-2 flex justify-end">
							<button
								type="button"
								on:click={handleExecuteProcess}
								disabled={!selectedFile || isProcessing || !targetCurso.trim()}
								class="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
							>
								⚡ Ejecutar Procesamiento
							</button>
						</div>

						<!-- Barra e indicador de progreso -->
						{#if isProcessing}
							<div class="space-y-2 pt-2">
								<div class="flex justify-between text-xs text-sky-700 dark:text-sky-300 font-semibold">
									<span>Procesando bloques de celdas y validando sesiones...</span>
									<span>Por favor espera...</span>
								</div>
								<div class="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
									<div class="bg-sky-600 h-2.5 rounded-full animate-pulse w-full"></div>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Barra de Estadísticas y Filtros -->
					<div class="flex flex-wrap items-center justify-between gap-3 bg-sky-50 dark:bg-sky-950/20 p-3 rounded-lg border border-sky-200 dark:border-sky-800">
						<div class="flex items-center gap-4 text-xs font-bold">
							<span class="text-slate-700 dark:text-gray-300">Total Sesiones Procesadas: {stagingRows?.length ?? 0}</span>
							{#if filterProfesor}
								<span class="text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 px-2 py-0.5 rounded-md">
									Profesor: {filterProfesor} ({filteredRows.length} sesiones)
								</span>
							{/if}
						</div>

						<!-- Conmutador de vista + Filtros -->
						<div class="flex flex-wrap items-center gap-3 text-xs">
							<!-- Botones Vista -->
							<div class="flex bg-slate-200 dark:bg-gray-700 p-0.5 rounded-md">
								<button
									type="button"
									on:click={() => (viewMode = 'tabla')}
									class="px-2.5 py-1 rounded-sm text-xs font-bold transition-all cursor-pointer {viewMode === 'tabla'
										? 'bg-white dark:bg-gray-800 text-sky-600 shadow-xs'
										: 'text-slate-600 dark:text-gray-300'}"
								>
									📋 Tabla
								</button>
								<button
									type="button"
									on:click={() => (viewMode = 'rejilla')}
									class="px-2.5 py-1 rounded-sm text-xs font-bold transition-all cursor-pointer {viewMode === 'rejilla'
										? 'bg-white dark:bg-gray-800 text-sky-600 shadow-xs'
										: 'text-slate-600 dark:text-gray-300'}"
								>
									📅 Horario / Rejilla
								</button>
							</div>

							<!-- Filtro por Profesor -->
							<select bind:value={filterProfesor} class="px-2 py-1 rounded-md border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-medium">
								<option value="">-- Todos los Profesores --</option>
								{#each profesoresUnicos as prof}
									<option value={prof}>{prof}</option>
								{/each}
							</select>

							{#if viewMode === 'tabla'}
								<select bind:value={filterDia} class="px-2 py-1 rounded-md border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700">
									<option value="">Todos los Días</option>
									<option value="0">Lunes (0)</option>
									<option value="1">Martes (1)</option>
									<option value="2">Miércoles (2)</option>
									<option value="3">Jueves (3)</option>
									<option value="4">Viernes (4)</option>
								</select>
							{/if}
						</div>
					</div>

					{#if viewMode === 'tabla'}
						<!-- Tabla de Inspección e Edición Inline con separador de celdas parseadas -->
						<div class="overflow-x-auto border border-slate-200 dark:border-gray-700 rounded-lg max-h-96">
							<table class="w-full text-left text-xs">
								<thead class="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 font-bold sticky top-0">
									<tr>
										<th class="p-2">Profesor / Perfil</th>
										<th class="p-2">Día</th>
										<th class="p-2">Franja</th>
										<th class="p-2">Actividad / Asignatura (Fila 1)</th>
										<th class="p-2">Clase / Aula (Fila 2)</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-200 dark:divide-gray-700">
									{#each filteredRows as row (row?.id || `${row?.profesor_nombre ?? 'Profesor'}-${row?.dia ?? 0}-${row?.franja ?? 0}`)}
										{@const parsed = parseExcelCellContent(row?.actividad, row?.clase, row?.aula)}
										<tr class="hover:bg-slate-50 dark:hover:bg-gray-800">
											<td class="p-2">
												<input
													type="text"
													value={row?.profesor_nombre ?? ''}
													on:blur={(e) => handleCellBlur(row, 'profesor_nombre', e.currentTarget.value)}
													class="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 font-medium"
												/>
												{#if row?.perfil_profesor || row?.tipo_jornada}
													<div class="flex items-center gap-1 text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
														{#if row?.perfil_profesor}
															<span class="px-1.5 py-0.2 bg-slate-200 dark:bg-gray-700 rounded-xs">{row.perfil_profesor ?? ''}</span>
														{/if}
														{#if row?.tipo_jornada}
															<span class="px-1.5 py-0.2 bg-slate-200 dark:bg-gray-700 rounded-xs">{row.tipo_jornada ?? ''}</span>
														{/if}
													</div>
												{/if}
											</td>
											<td class="p-2">
												<input
													type="number"
													min="0"
													max="4"
													value={row?.dia ?? 0}
													on:blur={(e) => handleCellBlur(row, 'dia', parseInt(e.currentTarget.value, 10) || 0)}
													class="w-12 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 text-center"
												/>
											</td>
											<td class="p-2">
												<input
													type="number"
													min="0"
													max="9"
													value={row?.franja ?? 0}
													on:blur={(e) => handleCellBlur(row, 'franja', parseInt(e.currentTarget.value, 10) || 0)}
													class="w-12 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 text-center"
												/>
											</td>
											<td class="p-2">
												<input
													type="text"
													value={parsed.actividad}
													on:blur={(e) => handleCellBlur(row, 'actividad', e.currentTarget.value)}
													class="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 font-semibold text-sky-700 dark:text-sky-300"
												/>
											</td>
											<td class="p-2">
												<input
													type="text"
													value={parsed.clase}
													on:blur={(e) => handleCellBlur(row, 'clase', e.currentTarget.value)}
													class="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 text-emerald-700 dark:text-emerald-300"
												/>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<!-- Vista Horario Rejilla Semanal Staging -->
						{#if !filterProfesor}
							<div class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-md text-xs font-medium">
								💡 Por favor, selecciona un profesor en el desplegable superior para visualizar su cuadrante de horario semanal.
							</div>
						{/if}

						<StagingScheduleGrid
							rows={stagingRows}
							selectedProfesor={filterProfesor}
						/>
					{/if}

					<div class="flex items-center gap-2 pt-2 text-xs">
						<label class="flex items-center gap-1.5 text-slate-700 dark:text-gray-300 cursor-pointer">
							<input type="checkbox" bind:checked={reemplazarExistentes} />
							Reemplazar totalmente las sesiones existentes del curso <strong>{targetCurso}</strong>
						</label>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="px-6 py-4 bg-slate-50 dark:bg-gray-800/80 border-t border-slate-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
				<div class="flex flex-wrap items-center gap-2">
					{#if activeBatchId || pendingBatchInfo}
						<button
							type="button"
							on:click={handleDesechar}
							disabled={isProcessing}
							class="px-3.5 py-2 rounded-md border border-red-300 dark:border-red-800/60 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer"
						>
							🗑️ Desechar Borrador
						</button>
					{/if}

					<button
						type="button"
						on:click={handleVaciarTablaStaging}
						disabled={isProcessing}
						class="px-3.5 py-2 rounded-md border border-amber-300 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer"
						title="Elimina todos los borradores temporales acumulados en la tabla sesiones_staging"
					>
						🧹 Vaciar Tabla Temporal
					</button>
				</div>

				<div class="flex items-center gap-3">
					<button
						type="button"
						on:click={handleClose}
						class="px-4 py-2 rounded-md border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
					>
						Cancelar / Cerrar
					</button>

					{#if activeBatchId}
						<button
							type="button"
							on:click={openImplantarConfirmation}
							disabled={isProcessing || stagingRows.length === 0}
							class="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer"
						>
							🚀 Implantar ({stagingRows.length ?? 0} sesiones)
						</button>
					{/if}
				</div>
			</div>

			<!-- Sub-Modal / Diálogo de Confirmación con Cuenta Atrás -->
			{#if showConfirmModal}
				<div class="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-amber-300 dark:border-amber-700 max-w-lg w-full p-6 space-y-4">
						<div class="flex items-center gap-3 text-amber-600 dark:text-amber-400">
							<span class="text-3xl">⚠️</span>
							<h3 class="text-lg font-bold text-slate-900 dark:text-gray-100">
								Confirmar Implantación Definitiva
							</h3>
						</div>

						<p class="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
							Atención: Se van a implantar <strong class="text-slate-900 dark:text-white font-bold">{stagingRows.length ?? 0} sesiones</strong> en la base de datos para el curso objetivo (<strong class="text-sky-600 dark:text-sky-400">{targetCurso}</strong>).
							{#if reemplazarExistentes}
								Este proceso reemplazará totalmente la planificación del curso {targetCurso}.
							{:else}
								Este proceso añadirá/actualizará las sesiones sin eliminar las no coincidentes.
							{/if}
						</p>

						<div class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-800 dark:text-amber-200">
							{#if countdownSeconds > 0}
								⏱️ Por favor, lea atentamente la advertencia. Botón disponible en: <strong class="text-sm font-bold">{countdownSeconds}s</strong>
							{:else}
								✅ Verificación completada. Ya puede confirmar la implantación.
							{/if}
						</div>

						<div class="flex justify-end gap-3 pt-2">
							<button
								type="button"
								on:click={closeConfirmModal}
								class="px-4 py-2 rounded-md border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-gray-700 cursor-pointer"
							>
								Cancelar
							</button>
							<button
								type="button"
								on:click={handleImplantarConfirmado}
								disabled={countdownSeconds > 0 || isProcessing}
								class="px-5 py-2 rounded-md font-bold text-xs shadow-md transition-all cursor-pointer disabled:cursor-not-allowed {countdownSeconds > 0
									? 'bg-slate-300 dark:bg-gray-700 text-slate-500 dark:text-gray-500'
									: 'bg-emerald-600 hover:bg-emerald-700 text-white'}"
							>
								{#if countdownSeconds > 0}
									Sí, implantar horarios ({countdownSeconds}s)
								{:else}
									🚀 Sí, implantar horarios definitivamente
								{/if}
							</button>
						</div>
					</div>
				</div>
			{/if}

		</div>
	</div>
{/if}