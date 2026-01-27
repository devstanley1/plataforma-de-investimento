async function getSupabaseClient() {
  if (window.supabaseReady) {
    await window.supabaseReady;
  }
  if (window.supabaseClient) return window.supabaseClient;
  throw new Error('Supabase não configurado.');
}

function generateReferralCode() {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CONV-${part}`;
}

function buildReferralLink(code) {
  const base = window.location.origin;
  return `${base}/pages/register.html?ref=${encodeURIComponent(code)}`;
}

async function ensureReferralCode(supabase, user) {
  const existing = user.user_metadata?.referral_code;
  if (existing) return existing;

  const newCode = generateReferralCode();
  await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      referral_code: newCode
    }
  });
  return newCode;
}

async function loadReferralData() {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    window.location.href = 'login.html';
    return;
  }

  const code = await ensureReferralCode(supabase, data.user);
  const link = buildReferralLink(code);

  const codeEl = document.getElementById('referral-code');
  if (codeEl) codeEl.textContent = code;

  const linkEl = document.getElementById('referral-link');
  if (linkEl) linkEl.textContent = link;
}

async function copyText(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (err) {
      // fallback to clipboard
    }
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const temp = document.createElement('textarea');
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
}

function setupShareButtons() {
  const shareCode = document.getElementById('share-code');
  const shareLink = document.getElementById('share-link');

  if (shareCode) {
    shareCode.addEventListener('click', async () => {
      const code = document.getElementById('referral-code')?.textContent || '';
      if (!code) return;
      await copyText(code);
    });
  }

  if (shareLink) {
    shareLink.addEventListener('click', async () => {
      const link = document.getElementById('referral-link')?.textContent || '';
      if (!link) return;
      await copyText(link);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadReferralData();
  setupShareButtons();
});
