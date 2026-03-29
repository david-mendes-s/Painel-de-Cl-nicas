# ─── Build stage ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copia todo o código fonte
COPY prisma ./prisma/
COPY src ./src/
COPY tsconfig.json ./

# Gera o Prisma Client + compila TypeScript
RUN npx prisma generate
RUN npm run build

# ─── Production stage ─────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia Prisma schema + client gerado
COPY prisma ./prisma/
COPY --from=builder /app/generated ./generated/

# Copia o build compilado
COPY --from=builder /app/dist ./dist/

# Expõe a porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
