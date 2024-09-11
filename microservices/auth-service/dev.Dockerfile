FROM node:21-alpine3.18

WORKDIR /app
COPY package.json ./
COPY src ./src
RUN ls -a
RUN npm install && npm install -g nodemon

EXPOSE 3000

CMD [ "npm", "run", "dev" ]