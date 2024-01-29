FROM node:latest as build-stage
COPY . /www
WORKDIR /www/app
RUN npm install
RUN npm run build

FROM nginx:alpine3.18
COPY nginx.conf.j2 /etc/nginx/nginx.conf.j2
RUN rm -rf /usr/share/nginx/html/*
COPY public /usr/share/nginx/html
COPY --from=build-stage /www/app/dist /usr/share/nginx/html/dist
COPY start.sh start.sh
EXPOSE 8080
ENTRYPOINT ["./start.sh"]