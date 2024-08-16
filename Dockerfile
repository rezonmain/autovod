FROM node:20.10.0-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
EXPOSE 1119
EXPOSE 443
CMD ["npm", "run", "start"]
