<script lang="ts">
	import ActionsView from '$lib/components/ActionsView.svelte';
	import ControlJornadaModal from '$lib/components/ControlJornadaModal.svelte';
	import ImportStagingModal from '$lib/components/import/ImportStagingModal.svelte';
	import AdminModal from '$lib/components/AdminModal.svelte';

	let isControlJornadaOpen: boolean = false;
	let showImportModal: boolean = false;
	let isAdminOpen: boolean = false;
	let selectedCurso: string = '2026-2027';
	let selectedEntityId: string = '';

	function handleSelectTeacherFromModal(event: CustomEvent<{ id: string; nombre: string }>) {
		if (event.detail && event.detail.id) {
			selectedEntityId = String(event.detail.id);
		}
	}

	function handleControlJornada() {
		isControlJornadaOpen = true;
	}

	function handleCloseControlJornada() {
		isControlJornadaOpen = false;
	}

	function handleOpenImportStaging() {
		showImportModal = true;
	}

	function handleCloseImportStaging() {
		showImportModal = false;
	}

	function handleOpenAdmin() {
		isAdminOpen = true;
	}

	function handleCloseAdmin() {
		isAdminOpen = false;
	}

	function handleCursoChange(event: CustomEvent<string>) {
		if (event.detail) {
			selectedCurso = event.detail;
		}
	}

	function handleImportedSuccess(event: CustomEvent<{ count: number }>) {
		alert(`¡Se han implantado ${event.detail.count} sesiones correctamente!`);
		showImportModal = false;
	}
</script>

<div class="min-h-screen bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
	<main class="max-w-7xl mx-auto p-4">
		<!-- Contenido principal con selectores y vistas de cuadrante/horarios -->
		<ActionsView
			bind:selectedEntityId={selectedEntityId}
			on:controlJornada={handleControlJornada}
			on:importarAsc={handleOpenImportStaging}
			on:administracion={handleOpenAdmin}
			on:selectCurso={handleCursoChange}
		/>
	</main>

	<!-- Módulo / Modal de Control de Jornada -->
	<ControlJornadaModal
		bind:isOpen={isControlJornadaOpen}
		{selectedCurso}
		on:close={handleCloseControlJornada}
		on:selectTeacher={handleSelectTeacherFromModal}
	/>

	<!-- Módulo / Modal de Importación Staging -->
	<ImportStagingModal
		bind:isOpen={showImportModal}
		{selectedCurso}
		on:close={handleCloseImportStaging}
		on:imported={handleImportedSuccess}
	/>

	<!-- Módulo / Modal de Administración -->
	<AdminModal
		bind:isOpen={isAdminOpen}
		{selectedCurso}
		on:close={handleCloseAdmin}
	/>
</div>
