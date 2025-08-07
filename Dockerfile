FROM node:lts-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY prisma ./prisma/

COPY . .

COPY docker-entrypoint.sh .

RUN chmod +x docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["npm", "run", "dev"]