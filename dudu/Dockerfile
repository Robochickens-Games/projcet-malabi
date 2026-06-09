# Dudu — WhatsApp bridge to the brain
FROM node:22-slim

# git + gh CLI: Dudu commits/pushes and opens PRs from inside the repo clone
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates curl gnupg \
  && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
       | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
       > /etc/apt/sources.list.d/github-cli.list \
  && apt-get update && apt-get install -y --no-install-recommends gh \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

# WhatsApp auth state persists here — mount a volume so the QR is scanned once
VOLUME ["/app/auth"]

CMD ["node", "dist/index.js"]
