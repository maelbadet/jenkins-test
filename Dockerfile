# Étape 1 : build
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Étape 2 : image finale
FROM node:18-slim
WORKDIR /app
COPY --from=build /app /app
CMD ["npm", "test"]
