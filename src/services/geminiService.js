import { fetchContextFromSupabase, getSupabaseConfig } from './supabaseClient';

const STORAGE_KEY = 'educatia_gemini_api_key';
const MODEL_KEY = 'educatia_selected_model';

export const getStoredApiKey = () => {
  return localStorage.getItem(STORAGE_KEY) || '';
};

export const setStoredApiKey = (key) => {
  localStorage.setItem(STORAGE_KEY, key.trim());
};

export const getStoredModel = () => {
  localStorage.setItem(MODEL_KEY, 'gemini-flash-latest');
  return 'gemini-flash-latest';
};

export const setStoredModel = (model) => {
  localStorage.setItem(MODEL_KEY, 'gemini-flash-latest');
};

export async function sendWidgetMessage({ messages, sessionId }) {
  // 1. Try Supabase Edge Function (/functions/v1/chat)
  try {
    const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();
    if (!supabaseUrl || !supabaseKey) throw new Error('Supabase config missing');

    const edgeRes = await fetch(`${supabaseUrl}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ messages, sessionId })
    });

    if (edgeRes.ok) {
      const resText = await edgeRes.text();
      let data = null;
      try { data = resText ? JSON.parse(resText) : {}; } catch (_e) {}
      if (data && (data.reply || data.text)) {
        return data.reply || data.text;
      }
    }
  } catch (_edgeErr) {
    // Edge function not deployed or unreachable, fall back silently
  }

  // 2. Try Local / Serverless API Endpoint (/api/chat)
  try {
    const apiRes = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, sessionId })
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data && (data.reply || data.text)) {
        return data.reply || data.text;
      }
    }
  } catch (_apiErr) {
    // Serverless endpoint unavailable, fall back to direct Supabase RAG
  }

  // 3. Try Direct Supabase RAG Search
  try {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    if (lastUserMsg) {
      const { text: dbContext } = await fetchContextFromSupabase(lastUserMsg, messages);
      if (dbContext && dbContext.trim()) {
        return `Here is the relevant university and admission information from our database:\n\n${dbContext}`;
      }
    }
  } catch (_ragErr) {
    // Direct RAG failed
  }

  return "Hello! Welcome to Educatia Support. How can I assist with your study-abroad plans today?";
}
