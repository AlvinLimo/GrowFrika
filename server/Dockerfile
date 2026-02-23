# Use Node.js 22 as the base image
FROM node:22-bullseye

# Install Python and build essentials
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# Copy server ML requirements
COPY server/requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the server code
WORKDIR /app
COPY server ./server

# Build server
WORKDIR /app/server
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose the port
EXPOSE 10000

# Start the server
CMD ["npm", "start"]
