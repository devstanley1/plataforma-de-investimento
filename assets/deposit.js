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

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('deposit-form');
  const amountInput = document.getElementById('deposit-amount');
  const cpfInput = document.getElementById('deposit-cpf');
  const errorEl = document.getElementById('deposit-error');
  const pixBox = document.getElementById('pix-box');
  const pixCode = document.getElementById('pix-code');
  const pixAmount = document.getElementById('pix-amount');
  const copyBtn = document.getElementById('pix-copy');

  if (!form || !amountInput || !errorEl) return;

  const setError = (message) => {
    errorEl.textContent = message || '';
    errorEl.style.display = message ? 'block' : 'none';
  };

  if (copyBtn && pixCode) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pixCode.textContent || '');
        copyBtn.textContent = 'Copiado!';
        setTimeout(() => {
          copyBtn.textContent = 'Copiar código PIX';
        }, 2000);
      } catch {
        copyBtn.textContent = 'Falha ao copiar';
      }
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setError('');

    const amount = Number(amountInput.value || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Informe um valor válido.');
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
      client: {
        name: userMeta.name || 'Investidor Netflix',
        phone: userMeta.phone || '+55 00 00000-0000',
        email: userEmail || null,
        cpf: cpfInput?.value?.trim() || null
      },
      metadata: { source: 'site' }
    };

    try {
      const response = await fetch('/api/vizzion/pix/receive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Erro ao gerar PIX.');
      }

      const qrCode = data?.pix?.qrCode || data?.pixInformation?.qrCode || data?.pix?.qr_code || '';

      if (!qrCode) {
        throw new Error('PIX gerado sem QR Code.');
      }

      if (pixAmount) {
        pixAmount.textContent = formatCurrency(amount);
      }
      if (pixCode) {
        pixCode.textContent = qrCode;
      }
      if (pixBox) {
        pixBox.classList.remove('hidden');
      }
    } catch (error) {
      setError(error.message || 'Erro ao gerar PIX.');
    }
  });
});
