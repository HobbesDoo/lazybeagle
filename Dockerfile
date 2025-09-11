# ------------ build stage ------------
FROM --platform=$BUILDPLATFORM node:22-alpine3.21 AS build-stage
ARG COMMIT
WORKDIR /app

# helpful for debugging if anything goes sideways
SHELL ["/bin/sh","-eux","-o","pipefail","-c"]

# deps
COPY package.json package-lock.json ./
RUN npm ci

# sources + build
COPY . .
RUN npm run build

# write COMMIT and prove it exists in dist
RUN : "ensure dist exists" \
 && test -d /app/dist \
 && printf '%s\n' "${COMMIT:-unknown}" > /app/dist/VERSION.txt \
 && ls -l /app/dist/VERSION.txt \
 && head -n1 /app/dist/VERSION.txt

# ------------ production stage ------------
FROM alpine:3.21
ARG COMMIT
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

ENV GID=1000 UID=1000 PORT=6524 IPV6_DISABLE=0

RUN addgroup -S lighttpd -g ${GID} \
 && adduser -D -S -u ${UID} lighttpd lighttpd \
 && apk add -U --no-cache tzdata lighttpd

WORKDIR /www

COPY lighttpd.conf /lighttpd.conf
COPY entrypoint.sh /entrypoint.sh
COPY --from=build-stage --chown=${UID}:${GID} /app/dist /www/
COPY --from=build-stage --chown=${UID}:${GID} /app/dist/assets /www/default-assets

# write COMMIT in final image and PROVE both files exist
RUN printf '%s\n' "${COMMIT:-unknown}" > /www/IMAGE_COMMIT.txt \
 && ls -l /www/VERSION.txt /www/IMAGE_COMMIT.txt \
 && head -n1 /www/VERSION.txt /www/IMAGE_COMMIT.txt

USER ${UID}:${GID}

HEALTHCHECK --start-period=10s --start-interval=1s --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose -Y off --tries=1 --spider http://127.0.0.1:${PORT}/ || exit 1

EXPOSE ${PORT}
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]