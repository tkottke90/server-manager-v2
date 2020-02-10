FROM node:12

WORKDIR /home/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run bundle

CMD [ "npm", "start"]

EXPOSE 3002