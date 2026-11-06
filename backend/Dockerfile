FROM node:20-bookworm-slim
WORKDIR /app 
COPY package*.json ./ 
RUN npm install 
COPY . . 
EXPOSE 5001:5000 
CMD ["npm","run", "dev","start"] 