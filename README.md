# Reading Program Tracker

Aplicacion web responsive para planificacion, seguimiento, reflexion, evaluacion y analitica de lectura. Incluye seed automatico del plan anual corregido desde `2026-03-26`, modo flexible para desvios y CRUD completo para:

- programas
- fases
- libros
- sesiones
- evaluaciones
- reflexiones

## Stack

- Next.js 16 + TypeScript
- Supabase Postgres
- Tailwind CSS 4
- Recharts (dashboard analitico)
- UI bilingue ES/EN con selector

## 1) Configurar Supabase

1. Crear proyecto en Supabase.
2. En `SQL Editor`, ejecutar el archivo `supabase/schema.sql`.
3. Copiar `.env.example` a `.env.local` y completar:

```bash
cp .env.example .env.local
```

Variables requeridas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` (recomendado para seed server-side)

## 2) Ejecutar local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

Al cargar la app, `GET /api/data` ejecuta `ensureSeeded()` y precarga automaticamente el plan anual si no existe.

## 3) Deploy en Vercel

1. Crear proyecto en Vercel apuntando a este repo.
2. Configurar las mismas variables de entorno del `.env.local`.
3. Deploy.

Tambien podes usar CLI:

```bash
npx vercel login
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npx vercel env add SUPABASE_SECRET_KEY
npm run vercel:deploy
```

## 4) Crear repo y push (si todavia no existe)

```bash
git init
git add .
git commit -m "build reading program tracker mvp"
gh repo create reading-program-tracker --public --source=. --push
```

## Notas funcionales

- Modo flexible: permite solapes y fechas fuera del rango del programa, mostrando alertas en dashboard.
- Campos faltantes de libros (`style`, `intensity`, `difficulty`) se guardan en `null` y pueden completarse luego.
- v1 single-user sin login.
