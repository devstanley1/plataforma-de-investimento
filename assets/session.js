const API_BASE = 'http://localhost:3001';

async function loadSession() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error('Sessão inválida');
    }

    const data = await res.json();
    const name = data.user?.name || localStorage.getItem('userName') || 'Usuário';
    const el = document.getElementById('user-name');
    if (el) {
      el.textContent = name;
    }
  } catch (e) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }
}

function setupLogout() {
  const logout = document.getElementById('logout-link');
  if (!logout) return;
  logout.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadSession();
  setupLogout();
});
