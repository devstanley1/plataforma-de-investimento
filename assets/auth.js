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

function generateReferralCode() {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CONV-${part}`;
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function phoneToEmail(phone) {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  return `phone_${digits}@netflixinvest.local`;
}

async function handleLogin(event) {
  event.preventDefault();
  setError('');

  const form = event.currentTarget;
  const phoneInput = form.querySelector('[name="phone"]')?.value.trim();
  const emailInput = form.querySelector('[name="email"]')?.value.trim().toLowerCase();
  const password = form.querySelector('[name="password"]').value;
  const confirm = form.querySelector('[name="confirmPassword"]')?.value;

  if (confirm !== undefined && password !== confirm) {
    setError('As senhas não coincidem.');
    return;
  }

  try {
    const supabase = await getSupabaseClient();
    const credentials = { password };
    if (emailInput) {
      credentials.email = emailInput;
    } else if (phoneInput) {
      const emailAlias = phoneToEmail(phoneInput);
      if (!emailAlias) {
        throw new Error('Informe um telefone válido.');
      }
      credentials.email = emailAlias;
    } else {
      throw new Error('Informe seu telefone.');
    }

    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error || !data?.user) {
      const message = String(error?.message || '').toLowerCase();
      if (message.includes('email not confirmed') || message.includes('confirm')) {
        throw new Error('Confirme seu email antes de entrar.');
      }
      throw new Error('Credenciais inválidas.');
    }

    localStorage.setItem('userName', data.user.user_metadata?.name || '');
    window.location.href = 'products.html';
  } catch (err) {
    setError(err.message || 'Erro ao fazer login');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setError('');

  const form = event.currentTarget;
  const phone = form.querySelector('[name="phone"]').value.trim();
  const password = form.querySelector('[name="password"]').value;
  const confirm = form.querySelector('[name="confirmPassword"]').value;
  const referralCodeInput = form.querySelector('[name="referralCode"]')?.value.trim();
  const referralCode = generateReferralCode();

  if (!phone) {
    setError('Informe seu telefone.');
    return;
  }

  const phoneEmail = phoneToEmail(phone);
  if (!phoneEmail) {
    setError('Informe um telefone válido.');
    return;
  }

  if (password !== confirm) {
    setError('As senhas não coincidem.');
    return;
  }

  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: phoneEmail,
      password,
      options: {
        data: {
          phone: phone || null,
          referral_code: referralCode,
          referral_code_used: referralCodeInput || null
        }
      }
    });

    if (error) {
      const message = String(error.message || '').toLowerCase();
      if (message.includes('profiles_name_unique') || message.includes('name') && message.includes('duplicate')) {
        throw new Error('Nome de usuário já está em uso.');
      }
      throw new Error(error.message || 'Erro ao criar conta');
    }

    if (!data?.session) {
      setError('Conta criada. Verifique seu email para confirmar o acesso.');
      return;
    }

    localStorage.setItem('userName', data.user?.user_metadata?.name || '');
    localStorage.setItem('referralCode', referralCode);
    window.location.href = 'products.html';
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
