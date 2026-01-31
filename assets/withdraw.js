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

  // Variável para armazenar taxa (percentual 0-100)
  let withdrawTaxPercent = 7.0; // Padrão backup

  // Função para buscar configurações do sistema
  async function fetchSystemConfig() {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'withdraw_tax_percent')
        .single();

      if (!error && data) {
        withdrawTaxPercent = parseFloat(data.value);
        updateSummary(); // Atualiza UI com nova taxa
      }
    } catch (err) {
      console.warn('Usando taxa padrão:', err);
    }
  }

  const updateSummary = () => {
    const rawValue = Number(amountInput?.value || 0);
    const amount = Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 0;

    // Calcular taxa baseada no config (ex: 5.0 vira 0.05)
    const fee = amount * (withdrawTaxPercent / 100);
    const net = amount - fee;

    if (amountEl) amountEl.textContent = formatCurrency(amount);
    if (feeEl) feeEl.innerHTML = `${formatCurrency(fee)} <small class="text-gray-400">(${withdrawTaxPercent}%)</small>`;
    if (netEl) netEl.textContent = formatCurrency(net);
  };

  // Iniciar busca de config
  fetchSystemConfig();

  cpfInput.addEventListener('blur', () => {
    if (!cpfInput.value) return;
    setError(isValidCpf(cpfInput.value) ? '' : 'CPF inválido. Verifique e tente novamente.');
  });

  amountInput?.addEventListener('input', updateSummary);
  // updateSummary(); -> Removido pois o fetchSystemConfig já chama


  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const amount = Number(amountInput?.value || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Informe um valor válido.');
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
      metadata: { source: 'site' },
      password: passwordInput?.value
    };

    try {
      const supabase = await getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const response = await fetch('/api/vizzion/pix/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
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
