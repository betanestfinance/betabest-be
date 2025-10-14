# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Install PM2 globally
RUN npm install -g pm2

# Expose app port (make sure it matches your app)
EXPOSE 3000

# Start app using PM2
CMD ["pm2-runtime", "ecosystem.config.cjs"]
