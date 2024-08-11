FROM docker.io/oven/bun:alpine as BUILDER

WORKDIR /builder

COPY . .

RUN bun install
RUN bun run build

#############################################
FROM docker.io/oven/bun:alpine

USER nobody

WORKDIR /app

COPY --from=BUILDER /builder/out/index.js .

CMD ["bun", "index.js"]
