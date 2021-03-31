FROM node:lts-alpine

WORKDIR /root/word

RUN npm install -g @google/clasp
