function setupGroupModal() {
  const modal = document.getElementById('group-modal');
  if (!modal) return;

  const openButtons = document.querySelectorAll('.group-button');
  const closeButtons = modal.querySelectorAll('[data-close-modal]');
  const backdrop = modal.querySelector('.modal-backdrop');

  const openModal = () => {
    modal.classList.remove('hidden');
  };

  const closeModal = () => {
    modal.classList.add('hidden');
  };

  openButtons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      openModal();
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      closeModal();
    });
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }
}

document.addEventListener('DOMContentLoaded', setupGroupModal);
