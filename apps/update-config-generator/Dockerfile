# Build with context ../..

FROM node:22-alpine AS pruner
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm dlx turbo prune --scope=@slimevr/update-config-generator --out-dir=out --docker

FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/turbo.json .
RUN pnpm turbo run build --filter=@slimevr/update-config-generator

FROM ghcr.io/thedevminertv/gostatic:1.3.10
CMD [ "-spa", "-compress-level=1" ]
COPY --from=builder /app/apps/update-config-generator/dist /static
