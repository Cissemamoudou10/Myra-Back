FROM node:20-alpine

# Création du répertoire de l'application
WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install --omit=dev

# Copie du code source
COPY . .

# On s'assure que le dossier d'uploads existe pour les volumes
RUN mkdir -p src/uploads

# Le port sur lequel l'API tourne
EXPOSE 4000

# Commande de démarrage
CMD ["npm", "start"]
