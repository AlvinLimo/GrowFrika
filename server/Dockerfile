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

# Copy package files (context is already the server folder)
COPY package*.json ./
RUN npm install

# Copy ML requirements
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy all server code (context is already the server folder)
COPY . .

# Build the server
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose the port
EXPOSE 10000

# Start the server
CMD ["npm", "start"]
