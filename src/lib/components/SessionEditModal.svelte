<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Session } from '$lib/types/schedule';

	export let isOpen: boolean = false;
	export let session: Partial<Session> | null = null;
	export let profesores: Array<{ id: string; nombre: string }> = [];
	export let actividades: Array<{ id: number; nombre: string }> = [];
	export let aulas: Array<{ id: string; nombre: string }> = [];

	const dispatch = createEventDispatcher<{
		save: Partial<Session>;
		close: void;
		delete: { id: string };
	}>();

	let formData: Partial<Session> = {};

	$: if (session) {
		formData = { ...session };
	} else {
		formData = {
			profesor_nombre: '',
			actividad: '',
			aula: '',
			dia_semana: 1,
			tramo_id: 1,
			minutos: 45
		};
	}

	function handleSave() {
		dispatch('save', formData);
	}

	function handleClose() {
		dispatch('close');
	}

	function handleDelete() {
		if (formData.id) {
			dispatch('delete', { id: String(formData.id) });
		}
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" role="dialog" aria-modal="true">
		<div class="modal-content">
			<header class="modal-header">
				<h2>{formData.id ? 'Editar Sesión' : 'Nueva Sesión'}</h2>
				<button class="btn-close" on:click={handleClose}>&times;</button>
			</header>

			<form on:submit|preventDefault={handleSave} class="modal-body">
				<div class="form-group">
					<label for="profesor">Profesor</label>
					<select id="profesor" bind:value={formData.profesor_nombre}>
						<option value="">-- Seleccionar Profesor --</option>
						{#each profesores as prof}
							<option value={prof.nombre}>{prof.nombre}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="actividad">Actividad / Asignatura</label>
					<select id="actividad" bind:value={formData.actividad}>
						<option value="">-- Seleccionar Actividad --</option>
						{#each actividades as act}
							<option value={act.nombre}>{act.nombre}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="aula">Aula</label>
					<select id="aula" bind:value={formData.aula}>
						<option value="">-- Seleccionar Aula --</option>
						{#each aulas as aula}
							<option value={aula.nombre}>{aula.nombre}</option>
						{/each}
					</select>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="dia">Día de la semana</label>
						<select id="dia" bind:value={formData.dia_semana}>
							<option value={1}>Lunes</option>
							<option value={2}>Martes</option>
							<option value={3}>Miércoles</option>
							<option value={4}>Jueves</option>
							<option value={5}>Viernes</option>
						</select>
					</div>

					<div class="form-group">
						<label for="minutos">Minutos</label>
						<input id="minutos" type="number" bind:value={formData.minutos} min="0" step="5" />
					</div>
				</div>

				<footer class="modal-footer">
					{#if formData.id}
						<button type="button" class="btn-danger" on:click={handleDelete}>
							Eliminar
						</button>
					{/if}
					<div class="actions-right">
						<button type="button" class="btn-secondary" on:click={handleClose}>
							Cancelar
						</button>
						<button type="submit" class="btn-primary">
							Guardar
						</button>
					</div>
				</footer>
			</form>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: #ffffff;
		border-radius: 8px;
		width: 100%;
		max-width: 500px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
	}

	.modal-body {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.form-group input,
	.form-group select {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 1rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
	}

	.form-row .form-group {
		flex: 1;
	}

	.modal-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
		margin-top: 0.5rem;
	}

	.actions-right {
		display: flex;
		gap: 0.5rem;
		margin-left: auto;
	}

	button {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		border: none;
		cursor: pointer;
		font-weight: 500;
	}

	.btn-primary {
		background-color: #2563eb;
		color: white;
	}

	.btn-secondary {
		background-color: #e5e7eb;
		color: #374151;
	}

	.btn-danger {
		background-color: #ef4444;
		color: white;
	}
</style>
