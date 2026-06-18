# VagabondAI: Global Travel Itinerary Planner 🌍✈️

VagabondAI is an end-to-end, high-performance full-stack web application that crafts highly personalized, multi-day travel itineraries grounded in real-time global metadata. The entire architecture is deliberately engineered to run natively on production-ready, **100% free-tier cloud infrastructure**.

## 🚀 Key Features
* **Structured AI Outputs:** Integrates the **Gemini 2.5 Flash** engine with strict Pydantic JSON schema enforcement, completely bypassing fragile markdown-parsing alternatives.
* **Geopolitical Grounding:** Syncs localized country assets (currencies, official languages, spatial vectors) from the **REST Countries API** to enrich LLM prompts inside a massive 1-million+ token context window.
* **Relational Storage:** Automatically records generated itineraries into parent-child database relations using a cloud-native **Neon PostgreSQL** server.
* **Modern Interface:** Built with a highly responsive, slick web UI using **React (TypeScript)**, **Vite**, and **Tailwind CSS**.

## 🛠️ Architecture & Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **Backend:** Python 3.10+, FastAPI (Async worker engine), SQLAlchemy
* **Database:** Neon PostgreSQL (Serverless Cloud DB)
* **LLM Orchestration:** Google GenAI SDK (Gemini 2.5 Flash)


### 1. 📂 Clone and Prepare the Repository
Open your terminal window and run the following commands to pull down the project and verify your root directories:
```bash
git clone [https://github.com/MihirRueben/global-travel-planner.git](https://github.com/MihirRueben/global-travel-planner.git)

cd global-travel-planner

### 2. Setting Up the Backend
# Move into backend directory
cd backend

# Initialize a clean virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Mac/Linux:
source venv/bin/activate

# Install all locked backend software requirements
pip install -r requirements.txt

### 3. Setting up the ENV
NEON_DATABASE_URL="postgresql://[user]:[password]@[neon-cluster-id].neon.tech/neondb?sslmode=require"
GEMINI_API_KEY="your_actual_gemini_api_key_here"

### 4. Running the Backend
# Start the FastAPI server
uvicorn app.main:app --reload

### 5. Setting up the Frontend
# Move into frontend directory
cd frontend

# Install all locked frontend software requirements
npm install

# Start the React server
npm run dev

