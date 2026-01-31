
// Defina diretamente os valores reais do seu Supabase:
const SUPABASE_URL = 'https://hnbwamaqdmfdwaqtyxkc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYndhbWFxZG1mZHdhcXR5eGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTYxMTIsImV4cCI6MjA4NDg5MjExMn0.cOKmgk3KtuvpP2UQWUiDOwp_AC9T__EAnFODTtn95zs';


(async () => {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  // Recuperar token salvo pelo login
  const sessionStr = localStorage.getItem('session');
  let access_token = null;
  try {
    access_token = sessionStr ? JSON.parse(sessionStr).access_token : null;
  } catch { access_token = null; }
  if (!access_token) {
    alert('Faça login como administrador.');
    window.location.href = '/pages/admin-login.html';
    return;
  }
  // Buscar usuário autenticado pelo token
  const { data: userData, error: userError } = await supabase.auth.getUser(access_token);
  if (userError || !userData?.user) {
    alert('Faça login como administrador.');
    window.location.href = '/pages/admin-login.html';
    return;
  }
  // Buscar perfil do usuário
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .single();
  if (profileError || !profile?.is_admin) {
    alert('Acesso restrito a administradores.');
    window.location.href = '/pages/admin-login.html';
    return;
  }

  const tbody = document.getElementById('withdraw-body');
  tbody.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';

  // Buscar solicitações de saque pendentes
  let { data, error } = await fetch('/api/admin/withdraw-requests', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  }).then(r => r.json());
  if (error || !data) {
    tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar: ${error || 'desconhecido'}</td></tr>`;
    return;
  }
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6">Nenhuma solicitação pendente.</td></tr>';
    return;
  }
  tbody.innerHTML = '';
  data.forEach(req => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-zinc-800 transition-colors';
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">${req.id.slice(0, 8)}...</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${req.user_id.slice(0, 8)}...</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">R$ ${Number(req.amount).toFixed(2)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-medium">- R$ ${Number(req.tax_amount || 0).toFixed(2)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">R$ ${Number(req.net_amount || req.amount).toFixed(2)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${req.pix_key}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'PENDING' ? 'bg-yellow-900/30 text-yellow-400' :
        req.status === 'PAID' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
      }">
          ${req.status}
        </span>
        ${req.status === 'FAILED' && req.vizzion_response ?
        `<div class="mt-1"><small class="text-red-500 cursor-help" title="${JSON.stringify(req.vizzion_response).replace(/"/g, "'")}">
             ${req.vizzion_response.error || req.vizzion_response.message || 'Erro Detalhado'}
           </small></div>` : ''}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        ${req.status === 'PENDING' ? `
          <button onclick="aprovarSaque('${req.id}')" class="text-green-500 hover:text-green-400">Aprovar</button>
          <button onclick="reprovarSaque('${req.id}')" class="text-red-500 hover:text-red-400">Reprovar</button>
        ` : '<span class="text-gray-600">-</span>'}
      </td>
    `;
    tbody.appendChild(tr);
  });
})();

window.aprovarSaque = async function (id) {
  if (!confirm('Deseja aprovar este saque?')) return;
  const sessionStr = localStorage.getItem('session');
  let access_token = null;
  try {
    access_token = sessionStr ? JSON.parse(sessionStr).access_token : null;
  } catch { access_token = null; }
  if (!access_token) {
    alert('Faça login como administrador.');
    window.location.href = '/pages/admin-login.html';
    return;
  }
  await fetch(`/api/admin/withdraw-requests/${id}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  location.reload();
};
window.reprovarSaque = async function (id) {
  const motivo = prompt('Motivo da reprovação:');
  if (!motivo) return;
  const sessionStr = localStorage.getItem('session');
  let access_token = null;
  try {
    access_token = sessionStr ? JSON.parse(sessionStr).access_token : null;
  } catch { access_token = null; }
  if (!access_token) {
    alert('Faça login como administrador.');
    window.location.href = '/pages/admin-login.html';
    return;
  }
  await fetch(`/api/admin/withdraw-requests/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    },
    body: JSON.stringify({ reason: motivo })
  });
  location.reload();
};
