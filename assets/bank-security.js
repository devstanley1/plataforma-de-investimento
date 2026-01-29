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

  // Integração para salvar dados bancários
  const bankForm = document.getElementById('bank-form');
  if (bankForm) {
    const saveBtn = bankForm.querySelector('button');
    const inputs = bankForm.querySelectorAll('input,select');
    const statusEl = document.createElement('p');
    statusEl.style.marginTop = '8px';
    statusEl.style.fontSize = '0.95em';
    bankForm.appendChild(statusEl);
    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      statusEl.textContent = '';
      const [nome, cpfCnpj, banco, agencia, conta, tipoConta, pixKey] = Array.from(inputs).map(i => i.value);
      try {
        const supabase = await getSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        const response = await fetch('/api/bank', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify({ nome, cpfCnpj, banco, agencia, conta, tipoConta, pixKey })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || 'Erro ao salvar dados bancários.');
        statusEl.style.color = 'green';
        statusEl.textContent = 'Dados bancários salvos com sucesso!';
      } catch (err) {
        statusEl.style.color = 'red';
        statusEl.textContent = err.message || 'Erro ao salvar dados bancários.';
      }
    });
  }
});
