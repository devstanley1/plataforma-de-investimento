async function getSupabaseClient() {
  if (window.supabaseReady) {
    await window.supabaseReady;
  }
  if (window.supabaseClient) return window.supabaseClient;
  throw new Error('Supabase não configurado.');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function normalizeCpf(value) {
  return String(value || '').replace(/\D/g, '');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('withdraw-form');
  const cpfInput = document.getElementById('cpf');
  const amountInput = document.getElementById('withdraw-amount-input');
  const passwordInput = document.getElementById('withdraw-password');
  const errorEl = document.getElementById('withdraw-error');
  const successEl = document.getElementById('withdraw-success');
  const amountEl = document.getElementById('withdraw-amount-display');
  const feeEl = document.getElementById('withdraw-fee');
  const netEl = document.getElementById('withdraw-net');

  if (!form || !cpfInput || !errorEl) return;

  const setError = (message) => {
    errorEl.textContent = message || '';
    errorEl.style.display = message ? 'block' : 'none';
  };

  const setSuccess = (message) => {
    if (!successEl) return;
    successEl.textContent = message || '';
    successEl.style.display = message ? 'block' : 'none';
  };

  const updateSummary = () => {
    const rawValue = Number(amountInput?.value || 0);
    const amount = Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 0;
    const fee = amount * 0.07;
    const net = amount - fee;
    if (amountEl) amountEl.textContent = formatCurrency(amount);
    if (feeEl) feeEl.textContent = formatCurrency(fee);
    if (netEl) netEl.textContent = formatCurrency(net);
  };

  cpfInput.addEventListener('blur', () => {
    if (!cpfInput.value) return;
    setError(isValidCpf(cpfInput.value) ? '' : 'CPF inválido. Verifique e tente novamente.');
  });

  amountInput?.addEventListener('input', updateSummary);
  updateSummary();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const amount = Number(amountInput?.value || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Informe um valor válido.' );
      return;
    }

    const cpfDigits = normalizeCpf(cpfInput?.value || '');
    if (!isValidCpf(cpfDigits)) {
      setError('CPF inválido. Verifique e tente novamente.');
      cpfInput.focus();
      return;
    }

    if (!passwordInput?.value) {
      setError('Informe a senha de retirada.');
      passwordInput?.focus();
      return;
    }

    let userMeta = {};
    let userEmail = null;
    try {
      const supabase = await getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      userMeta = data?.user?.user_metadata || {};
      userEmail = data?.user?.email || null;
    } catch {
      userMeta = {};
    }

    const payload = {
      amount,
      document: cpfDigits,
      pixKey: cpfDigits,
      pixKeyType: 'CPF',
      client: {
        name: userMeta.name || 'Investidor Netflix',
        phone: userMeta.phone || '+55 00 00000-0000',
        email: userEmail || null,
        cpf: cpfDigits
      },
      metadata: { source: 'site' }
    };

    try {
      const response = await fetch('/api/vizzion/pix/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Erro ao solicitar retirada.');
      }

      setSuccess('Retirada enviada com sucesso. Aguarde o processamento.');
      form.reset();
      updateSummary();
    } catch (error) {
      setError(error.message || 'Erro ao solicitar retirada.');
    }
  });
});
