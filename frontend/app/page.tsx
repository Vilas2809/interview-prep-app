"use client";

import { useState } from "react";
import { Briefcase, Sparkles, MessageSquare } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const ROLE_MAP = {
  SE: "Software Engineer",
  SD: "Software Developer",
  AI: "AI Engineer",
  NE: "Network Engineer",
};

export default function Home() {
  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("SE");
  const [interviewType, setInterviewType] = useState("Technical");
  const [experience, setExperience] = useState("Entry Level");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState("");

  const startInterview = async () => {
    setError("");

    try {
      const res = await fetch(`${API_URL}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          interview_type: interviewType,
          experience_level: experience,
        }),
      });

      const data = await res.json();
      setQuestion(data.question);
      setHistory([`AI: ${data.question}`]);
    } catch {
      setError("Failed to start interview");
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;

    try {
      const res = await fetch(`${API_URL}/mock-interview/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          interview_type: interviewType,
          experience_level: experience,
          current_question: question,
          user_answer: answer,
        }),
      });

      const data = await res.json();

      setHistory((prev) => [
        ...prev,
        `You: ${answer}`,
        `AI: ${data.result}`,
      ]);

      setAnswer("");
    } catch {
      setError("Failed to submit answer");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Mock Interview AI</h1>
      <p className="subtitle">
        Practice interviews like ChatGPT / Gemini style
      </p>

      {/* dropdowns */}
      <div className="row">
        <select
          className="select half"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        >
          <option>Google</option>
          <option>Amazon</option>
          <option>Microsoft</option>
          <option>Meta</option>
        </select>

        <select
          className="select half"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {Object.entries(ROLE_MAP).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        <select
          className="select half"
          value={interviewType}
          onChange={(e) => setInterviewType(e.target.value)}
        >
          <option>Technical</option>
          <option>Behavioral</option>
        </select>

        <select
          className="select half"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        >
          <option>Entry Level</option>
          <option>Mid Level</option>
          <option>Senior</option>
        </select>
      </div>

      {/* start */}
      <button className="button" onClick={startInterview}>
        Start Interview
      </button>

      {/* question */}
      {question && <div className="question">{question}</div>}

      {/* answer */}
      <textarea
        className="textarea"
        placeholder="Type your answer..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        style={{ marginTop: 20 }}
      />

      <button className="button" onClick={submitAnswer}>
        Submit Answer
      </button>

      {/* error */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* chat */}
      <div className="chat">
        {history.map((msg, i) => (
          <div
            key={i}
            className={`chat-item ${
              msg.startsWith("AI") ? "chat-ai" : "chat-user"
            }`}
          >
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}