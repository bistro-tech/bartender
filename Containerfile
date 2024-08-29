FROM docker.io/oven/bun:alpine as BUILDER

WORKDIR /builder

COPY . .

RUN bun install --frozen-lockfile
RUN bun run build

#############################################
FROM docker.io/oven/bun:alpine

USER nobody

WORKDIR /app

COPY --from=BUILDER /builder/out/index.js .
COPY ./migrations migrations

CMD ["bun", "index.js"]
