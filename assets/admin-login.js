// admin-login.js
// Login apenas para o usuário admin especificado

const SUPABASE_URL = window.SUPABASE_URL || localStorage.getItem('SUPABASE_URL');
const SUPABASE_KEY = window.SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY');

async function loginAdmin(email, password) {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  // Buscar perfil e validar is_admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', data.user.id)
    .single();
  if (profileError || !profile?.is_admin) {
    return { error: 'Acesso restrito a administradores.' };
  }
  // Salvar sessão/token
  localStorage.setItem('SUPABASE_URL', SUPABASE_URL);
  localStorage.setItem('SUPABASE_ANON_KEY', SUPABASE_KEY);
  localStorage.setItem('session', JSON.stringify(data.session || {}));
  return { ok: true };
}

document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  errorDiv.textContent = '';
  if (email !== 'devfullstanley@gmail.com') {
    errorDiv.textContent = 'E-mail não autorizado.';
    return;
  }
  const result = await loginAdmin(email, password);
  if (result.error) {
    errorDiv.textContent = result.error;
    return;
  }
  window.location.href = '/pages/admin-withdraws.html';
});
