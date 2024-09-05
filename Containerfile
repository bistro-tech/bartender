FROM docker.io/oven/bun:1.1.26-alpine as BUILDER

WORKDIR /builder

COPY . .

RUN bun install --frozen-lockfile
RUN bun run build

#############################################
FROM docker.io/oven/bun:1.1.26-alpine

USER nobody

WORKDIR /app

COPY --from=BUILDER /builder/out/index.js .
COPY ./migrations migrations

CMD ["bun", "index.js"]
