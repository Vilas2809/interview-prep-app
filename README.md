# 🚀 Interview Prep AI

An AI-powered mock interview platform that helps users practice technical, behavioral, coding, OOP, DBMS, and system design interviews with real-time feedback.

---

## 🌐 Live Demo

Frontend: https://interview-prep-app-steel.vercel.app  
Backend: https://interview-prep-app-2tu8.onrender.com

---

## 🧠 Features

- Company-specific interview questions
- Role-based customization
- Experience-level targeting
- AI-generated interview questions using Groq
- Real-time answer evaluation
- Score, feedback, and improved answer generation
- Skip question functionality
- Multi-question interview flow
- Question counter
- Timer-based interview simulation
- Voice input support
- Reset interview functionality

---

## 🏗️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- CSS / Tailwind-ready styling

### Backend
- FastAPI
- Python
- Groq API
- Pydantic

### Deployment
- Vercel for frontend
- Render for backend

---

## ⚙️ API Endpoints

### Start Interview
`POST /interview`

Starts a new mock interview session and generates the first question.

### Submit Answer
`POST /mock-interview/answer`

Evaluates the user’s answer and returns:
- score
- feedback
- better answer
- next question

### Skip Question
`POST /mock-interview/next`

Skips the current question and generates a new one.

### Health Check
`GET /`

Returns a basic backend running message.

---

## 🔁 How It Works

1. User enters:
   - company
   - role
   - interview type
   - experience level

2. Frontend sends request to:

       POST /interview

3. Backend generates a question using Groq.

4. User can:
   - submit an answer
   - skip the current question

5. Frontend sends answer to:

       POST /mock-interview/answer

6. Backend evaluates the answer and returns:
   - score
   - feedback
   - better answer
   - next question

7. If user clicks skip, frontend sends request to:

       POST /mock-interview/next

8. Backend returns a new interview question.

---

## 📦 Project Structure

    interview-prep-app/
    ├── frontend/
    │   └── app/
    │       └── page.tsx
    ├── backend/
    │   └── main.py
    ├── README.md
    └── .gitignore

---

## 🔧 Frontend Setup

### 1. Go to frontend folder

    cd frontend

### 2. Install dependencies

    npm install

### 3. Run development server

    npm run dev

Frontend usually runs on:

    http://localhost:3000

---

## 🔧 Backend Setup

### 1. Go to backend folder

    cd backend

### 2. Create virtual environment

    python -m venv venv

### 3. Activate virtual environment

#### Mac / Linux

    source venv/bin/activate

#### Windows

    venv\Scripts\activate

### 4. Install dependencies

    pip install -r requirements.txt

### 5. Run FastAPI server

    uvicorn main:app --reload

Backend usually runs on:

    http://127.0.0.1:8000

Swagger docs:

    http://127.0.0.1:8000/docs

---

## 🔐 Environment Variables

### Backend `.env`

Create a `.env` file inside the `backend` folder:

    GROQ_API_KEY=your_groq_api_key_here

### Frontend `.env.local`

Create a `.env.local` file inside the `frontend` folder:

    NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

For production, set it to your Render backend URL:

    NEXT_PUBLIC_API_URL=https://interview-prep-app-2tu8.onrender.com

---

## 🚀 Deployment

### Frontend Deployment on Vercel

1. Push frontend code to GitHub
2. Import project into Vercel
3. Add environment variable:

       NEXT_PUBLIC_API_URL=https://interview-prep-app-2tu8.onrender.com

4. Deploy

### Backend Deployment on Render

1. Push backend code to GitHub
2. Create a new Web Service in Render
3. Set build/start settings
4. Add environment variable:

       GROQ_API_KEY=your_groq_api_key_here

5. Deploy

---

## 📡 Example API Requests

### Start Interview Request

    POST /interview

Request body:

    {
      "company": "Google",
      "role": "Software Developer",
      "interview_type": "Theory",
      "experience_level": "Entry Level"
    }

Example response:

    {
      "question": "Explain the concept of Big O notation and how it is used to analyze algorithm performance."
    }

---

### Submit Answer Request

    POST /mock-interview/answer

Request body:

    {
      "company": "Google",
      "role": "Software Developer",
      "interview_type": "Theory",
      "experience_level": "Entry Level",
      "current_question": "Explain Big O notation.",
      "user_answer": "Big O notation is used to measure time complexity."
    }

Example response:

    {
      "score": "8/10",
      "feedback": "Good basic explanation, but include examples and mention scalability.",
      "better_answer": "Big O notation describes how the time or space requirements of an algorithm grow as input size increases...",
      "next_question": "What is the difference between O(n) and O(log n)?"
    }

---

### Skip Question Request

    POST /mock-interview/next

Request body:

    {
      "company": "Tesla",
      "role": "Software Developer",
      "interview_type": "oop",
      "experience_level": "Entry Level",
      "previous_question": "Explain inheritance in Java."
    }

Example response:

    {
      "question": "What is polymorphism in Java, and how would you use it in a Tesla vehicle software system?"
    }

---

## 💡 Why This Project Matters

This project demonstrates:

- Full-stack development
- Real-world API integration
- AI/LLM-powered product development
- State management in React
- FastAPI backend development
- Cloud deployment with Vercel and Render
- Practical project building for resume and portfolio

---

## 🚀 Future Improvements

- Final interview summary
- Total score dashboard
- Weak area analysis
- Suggested improvement plan
- Interview history persistence
- User authentication
- Export results as PDF
- Full voice-based mock interview mode
- Mobile responsiveness improvements

---

## 👨‍💻 Author

**Vilas Reddy**

---

## ⭐ Support

If you like this project, star the repository on GitHub.

---

## 📝 Git Commands

After adding this README:

    git add README.md
    git commit -m "docs: add complete project README"
    git push origin main
