# AI Interview Preparation Generator

A full-stack AI-style interview preparation application built using **FastAPI (Python)** for the backend and **Next.js (React + TypeScript)** for the frontend.

This project demonstrates how a modern interview preparation system can be structured using a responsive interface, scalable APIs, and modular architecture.

The application generates structured preparation plans including **topics, algorithms, behavioral concepts, and system design areas** to help candidates prepare for technical interviews.

---

## Features

- Interactive interview preparation generator
- Real-time communication between frontend and backend
- REST API built with FastAPI
- Next.js modern frontend UI
- Structured preparation topics and algorithms
- Modular architecture ready for AI integration

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- CSS

### Backend
- FastAPI
- Python

### Tools
- Git
- GitHub
- REST APIs

---

## Project Structure

```
interview-prep-app
│
├── backend
│   ├── app
│   │   └── main.py
│   └── requirements.txt
│
├── frontend
│   ├── app
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Vilas2809/interview-prep-app.git
cd interview-prep-app
```

---

## Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend will run on:

```
http://127.0.0.1:8000
```

API documentation:

```
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Frontend will run on:

```
http://localhost:3000
```

---

## Usage

1. Open the application in your browser.
2. Select the target company.
3. Choose the role you are preparing for.
4. Select the experience level.
5. Choose the interview type.
6. Click **Generate**.

The application will display recommended interview preparation topics and algorithms.

---

## Future Improvements

- Integrate real AI-generated interview questions
- Add LeetCode problem recommendations
- Improve UI with TailwindCSS
- Add authentication and user profiles
- Save and track preparation plans

---

## License

This project is open source and available under the **MIT License**.
