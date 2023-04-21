FROM node:14

# Create app directory
WORKDIR /usr/src/api

COPY . .
RUN npm install

EXPOSE 3000
CMD [ "node", "server.js" ]