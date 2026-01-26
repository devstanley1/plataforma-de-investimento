(function () {
  const SUPABASE_URL = window.SUPABASE_URL || 'https://hnbwamaqdmfdwaqtyxkc.supabase.co';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYndhbWFxZG1mZHdhcXR5eGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTYxMTIsImV4cCI6MjA4NDg5MjExMn0.cOKmgk3KtuvpP2UQWUiDOwp_AC9T__EAnFODTtn95zs';

  if (!window.supabase || !window.supabase.createClient) {
    console.error('SDK do Supabase não foi carregado.');
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true }
  });
})();
