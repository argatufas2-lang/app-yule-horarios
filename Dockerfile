# Etapa 1: Build de la aplicación
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Argumentos y variables de entorno para la compilación
ARG PUBLIC_SUPABASE_URL=""
ARG PUBLIC_SUPABASE_ANON_KEY=""

ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY

# Compilar la aplicación SvelteKit
RUN node node_modules/vite/bin/vite.js build

# Eliminar dependencias de desarrollo para dejar solo las necesarias de producción
RUN npm prune --production

# Etapa 2: Entorno de ejecución (Producción)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copiar dependencias de producción y el resultado del build desde la etapa anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Ejecutar la aplicación SvelteKit con Node
CMD ["node", "build"]
