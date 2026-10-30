# Food Verse AI – Multimodal Food Intelligence Agent

**Food Verse AI** is an intelligent, multimodal food technology platform combining computer vision, USDA-standard nutritional science, visible produce freshness assessment, automated kitchen hygiene auditing, conversational AI cooking assistance with voice input/output, and personalized meal planning.

---

## 1. Project Architecture

Food Verse AI is engineered as a clean, decoupled full-stack application:

```
project(smartbridge)/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application root & middleware
│   │   ├── core/
│   │   │   └── config.py               # Pydantic settings & file limitations
│   │   ├── database/
│   │   │   ├── db.py                   # SQLAlchemy SQLite engine & session
│   │   │   └── models.py               # Database schemas (AnalysisHistory, UserProfile, SavedMealPlan)
│   │   ├── data/
│   │   │   ├── usda_nutrition_db.json  # Calibrated nutrient reference dataset (120+ foods)
│   │   │   └── culinary_recipes_db.json# Curated culinary recipes & substitutions
│   │   ├── schemas/                    # Pydantic request/response schemas
│   │   │   ├── food_schemas.py
│   │   │   ├── nutrition_schemas.py
│   │   │   ├── freshness_schemas.py
│   │   │   ├── hygiene_schemas.py
│   │   │   ├── cooking_schemas.py
│   │   │   ├── meal_plan_schemas.py
│   │   │   ├── history_schemas.py
│   │   │   └── settings_schemas.py
│   │   ├── services/                   # Modular AI & Analytical Services
│   │   │   ├── food_recognition_service.py # Image classification & color/texture profiling
│   │   │   ├── nutrition_service.py        # Portion scaling & explainable Health Score
│   │   │   ├── freshness_service.py        # OpenCV HSV necrosis/chlorophyll assessment
│   │   │   ├── hygiene_service.py          # OpenCV keyframe video hygiene audit
│   │   │   ├── cooking_service.py          # Gemini LLM with offline fallback engine
│   │   │   └── meal_plan_service.py        # Goal-based dietary scheduler & grocery list
│   │   └── routers/                    # REST API endpoints
│   ├── tests/
│   │   └── test_api.py                 # Automated backend verification test suite
│   ├── uploads/                        # Local file uploads storage
│   └── requirements.txt
├── frontend/
│   ├── public/                         # Favicon & sample assets
│   ├── src/
│   │   ├── components/                 # Navbar, Sidebar, Footer, Card, Badge, Skeletons
│   │   ├── context/                    # AppContext (profile, calorie target, toasts)
│   │   ├── hooks/                      # useSpeech (Web Speech API STT & TTS)
│   │   ├── pages/                      # 10 pages (Landing, Dashboard, 6 Modules, History, Settings)
│   │   ├── services/                   # Axios API service client
│   │   ├── App.jsx                     # Layout & React Router routes
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Tailwind styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .env.example                        # Environment variable template
├── .gitignore
└── README.md
```

---

## 2. Core Modules & Working Capabilities

| Module | Engine / AI Tech | What Genuinely Works |
|---|---|---|
| **1. Food Recognition** | OpenCV & MobileNetV2 features | Multi-format image upload, color histogram analysis, texture entropy, confidence scoring, uncertainty threshold warnings, and direct 1-click transfer to Nutrition Analyzer. |
| **2. Nutrition Analyzer** | USDA Calibrated Nutrition Engine | Dynamic portion size adjustment (slider/input), calories, macronutrients (P/C/F), dietary fiber, sugars, sodium, micronutrients, and an explainable Health Score (0-100) with positives/warnings. |
| **3. Freshness Checker** | OpenCV HSV/LAB & Morphology | Produce category filtering, surface browning/necrosis area %, chlorophyll retention %, texture roughness, Freshness Index, storage recommendations, and scientific disclaimer. |
| **4. Hygiene Monitor** | OpenCV Video Keyframe Sampling | Short kitchen video upload (MP4/WebM/MOV), keyframe extraction at 1.5s intervals, hair covering / cap verification, nitrile glove detection, countertop clutter variance, risk grading, and actionable corrective steps. |
| **5. AI Cooking Assistant** | Google Gemini API + Offline Culinary Engine | Multimodal conversation: text + Web Speech microphone input (STT) + recipe reader (TTS). Recipe cards with measurements, step-by-step instructions, ingredient substitutions, allergens, and food handling safety. |
| **6. Meal Planner** | Goal-based Scheduler | Custom plans for Vegetarian, Vegan, Eggetarian, and Non-Vegetarian diets. Caloric alignment for weight management, wellness, or muscle gain. Allergen exclusions, categorized supermarket shopping list, and print export. |
| **7. Analysis History** | SQLite & SQLAlchemy | Persistent logging of all inspections, search and filter by type, detail inspection modal, CSV export, and record deletion. |
| **8. Settings** | Dynamic Configuration | Calorie targets, dietary goals, allergy tags, and runtime API key configuration (Gemini & USDA). |

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios, Web Speech API (SpeechRecognition & SpeechSynthesis).
- **Backend**: Python 3.14 / 3.11+, FastAPI, Uvicorn, Pydantic, SQLAlchemy, SQLite, OpenCV 5, Pillow, NumPy.

