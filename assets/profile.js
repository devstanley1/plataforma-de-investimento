function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function loadProfileStats() {
  const balance = Number(localStorage.getItem('userBalance') || '0');
  const income = Number(localStorage.getItem('userIncome') || '0');

  const balanceEl = document.getElementById('user-balance');
  if (balanceEl) balanceEl.textContent = formatCurrency(balance);

  const incomeEl = document.getElementById('user-income');
  if (incomeEl) incomeEl.textContent = formatCurrency(income);
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfileStats();
});
