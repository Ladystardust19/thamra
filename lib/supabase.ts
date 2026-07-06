import { createClient } from "@supabase/supabase-js";

const url = "https://zxwkjlcklbypaawlfdno.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4d2tqbGNrbGJ5cGFhd2xmZG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNjcwNzYsImV4cCI6MjA5ODY0MzA3Nn0.SLB_iyWN-IS5hRr-M3a76gmYG9gNYSJ4lvHsV4f8lA8";

export const supabase = createClient(url, key);
