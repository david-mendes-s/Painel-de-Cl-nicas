# ─── Build stage ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copia o código fonte
COPY . .

# Define a variável que aponta para a API em produção.
# Vai ser sobrescrita pelo Coolify se necessário.
# Valor vazio = chamadas relativas (ex: /clinicas/...)
# que o nginx vai fazer proxy para o backend.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Build do Vite
RUN npm run build

# ─── Production stage (nginx) ────────────────────────────
FROM nginx:alpine AS runner

# Copia o build estático
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
