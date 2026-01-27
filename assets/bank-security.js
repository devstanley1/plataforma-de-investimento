function showSection(id) {
  const sections = ['bank-form', 'login-password', 'withdraw-password'];
  sections.forEach((sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    if (sectionId === id) {
      el.classList.remove('hidden');
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      el.classList.add('hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('[data-toggle]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const target = btn.getAttribute('data-toggle');
      if (target) {
        showSection(target);
      }
    });
  });
});
