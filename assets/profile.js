function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

async function loadProfileStats() {
  try {
    if (!window.supabaseClient) throw new Error('Supabase não inicializado');
    const supabase = window.supabaseClient;
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) throw new Error('Usuário não autenticado');
    const userId = userData.user.id;
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();
    if (walletError) throw new Error('Erro ao buscar saldo: ' + walletError.message);
    const balance = Number(wallet?.balance || 0);
    const balanceEl = document.getElementById('user-balance');
    if (balanceEl) balanceEl.textContent = formatCurrency(balance);
  } catch (e) {
    const balanceEl = document.getElementById('user-balance');
    if (balanceEl) balanceEl.textContent = 'Erro ao carregar saldo';
    const errorEl = document.createElement('p');
    errorEl.style.color = 'red';
    errorEl.style.fontSize = '12px';
    errorEl.textContent = e.message || 'Erro ao carregar saldo';
    if (balanceEl && balanceEl.parentNode) {
      balanceEl.parentNode.appendChild(errorEl);
    }
  }
  // Renda pode ser mantida do localStorage, se necessário
  const income = Number(localStorage.getItem('userIncome') || '0');
  const incomeEl = document.getElementById('user-income');
  if (incomeEl) incomeEl.textContent = formatCurrency(income);
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfileStats();
});
