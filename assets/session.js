async function getSupabaseClient() {
  if (window.supabaseReady) {
    await window.supabaseReady;
  }
  if (window.supabaseClient) return window.supabaseClient;
  throw new Error('Supabase não configurado.');
}

async function loadSession() {
  const supabase = await getSupabaseClient();

  // Use refreshSession instead of getSession to get fresh token
  const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
  const session = sessionData?.session;

  if (sessionError || !session) {
    // Fallback to getSession if refresh fails
    const { data: fallbackData } = await supabase.auth.getSession();
    if (!fallbackData?.session) {
      window.location.href = 'login.html';
      return;
    }
  }

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      throw new Error('Sessão inválida');
    }

    await syncWalletBalance(supabase, data.user.id);

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

    // Setup periodic refresh every 5 minutes
    setupPeriodicRefresh(supabase, data.user.id);
  } catch (e) {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
  }
}

// Periodic session and balance refresh
function setupPeriodicRefresh(supabase, userId) {
  setInterval(async () => {
    try {
      await supabase.auth.refreshSession();
      await syncWalletBalance(supabase, userId);
    } catch (e) {
      console.error('Refresh failed:', e);
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

async function syncWalletBalance(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching balance:', error);
      return;
    }

    const balance = Number(data?.balance || 0);
    localStorage.setItem('userBalance', String(balance));

    // Update balance display if element exists
    const balanceEl = document.getElementById('user-balance');
    if (balanceEl) {
      balanceEl.textContent = `R$ ${balance.toFixed(2)}`;
    }

    // Dispatch event for other components that need balance updates
    window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: { balance } }));
  } catch (e) {
    console.error('Balance sync error:', e);
    return;
  }
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
