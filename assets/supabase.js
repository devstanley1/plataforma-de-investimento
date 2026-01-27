(function () {
  async function initSupabase() {
    let SUPABASE_URL = window.SUPABASE_URL;
    let SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          SUPABASE_URL = data.SUPABASE_URL;
          SUPABASE_ANON_KEY = data.SUPABASE_ANON_KEY;
        }
      } catch (err) {
        console.error('Falha ao carregar configuração do Supabase.', err);
      }
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Supabase não configurado.');
      return null;
    }

    if (!window.supabase || !window.supabase.createClient) {
      console.error('SDK do Supabase não foi carregado.');
      return null;
    }

    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true }
    });

    return window.supabaseClient;
  }

  window.supabaseReady = initSupabase();
})();
