// admin-withdraw.js
// Exige autenticação de admin (exemplo simples, ajuste conforme seu controle de admin)


import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

(async () => {
  const SUPABASE_URL = window.SUPABASE_URL || localStorage.getItem('SUPABASE_URL');
  const SUPABASE_KEY = window.SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const session = supabase.auth.session ? await supabase.auth.session() : null;
  const user = session?.user;
  if (!user) {
    alert('Faça login como administrador.');
    window.location.href = '/pages/login.html';
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
    window.location.href = '/pages/login.html';
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
