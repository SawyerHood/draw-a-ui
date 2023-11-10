# Step 1: Use a Node.js base image
FROM node:latest

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy the application code to the container
COPY . .

# Step 4: Create .env.local file with the OpenAI API key
RUN echo "OPENAI_API_KEY=${OPENAI_API_KEY}" > .env.local 

# Step 5: Install dependencies
RUN npm install

# Step 6: Expose the port the app runs on
EXPOSE 3000

# Step 7: Define the command to run the app in development mode
CMD ["npm", "run", "dev"]
