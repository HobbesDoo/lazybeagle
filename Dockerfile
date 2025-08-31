# build stage
FROM --platform=$BUILDPLATFORM node:22-alpine3.21 AS build-stage

WORKDIR /app

# Install deps using npm since package-lock.json exists in repo
COPY package.json package-lock.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# production stage
FROM alpine:3.21

ARG VERSION_TAG=latest

LABEL \
    org.label-schema.schema-version="1.0" \
    org.label-schema.version="$VERSION_TAG" \
    org.opencontainers.image.title="LazyBeagle Image" \
    org.opencontainers.image.description="My Home Network Dashboard." \
    org.opencontainers.image.ref.name="hobbesdoo/lazybeagle:${VERSION_TAG}" \
    org.opencontainers.image.version="$VERSION_TAG" \
    org.opencontainers.image.licenses="Apache-2.0 license" \
    org.opencontainers.image.source="https://github.com/hobbesdoo/lazybeagle" \
    org.opencontainers.image.url="https://hub.docker.com/r/b4bz/homer"

ENV GID=1000 \
    UID=1000 \
    PORT=6524 \
    IPV6_DISABLE=0

RUN addgroup -S lighttpd -g ${GID} && adduser -D -S -u ${UID} lighttpd lighttpd && \
    apk add -U --no-cache tzdata lighttpd

WORKDIR /www

COPY lighttpd.conf /lighttpd.conf
COPY entrypoint.sh /entrypoint.sh
COPY --from=build-stage --chown=${UID}:${GID} /app/dist /www/
COPY --from=build-stage --chown=${UID}:${GID} /app/dist/assets /www/default-assets

USER ${UID}:${GID}

HEALTHCHECK --start-period=10s --start-interval=1s --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose -Y off --tries=1 --spider http://127.0.0.1:${PORT}/ || exit 1

EXPOSE ${PORT}

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
