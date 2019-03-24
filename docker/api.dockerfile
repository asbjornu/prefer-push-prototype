FROM node:11.12.0

WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 8081

ENTRYPOINT ["node", "index.js"]
