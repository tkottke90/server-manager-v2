FROM node:13 as build_stage

WORKDIR /usr/build/

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:13

WORKDIR /usr/app

COPY --from=build_stage /usr/build/package.json ./
COPY --from=build_stage /usr/build/dist/ ./dist

RUN npm install --production

CMD [ "npm", "start" ]

EXPOSE 3001