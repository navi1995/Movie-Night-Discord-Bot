FROM node:12.18-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "config.json", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
RUN npm install pm2 -g
COPY . .
EXPOSE 80
EXPOSE 443
CMD ["pm2-runtime", "index.js"]
