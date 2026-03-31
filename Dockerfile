# Stage 1: dependencies + build
FROM node:22-bullseye AS builder
WORKDIR /app

# Copiar somente manifestos e lockfiles primeiro para aproveitar layer cache
COPY package.json package-lock.json .

# Instala dependências usando npm (lockfile v2 já no repo)
RUN npm ci

# Copiar código fonte
COPY . .

# Build do projeto (client + server bundle via script/build.ts)
RUN npm run build

# Stage 2: runtime leve
FROM node:22-bullseye AS runtime
WORKDIR /app

# Só copiar artefatos de produção
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Porta padrão (ajustar conforme app)
EXPOSE 3000

# Rodar servidor express empaquetado
CMD ["node", "dist/index.cjs"]
