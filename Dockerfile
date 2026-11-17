# Image de production de l'API Myra Skin Care
# Node 24 LTS, version épinglée (Node 20 n'est plus maintenu depuis avril 2026)
FROM node:24.15.0-alpine

WORKDIR /app
ENV NODE_ENV=production

# Dépendances d'abord (couche mise en cache tant que package*.json ne change pas)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Dossiers écrits à l'exécution (photos, logs) : appartiennent à l'utilisateur non root
RUN mkdir -p src/uploads logs && chown -R node:node src/uploads logs
USER node

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/health >/dev/null || exit 1

CMD ["node", "server.js"]
