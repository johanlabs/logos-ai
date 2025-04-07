<script>
	import { page } from '$app/stores';
	import "../app.css";
	import Agentes from './agentes.svelte';
  
	// Definir o título do dashboard dinamicamente com base na rota atual
	let title = 'Dashboard';
	$: {
	  if ($page.url.pathname.includes('agentes')) {
		title = 'Agentes';
	  } else if ($page.url.pathname.includes('instancias')) {
		title = 'Instâncias';
	  } else if ($page.url.pathname.includes('marketplace')) {
		title = 'Marketplace';
	  }
	}
</script>

<div class="flex min-h-screen">
	<!-- Sidebar -->
	<aside class="w-64 bg-gray-900 text-white p-6">
	  <div class="flex justify-center mb-10">
		<h2 class="text-2xl font-bold">Johan Self</h2>
	  </div>
	  <nav>
		<ul class="space-y-6">
			<li>
				<a href="/agentes" class="flex items-center text-lg text-white hover:bg-gray-800 p-4 rounded">
					<i class="far fa-user mr-4"></i>
					Agentes
				</a>
			</li>
			<li>
				<a href="/instancias" class="flex items-center text-lg text-white hover:bg-gray-800 p-4 rounded">
					<i class="far fa-server mr-4"></i>
					Instâncias
				</a>
			</li>
			<li>
				<a href="/marketplace" class="flex items-center text-lg text-white hover:bg-gray-800 p-4 rounded">
					<i class="far fa-store-alt mr-4"></i>
					Marketplace
				</a>
			</li>
		</ul>
	  </nav>
	</aside>
  
	<!-- Main Content -->
	<main class="flex-1 p-10">
	  <header class="mb-6">
		<h1 class="text-3xl font-bold text-gray-900">{title}</h1>
	  </header>
	  <div class="bg-white p-10 shadow rounded">
		<Agentes />
	  </div>
	</main>
</div>
