# Image de l'API, déployée sur ECS Express Mode par le workflow GitHub « API ».
# Le dossier certs/ y entre avec le reste : il porte l'autorité de RDS.

FROM node:24-slim AS construction
WORKDIR /app
# Prisma a besoin d'OpenSSL pour son moteur de migration.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
RUN npx prisma generate && npx nest build

FROM node:24-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
# Prisma et tsx servent au démarrage (migrations, comptes de démonstration).
COPY --from=construction /app /app
EXPOSE 4001
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/main.js"]
