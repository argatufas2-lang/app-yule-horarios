<script lang="ts">
	export let ciclo: string = 'Primaria (LH)';
	export let curso: string = '2026-2027';
	export let totalProfesorado: number = 0;
</script>

<header class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
	<div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
		<!-- Logotipo y Título -->
		<div class="flex items-center space-x-3">
			<div class="bg-indigo-600 text-white p-2.5 rounded-xl font-bold text-xl shadow-md flex items-center justify-center w-10 h-10">
				G
			</div>
			<div>
				<h1 class="text-xl font-bold text-gray-900 tracking-tight">GANIVET Herri Ikastetxea</h1>
				<p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Gestión de Horarios</p>
			</div>
		</div>

		<!-- Tarjetas de estado superior -->
		<div class="flex flex-wrap items-center gap-3">
			<!-- Ciclo Activo -->
			<div class="bg-gray-50 border border-gray-200/80 rounded-xl px-4 py-2 flex items-center space-x-3 shadow-xs">
				<div class="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
					</svg>
				</div>
				<div>
					<span class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ciclo</span>
					<span class="text-sm font-semibold text-gray-800">{ciclo}</span>
				</div>
			</div>

			<!-- Curso Escolar -->
			<div class="bg-gray-50 border border-gray-200/80 rounded-xl px-4 py-2 flex items-center space-x-3 shadow-xs">
				<div class="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
				<div>
					<span class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Curso</span>
					<span class="text-sm font-semibold text-gray-800">{curso}</span>
				</div>
			</div>

			<!-- Profesorado Total -->
			<div class="bg-gray-50 border border-gray-200/80 rounded-xl px-4 py-2 flex items-center space-x-3 shadow-xs">
				<div class="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
				</div>
				<div>
					<span class="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Profesorado</span>
					<span class="text-sm font-semibold text-gray-800">{totalProfesorado}</span>
				</div>
			</div>
		</div>
	</div>
</header>
