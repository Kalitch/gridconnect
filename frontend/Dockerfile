FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Add these 2 lines:
ENV NODE_ENV=development
ENV REACT_APP_API_URL=http://localhost:8000

# Start development server
CMD ["npm", "start"]