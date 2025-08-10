FROM node:20-alpine

WORKDIR /app

# Instalar deps
COPY package*.json ./
RUN npm ci

# Copiar código y build
COPY . .
RUN npm run build

# Exponer y arrancar
ENV PORT=3000
EXPOSE 3000
CMD ["npm","start","--","-p","3000"]