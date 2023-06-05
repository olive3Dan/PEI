# Use a base image with Node.js pre-installed
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json/yarn.lock to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install --production

# Copy the entire project directory to the working directory
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the website using the "npm run start" command
CMD ["npm", "run", "start"]