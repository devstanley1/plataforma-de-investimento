function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

async function loadProfileStats() {
  try {
    if (!window.supabaseClient) return;
    const supabase = window.supabaseClient;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();
    const balance = Number(wallet?.balance || 0);
    const balanceEl = document.getElementById('user-balance');
    if (balanceEl) balanceEl.textContent = formatCurrency(balance);
  } catch {}
  // Renda pode ser mantida do localStorage, se necessário
  const income = Number(localStorage.getItem('userIncome') || '0');
  const incomeEl = document.getElementById('user-income');
  if (incomeEl) incomeEl.textContent = formatCurrency(income);
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfileStats();
});
