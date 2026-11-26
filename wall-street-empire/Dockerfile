# Wall Street Empire : un seul service qui sert le jeu (city.html) ET le serveur de salle multijoueur (WebSocket /ws).
# Construction (depuis le dossier wall-street-empire/) : docker build -t wse-salle .   puis : docker run -p 8080:8080 wse-salle
# city.pub.html (version allégée, tools/build_pub.sh) est servie à la place de city.html si elle est présente. Aucun secret.
FROM node:22-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json server/
RUN npm ci --prefix server --omit=dev --no-audit --no-fund
COPY server/server.js server/
COPY city*.html ./
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
USER node
CMD ["node", "server/server.js"]
