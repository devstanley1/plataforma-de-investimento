function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

document.addEventListener('DOMContentLoaded', () => {
  const balance = Number(localStorage.getItem('userBalance') || '0');
  const balanceEl = document.getElementById('available-balance');
  if (balanceEl) {
    balanceEl.textContent = formatCurrency(balance);
  }
});
