FROM nginx:1.15.9 as cert

RUN apt-get update && \
    apt-get -y install wget && \
    wget https://raw.githubusercontent.com/anders94/https-authorized-clients/master/keys/ca.cnf && \
    openssl req -new -x509 -days 9999 -config ca.cnf -keyout ca-key.pem -out ca-crt.pem && \
    openssl genrsa -out server-key.pem 4096 && \
    wget https://raw.githubusercontent.com/anders94/https-authorized-clients/master/keys/server.cnf && \
    openssl req -new -config server.cnf -key server-key.pem -out server-csr.pem && \
    openssl x509 -req -extfile server.cnf -days 999 -passin "pass:password" -in server-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out server-crt.pem

FROM node:11.12.0 as app

WORKDIR /app
COPY --from=cert *.pem /app/certs/
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 8081

ENTRYPOINT ["node", "api.js"]
