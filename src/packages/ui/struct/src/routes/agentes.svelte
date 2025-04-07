<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  // Dados dos agentes
  let agents = writable([]);
  let filteredAgents = [];
  let searchName = '';
  let searchModel = '';
  let searchInstance = '';
  let currentPage = 1;
  const perPage = 10;

  // Estado do modal
  let showModal = false;
  let isEditing = false;
  let currentAgent = { id: null, name: '', model: '', instance: '' };

  // Opções para os selects
  const models = ['GPT-3.5', 'GPT-4', 'LLaMA', 'Grok'];
  const instances = ['Instance 1', 'Instance 2', 'Instance 3'];

  onMount(() => {
      // Dados iniciais de exemplo
      agents.set([
          { id: 1, name: 'Agent 1', model: 'GPT-3.5', instance: 'Instance 1' },
          { id: 2, name: 'Agent 2', model: 'Grok', instance: 'Instance 2' },
          // Adicione mais agentes conforme necessário
      ]);
  });

  $: {
      filteredAgents = $agents.filter(agent => 
          agent.name.toLowerCase().includes(searchName.toLowerCase()) &&
          (searchModel === '' || agent.model === searchModel) &&
          (searchInstance === '' || agent.instance === searchInstance)
      );
  }

  $: paginatedAgents = filteredAgents.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage
  );

  $: totalPages = Math.ceil(filteredAgents.length / perPage);

  function openModal(agent = null) {
      if (agent) {
          isEditing = true;
          currentAgent = { ...agent };
      } else {
          isEditing = false;
          currentAgent = { id: null, name: '', model: '', instance: '' };
      }
      showModal = true;
  }

  function closeModal() {
      showModal = false;
  }

  function saveAgent() {
      if (isEditing) {
          agents.update(items => 
              items.map(item => item.id === currentAgent.id ? currentAgent : item)
          );
      } else {
          agents.update(items => [
              ...items,
              { ...currentAgent, id: Date.now() }
          ]);
      }
      closeModal();
  }

  function deleteAgent(id) {
      if (confirm('Tem certeza que deseja excluir este agente?')) {
          agents.update(items => items.filter(item => item.id !== id));
      }
  }
</script>

<!-- Filtros -->
<div class="mb-6 flex gap-4">
  <input 
      bind:value={searchName}
      placeholder="Pesquisar por nome"
      class="p-2 border rounded"
  />
  <select bind:value={searchModel} class="p-2 border rounded">
      <option value="">Todos os modelos</option>
      {#each models as model}
          <option value={model}>{model}</option>
      {/each}
  </select>
  <select bind:value={searchInstance} class="p-2 border rounded">
      <option value="">Todas as instâncias</option>
      {#each instances as instance}
          <option value={instance}>{instance}</option>
      {/each}
  </select>
  <button 
      on:click={() => openModal()}
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  >
      Criar Agente
  </button>
</div>

<!-- Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {#each paginatedAgents as agent}
      <div class="border p-4 rounded shadow">
          <h3 class="font-bold">{agent.name}</h3>
          <p>Modelo: {agent.model}</p>
          <p>Instância: {agent.instance}</p>
          <div class="mt-2 flex gap-2">
              <button 
                  on:click={() => openModal(agent)}
                  class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
              >
                  Editar
              </button>
              <button 
                  on:click={() => deleteAgent(agent.id)}
                  class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                  Excluir
              </button>
          </div>
      </div>
  {/each}
</div>

<!-- Paginação -->
{#if totalPages > 1}
  <div class="mt-6 flex justify-center gap-2">
      <button 
          on:click={() => currentPage = Math.max(1, currentPage - 1)}
          disabled={currentPage === 1}
          class="px-4 py-2 border rounded"
      >
          Anterior
      </button>
      <span class="py-2">Página {currentPage} de {totalPages}</span>
      <button 
          on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
          disabled={currentPage === totalPages}
          class="px-4 py-2 border rounded"
      >
          Próximo
      </button>
  </div>
{/if}

<!-- Modal -->
{#if showModal}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow-lg w-96">
          <h2 class="text-xl font-bold mb-4">
              {isEditing ? 'Editar Agente' : 'Criar Agente'}
          </h2>
          <form on:submit|preventDefault={saveAgent}>
              <div class="mb-4">
                  <label class="block mb-1">Nome</label>
                  <input 
                      bind:value={currentAgent.name}
                      required
                      class="w-full p-2 border rounded"
                  />
              </div>
              <div class="mb-4">
                  <label class="block mb-1">Modelo</label>
                  <select 
                      bind:value={currentAgent.model}
                      required
                      class="w-full p-2 border rounded"
                  >
                      <option value="">Selecione um modelo</option>
                      {#each models as model}
                          <option value={model}>{model}</option>
                      {/each}
                  </select>
              </div>
              <div class="mb-4">
                  <label class="block mb-1">Instância</label>
                  <select 
                      bind:value={currentAgent.instance}
                      required
                      class="w-full p-2 border rounded"
                  >
                      <option value="">Selecione uma instância</option>
                      {#each instances as instance}
                          <option value={instance}>{instance}</option>
                      {/each}
                  </select>
              </div>
              <div class="flex justify-end gap-2">
                  <button 
                      type="button"
                      on:click={closeModal}
                      class="px-4 py-2 border rounded"
                  >
                      Cancelar
                  </button>
                  <button 
                      type="submit"
                      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                      {isEditing ? 'Salvar' : 'Criar'}
                  </button>
              </div>
          </form>
      </div>
  </div>
{/if}