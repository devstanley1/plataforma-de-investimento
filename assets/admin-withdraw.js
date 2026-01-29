
// Defina diretamente os valores reais do seu Supabase:
const SUPABASE_URL = 'https://hnbwamaqdmfdwaqtyxkc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYndhbWFxZG1mZHdhcXR5eGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTYxMTIsImV4cCI6MjA4NDg5MjExMn0.cOKmgk3KtuvpP2UQWUiDOwp_AC9T__EAnFODTtn95zs';

(async () => {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const session = supabase.auth.session ? await supabase.auth.session() : null;
  const user = session?.user;
  if (!user) {
    alert('Faça login como administrador.');
    window.location.href = '/pages/admin-login.html';
    return;
  }
  // Buscar perfil do usuário
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
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
    headers: { 'Authorization': `Bearer ${session.access_token}` }
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
    tr.innerHTML = `
      <td>${req.id}</td>
      <td>${req.user_id}</td>
      <td>R$ ${Number(req.amount).toFixed(2)}</td>
      <td>${req.pix_key}</td>
      <td>${req.status}</td>
      <td class="actions">
        <button onclick="aprovarSaque('${req.id}')">Aprovar</button>
        <button onclick="reprovarSaque('${req.id}')">Reprovar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
})();

window.aprovarSaque = async function(id) {
  if (!confirm('Deseja aprovar este saque?')) return;
  await fetch(`/api/admin/withdraw-requests/${id}/approve`, { method: 'POST' });
  location.reload();
};
window.reprovarSaque = async function(id) {
  const motivo = prompt('Motivo da reprovação:');
  if (!motivo) return;
  await fetch(`/api/admin/withdraw-requests/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: motivo })
  });
  location.reload();
};
