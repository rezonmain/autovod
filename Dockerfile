ARG node_version

FROM node:${node_version}-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN ["npm", "run", "migrate"]
CMD ["npm", "run", "start"]
