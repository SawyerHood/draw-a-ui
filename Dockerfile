FROM node:21

COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm","run","dev"]
EXPOSE 3000
