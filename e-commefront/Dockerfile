FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable \
    && corepack prepare pnpm@11.18.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=e-commerce-pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm config set fetch-retries 8 \
    && pnpm config set fetch-timeout 600000 \
    && pnpm install --frozen-lockfile

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000

CMD ["pnpm", "dev", "--hostname", "0.0.0.0"]
