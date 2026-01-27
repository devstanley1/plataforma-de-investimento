async function getSupabaseClient() {
  if (window.supabaseReady) {
    await window.supabaseReady;
  }
  if (window.supabaseClient) return window.supabaseClient;
  throw new Error('Supabase não configurado.');
}

async function loadSession() {
  const supabase = await getSupabaseClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      throw new Error('Sessão inválida');
    }

    await syncWalletBalance(supabase, data.user.id);
    startWalletPolling(supabase, data.user.id);

    const email = data.user.email || '';
    const fallbackName = email ? email.split('@')[0] : 'Usuário';
    const name = data.user.user_metadata?.name || localStorage.getItem('userName') || fallbackName;
    const el = document.getElementById('user-name');
    if (el) {
      el.textContent = name;
    }
    const emailEl = document.getElementById('user-email');
    if (emailEl) {
      emailEl.textContent = email;
    }

    document.querySelectorAll('.auth-only').forEach((el) => {
      el.classList.remove('auth-only');
    });
  } catch (e) {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
  }
}

async function syncWalletBalance(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return;

    const balance = Number(data?.balance || 0);
    localStorage.setItem('userBalance', String(balance));
    updateBalanceUI(balance);
  } catch {
    return;
  }
}

function updateBalanceUI(balance) {
  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatted = formatter.format(balance || 0);
  const elements = [
    document.getElementById('available-balance'),
    document.getElementById('user-balance')
  ].filter(Boolean);

  elements.forEach((el) => {
    el.textContent = formatted;
  });
}

function startWalletPolling(supabase, userId) {
  const intervalMs = 15000;
  if (window.__walletPolling) return;
  window.__walletPolling = setInterval(() => {
    syncWalletBalance(supabase, userId);
  }, intervalMs);
}

function setupLogout() {
  const logout = document.getElementById('logout-link') || document.getElementById('logout-button');
  if (!logout) return;
  logout.addEventListener('click', async (e) => {
    e.preventDefault();
    const supabase = await getSupabaseClient();
    supabase.auth.signOut().finally(() => {
      localStorage.removeItem('userName');
      window.location.href = 'login.html';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadSession();
  setupLogout();
});
