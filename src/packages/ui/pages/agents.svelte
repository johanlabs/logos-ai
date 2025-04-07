<script>
  import { writable } from 'svelte/store';

  // Lista de agentes no estado
  const agents = writable([
    { id: 1, name: 'Agente 1', instructions: 'Instruções do agente 1', plugins: ['Plugin 1'] },
    { id: 2, name: 'Agente 2', instructions: 'Instruções do agente 2', plugins: [] },
  ]);

  // Estado da modal
  let shdashboardowModal = false;
  let editAgent = null;

  // Variáveis da modal
  let agentName = '';
  let agentInstructions = '';
  let agentPlugins = '';
  
  // Função para abrir a modal com dados de um agente
  function openModal(agent = null) {
    editAgent = agent;
    agentName = agent ? agent.name : '';
    agentInstructions = agent ? agent.instructions : '';
    agentPlugins = agent ? agent.plugins.join(', ') : '';
    showModal = true;
  }

  // Função para fechar a modal
  function closeModal() {
    showModal = false;
    agentName = '';
    agentInstructions = '';
    agentPlugins = '';
  }

  // Função para salvar o agente
  function saveAgent() {
    const plugins = agentPlugins.split(',').map(p => p.trim());
    const newAgent = { name: agentName, instructions: agentInstructions, plugins };

    if (editAgent) {
      // Editar agente existente
      const index = $agents.findIndex(a => a.id === editAgent.id);
      $agents[index] = { ...newAgent, id: editAgent.id };
    } else {
      // Adicionar novo agente
      $agents.push({ ...newAgent, id: Date.now() });
    }
    closeModal();
  }

  // Função para deletar um agente
  function deleteAgent(id) {
    $agents = $agents.filter(agent => agent.id !== id);
  }
</script>

<style>
  /* Estilos do painel */
  .panel {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 20px auto;
  }

  .agent-list {
    list-style: none;
    padding: 0;
  }

  .agent-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .agent-item button {
    background-color: #ff4d4d;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
  }

  .agent-item button.edit {
    background-color: #4caf50;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    min-width: 300px;
  }

  .modal input,
  .modal textarea {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }

  .modal button {
    padding: 8px 15px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .modal button.cancel {
    background-color: #f44336;
  }
</style>

<div class="panel">
  <h2>Agentes</h2>
  <button on:click="{() => openModal()}">Adicionar Agente</button>

  <ul class="agent-list">
    {#each $agents as agent (agent.id)}
      <li class="agent-item">
        <div>
          <strong>{agent.name}</strong>
          <p>{agent.instructions}</p>
          <p>Plugins: {agent.plugins.join(', ')}</p>
        </div>
        <div>
          <button class="edit" on:click="{() => openModal(agent)}">Editar</button>
          <button on:click="{() => deleteAgent(agent.id)}">Excluir</button>
        </div>
      </li>
    {/each}
  </ul>
</div>

{#if showModal}
  <div class="modal">
    <div class="modal-content">
      <h3>{editAgent ? 'Editar Agente' : 'Adicionar Agente'}</h3>
      <input type="text" bind:value="{agentName}" placeholder="Nome do Agente" />
      <textarea bind:value="{agentInstructions}" placeholder="Instruções"></textarea>
      <input type="text" bind:value="{agentPlugins}" placeholder="Plugins (separados por vírgula)" />
      <div>
        <button on:click="{saveAgent}">{editAgent ? 'Salvar' : 'Adicionar'}</button>
        <button class="cancel" on:click="{closeModal}">Cancelar</button>
      </div>
    </div>
  </div>
{/if}
