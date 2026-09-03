FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install dependencies first (separate layer so `docker build` can cache
# this step and skip reinstalling when only source files change)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the source
COPY . .

# Folder for uploaded documents -- gets replaced by a mounted volume in
# docker-compose, but this ensures it exists even if run standalone
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "src/server.js"]