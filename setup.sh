#!/bin/bash

# Create project directory structure
mkdir -p cryptoad/{backend,frontend,scripts,config}
cd cryptoad

# Create virtual environment and activate it
python -m venv venv
source venv/bin/activate  # On Windows use: .\venv\Scripts\activate

# Create backend structure
cd backend
mkdir -p src/{models,routes,services,utils}
touch src/__init__.py
touch src/models/__init__.py
touch src/routes/__init__.py
touch src/services/__init__.py
touch src/utils/__init__.py

# Create requirement.txt
cat > requirements.txt << EOL
fastapi==0.104.1
uvicorn==0.24.0
python-dotenv==1.0.0
web3==6.11.1
ccxt==4.1.13
pandas==2.1.3
numpy==1.26.2
pymongo==4.6.0
aiohttp==3.9.1
pytest==7.4.3
python-jose==3.3.0
passlib==1.7.4
python-multipart==0.0.6
EOL

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOL
MONGODB_URI=mongodb://localhost:27017/cryptoad
WEB3_PROVIDER=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
COINGECKO_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
EOL

# Create main.py
cat > src/main.py << EOL
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="cryptoad API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "cryptoad API is running"}
EOL

# Set up frontend (React)
cd ../frontend
npx create-react-app . --template typescript

# Install frontend dependencies
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
npm install axios react-query @tanstack/react-query
npm install web3 ethers
npm install react-router-dom @types/react-router-dom
npm install recharts @types/recharts

# Create docker-compose file
cd ..
cat > docker-compose.yml << EOL
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
    env_file:
      - .env

volumes:
  mongodb_data:
EOL

echo "Project setup complete!"