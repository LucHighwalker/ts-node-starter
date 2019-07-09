FROM node:11
ARG ENVIRONMENT

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . /usr/src/app

RUN npm install -g ts-node typescript nodemon

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait

RUN chmod +x /wait
RUN chmod +x ./node.sh

EXPOSE 4200

CMD /wait && ./node.sh