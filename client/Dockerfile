# Was:
# FROM node:12
# Now:
FROM node:14

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
RUN npm install
COPY . .

EXPOSE 3000

RUN npm run build
RUN npm install -g serve

CMD ["serve", "-s", "build"]