---

## 4. Prerequisites

- **Python**: Version 3.11 or higher (Tested and verified on Python 3.14.0)
- **Node.js**: Version 18 or higher (Tested and verified with Node.js v20.18.0 and npm 10.8.2)
- **Windows PowerShell** or standard terminal

---

## 5. Local Setup & Execution Guide (Windows PowerShell)

### Step 1: Clone or Navigate to the Workspace
```powershell
cd "c:\Users\agraw\Desktop\project(smartbridge)"
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
*(Optional: Open `.env` in any text editor to insert your optional `GEMINI_API_KEY` or `USDA_API_KEY`. If left blank, the application automatically uses the genuine offline fallback engines.)*

---

### Step 3: Backend Setup & Launch

1. Open a PowerShell terminal and navigate to the project directory:
```powershell
cd "c:\Users\agraw\Desktop\project(smartbridge)"
```

2. *(Optional)* Create and activate a Python virtual environment:
```powershell
python -m venv backend\.venv
.\backend\.venv\Scripts\Activate.ps1
```

3. Install required backend dependencies:
```powershell
pip install -r backend\requirements.txt
```

4. Run the automated backend verification test suite:
```powershell
python backend\tests\test_api.py
```
*Expected output: `ALL 6 TEST MODULES PASSED WITH 100% SUCCESS!`*

5. Start the FastAPI backend server:
```powershell
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Base: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

---

### Step 4: Frontend Setup & Launch

1. Open a **second** PowerShell terminal window:
```powershell
cd "c:\Users\agraw\Desktop\project(smartbridge)\frontend"
```

2. If Node.js was newly installed, ensure it is in your session path:
```powershell
$env:Path = "$env:LOCALAPPDATA\Programs\nodejs;$env:Path"
```

3. Install frontend dependencies:
```powershell
npm install
```

4. Start the Vite development server:
```powershell
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5173
```

---

## 6. How to Test Each Module

1. **Dashboard**: Navigate to `/dashboard` to view caloric progress against your daily target, macronutrient pie charts, and recent food audits.
2. **Food Recognition**: Navigate to `/recognize`, upload an image (sample images available in `frontend/public/sample_foods/` or your own), and click **Run Food Classifier**. Click **Analyze Full Nutrition** to transfer the result directly.
3. **Nutrition Analyzer**: Search for any dish (e.g. `Palak Paneer`, `Apple`, `Grilled Chicken`, `Brown Rice`), adjust the portion size slider from 50g to 400g, and observe calories, macronutrients, and health scores recalculate in real time.
4. **Produce Freshness**: Navigate to `/freshness`, pick a category (e.g. `Apples` or `Spinach`), upload a photo, and click **Assess Freshness Indicators** to inspect enzymatic spotting and storage advice.
5. **Kitchen Hygiene Video Monitor**: Navigate to `/hygiene`, upload a short kitchen clip (MP4/WebM), click **Audit Kitchen Hygiene**, and scrub through extracted keyframe evidence thumbnails.
6. **AI Cooking Assistant**: Navigate to `/cooking`, ask questions such as *"What can I cook with potatoes and tomatoes?"*, click the **Mic** button to speak your query, or click the **Speaker** icon on any recipe card to listen to step-by-step instructions.
7. **Meal Planner**: Navigate to `/meal-plan`, select your dietary preference and target fitness goal, and click **Generate Personalized Meal Plan** to receive a structured schedule and categorized shopping list.
8. **Analysis History**: Navigate to `/history` to review logged audits, inspect JSON details, export to CSV, or clear history.
9. **Settings**: Navigate to `/settings` to adjust your daily calorie target or supply optional API keys.

---

## 7. Troubleshooting

- **ModuleNotFoundError: No module named 'backend'**: Run Python commands from the project root (`c:\Users\agraw\Desktop\project(smartbridge)`), or invoke uvicorn with `python -m uvicorn backend.app.main:app --reload`.
- **Port 8000 already in use**: Start uvicorn on another port with `--port 8001`, and update `frontend/vite.config.js` proxy target accordingly.
- **Microphone access denied in browser**: Ensure your browser has granted microphone permission to `localhost:5173`.
- **Video format unsupported**: Ensure your video is encoded in standard H.264 MP4, WebM, or MOV under 50MB and 45 seconds.

---

## 8. License & Academic Attribution
Food Verse AI is developed for academic demonstration and research in Applied AI, Computer Vision, and Nutritional Data Science. All image and video-based assessments are computational estimates designed for informational guidance.
