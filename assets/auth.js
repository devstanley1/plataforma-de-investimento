async function getSupabaseClient() {
  if (window.supabaseReady) {
    await window.supabaseReady;
  }
  if (window.supabaseClient) return window.supabaseClient;
  throw new Error('Supabase não configurado.');
}

function setError(message) {
  const el = document.getElementById('form-error');
  if (!el) return;
  el.textContent = message || '';
  el.style.display = message ? 'block' : 'none';
}

async function handleLogin(event) {
  event.preventDefault();
  setError('');

  const form = event.currentTarget;
  const email = form.querySelector('[name="email"]').value.trim().toLowerCase();
  const password = form.querySelector('[name="password"]').value;

  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.user) {
      const message = String(error?.message || '').toLowerCase();
      if (message.includes('email not confirmed') || message.includes('confirm')) {
        throw new Error('Confirme seu email antes de entrar.');
      }
      throw new Error('Credenciais inválidas.');
    }

    localStorage.setItem('userName', data.user.user_metadata?.name || '');
    window.location.href = 'dashboard.html';
  } catch (err) {
    setError(err.message || 'Erro ao fazer login');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setError('');

  const form = event.currentTarget;
  const name = form.querySelector('[name="name"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim().toLowerCase();
  const phone = form.querySelector('[name="phone"]').value.trim();
  const password = form.querySelector('[name="password"]').value;
  const confirm = form.querySelector('[name="confirmPassword"]').value;

  if (password !== confirm) {
    setError('As senhas não coincidem.');
    return;
  }

  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone: phone || null
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'Erro ao criar conta');
    }

    if (!data?.session) {
      setError('Conta criada. Verifique seu email para confirmar o acesso.');
      return;
    }

    localStorage.setItem('userName', data.user?.user_metadata?.name || '');
    window.location.href = 'dashboard.html';
  } catch (err) {
    setError(err.message || 'Erro ao criar conta');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});
