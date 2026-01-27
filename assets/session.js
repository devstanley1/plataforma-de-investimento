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

function setupLogout() {
  const logout = document.getElementById('logout-link') || document.getElementById('logout-button');
  if (!logout) return;
  logout.addEventListener('click', (e) => {
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
