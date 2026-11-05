# Linkedu.es

React + Vite + Tailwind CSS 4 + Supabase.

## Puesta en marcha
1. Crea un proyecto en https://supabase.com y ejecuta `supabase/schema.sql` en el SQL Editor.
2. Copia `.env.example` a `.env.local` y rellena la URL y la clave anónima (Project Settings > API).
3. En Supabase, Authentication > Providers > Email: desactiva "Confirm email" mientras pruebas.
4. `npm install` y `npm run dev`.
5. Despliegue: sube el repo a GitHub, impórtalo en Vercel y añade las dos variables de entorno.
