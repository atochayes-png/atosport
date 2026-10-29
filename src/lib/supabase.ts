import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Verifica si las credenciales de Supabase están correctamente configuradas
 * y corresponden a una URL válida de Supabase.
 */
export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) return false;
  try {
    const url = new URL(supabaseUrl);
    return Boolean(url.protocol && url.host);
  } catch {
    return false;
  }
}

let client: SupabaseClient;

if (isSupabaseConfigured()) {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 15,
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  // Cliente resiliente para desarrollo o despliegues sin credenciales inmediatas
  // Emite eventos localmente para evitar fallos de ejecución
  const dummyChannel = {
    on: () => dummyChannel,
    subscribe: (callback?: (status: string) => void) => {
      if (callback) callback('SUBSCRIBED');
      return dummyChannel;
    },
    unsubscribe: () => Promise.resolve('ok'),
    send: () => Promise.resolve('ok'),
  };

  client = {
    channel: () => dummyChannel,
    removeChannel: () => Promise.resolve('ok'),
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
    }),
  } as unknown as SupabaseClient;
}

export const supabase = client;
export default supabase;
