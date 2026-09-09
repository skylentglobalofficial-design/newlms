FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# System toolchain plus a local PostgreSQL server for the LMS backend.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        curl \
        ca-certificates \
        sudo \
        procps \
        postgresql \
        postgresql-contrib \
    && rm -rf /var/lib/apt/lists/*

# The Cloud Agent runs as the image's default non-root `node` user; grant it
# passwordless sudo so the setup scripts can manage the PostgreSQL service.
RUN echo 'node ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node

USER node
