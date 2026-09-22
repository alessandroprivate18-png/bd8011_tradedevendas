import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Em ambiente de build/SSR sem as variáveis, o cliente não é inicializado.
// Os hooks só rodam no client (useEffect), então isso não causa problema em runtime.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[supabase] Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não definidas."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "http://localhost",
  supabaseAnonKey ?? "placeholder"
);
