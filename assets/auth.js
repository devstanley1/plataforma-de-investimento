const API_BASE = 'http://localhost:3001';

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
  const email = form.querySelector('[name="email"]').value.trim();
  const password = form.querySelector('[name="password"]').value;

  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao fazer login');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.user?.name || '');
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
  const email = form.querySelector('[name="email"]').value.trim();
  const phone = form.querySelector('[name="phone"]').value.trim();
  const password = form.querySelector('[name="password"]').value;
  const confirm = form.querySelector('[name="confirmPassword"]').value;

  if (password !== confirm) {
    setError('As senhas não coincidem.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Erro ao criar conta');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('userName', data.user?.name || '');
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
