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
