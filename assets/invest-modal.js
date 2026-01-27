function parseCurrency(text) {
  if (!text) return 0;
  const cleaned = text.replace(/[R$\s.]/g, '').replace(',', '.');
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function getCardAmount(card) {
  const licenseText = card.querySelector('p')?.textContent || '';
  if (!licenseText) return 0;
  const match = licenseText.match(/R\$\s?[0-9.,]+/);
  return match ? parseCurrency(match[0]) : 0;
}

function getBalance() {
  return Number(localStorage.getItem('userBalance') || '0');
}

function setBalance(value) {
  localStorage.setItem('userBalance', String(value));
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.createElement('div');
  modal.id = 'invest-modal';
  modal.className = 'modal hidden';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-card">
      <h2 class="modal-title" id="invest-title">Confirmar investimento</h2>
      <p class="modal-text" id="invest-message"></p>
      <div class="modal-actions">
        <button class="modal-primary" type="button" id="invest-confirm">Confirmar</button>
        <button class="modal-secondary" type="button" id="invest-close">Fechar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = modal.querySelector('.modal-backdrop');
  const closeBtn = modal.querySelector('#invest-close');
  const confirmBtn = modal.querySelector('#invest-confirm');
  const messageEl = modal.querySelector('#invest-message');

  const openModal = () => modal.classList.remove('hidden');
  const closeModal = () => modal.classList.add('hidden');

  backdrop?.addEventListener('click', closeModal);
  closeBtn?.addEventListener('click', closeModal);

  document.querySelectorAll('.invest-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const card = button.closest('.bg-white');
      const title = card?.querySelector('h3')?.textContent || 'Investimento';
      const amount = card ? getCardAmount(card) : 0;
      const balance = getBalance();

      if (balance <= 0 || balance < amount) {
        messageEl.textContent = `Saldo insuficiente para investir em ${title}. Saldo atual: ${formatCurrency(balance)}.`;
        confirmBtn.disabled = true;
        confirmBtn.classList.add('hidden');
      } else {
        messageEl.textContent = `Deseja investir em ${title} no valor de ${formatCurrency(amount)}? Seu saldo atual é ${formatCurrency(balance)}.`;
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('hidden');
      }

      confirmBtn.onclick = () => {
        const currentBalance = getBalance();
        if (currentBalance < amount) {
          messageEl.textContent = 'Saldo insuficiente para concluir o investimento.';
          confirmBtn.disabled = true;
          return;
        }
        setBalance(currentBalance - amount);
        messageEl.textContent = 'Investimento confirmado! Seu saldo foi atualizado.';
        confirmBtn.disabled = true;
        setTimeout(closeModal, 1200);
      };

      openModal();
    });
  });
});
