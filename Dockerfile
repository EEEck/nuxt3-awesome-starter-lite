# Dev image for Nuxt 3 + Vite HMR
FROM node:20-alpine

WORKDIR /app

# Optional build deps (speed up native installs if any)
RUN apk add --no-cache git python3 make g++ libc6-compat

# Use pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Cache deps at build (will still mount code at runtime)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm config set store-dir /pnpm/store
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install

# Nuxt dev ports
EXPOSE 3000 24678

ENV NUXT_HOST=0.0.0.0 \
    NUXT_PORT=3000 \
    NODE_ENV=development \
    CHOKIDAR_USEPOLLING=1 \
    WATCHPACK_POLLING=true \
    NUXT_TELEMETRY_DISABLED=1

# In compose we override with: pnpm install && pnpm dev --host 0.0.0.0
CMD ["pnpm","dev","--host","0.0.0.0"]

