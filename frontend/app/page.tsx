"use client";

import { useState, useRef } from "react";
import {
  Mic,
  Briefcase,
  MessageSquare,
  Sparkles,
} from "lucide-react";

/* ✅ Fix TypeScript SpeechRecognition error */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const companies = ["Google", "Amazon", "Microsoft", "Meta"];
  const roles = ["Software Engineer", "Software Developer", "AI Engineer", "Network Engineer"];
  const interviewTypes = ["Technical", "HR"];
  const experienceLevels = ["Entry Level", "Mid Level", "Senior"];

  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Engineer");
  const [interviewType, setInterviewType] = useState("Technical");
  const [experience, setExperience] = useState("Entry Level");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef<any>(null);

  /* 🎤 Start Speech */
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  /* 🎤 Stop Speech */
  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  /* 🚀 Start Interview */
  const startInterview = async () => {
    setLoading(true);
    setHistory([]);
    setAnswer("");

    try {
      const res = await fetch(`${API_URL}/interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    } catch (err) {
      alert("Error starting interview");
    } finally {
      setLoading(false);
    }
  };

  /* 📩 Submit Answer */
  const submitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/mock-interview/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      const nextQ = data.result || "Next question not found";

      setQuestion(nextQ);
      setHistory((prev) => [
        ...prev,
        `You: ${answer}`,
        `AI: ${nextQ}`,
      ]);

      setAnswer("");
    } catch (err) {
      alert("Error submitting answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center p-6">

      {/* 🔥 Header */}
      <h1 className="text-3xl font-bold mb-6">
        Mock Interview AI
      </h1>

      {/* 🎯 Controls */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-3xl mb-4">

        <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="bg-[#161b22] p-3 rounded-lg"
        >
          {companies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-[#161b22] p-3 rounded-lg"
        >
          {roles.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        <select
          value={interviewType}
          onChange={(e) => setInterviewType(e.target.value)}
          className="bg-[#161b22] p-3 rounded-lg"
        >
          {interviewTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="bg-[#161b22] p-3 rounded-lg"
        >
          {experienceLevels.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      </div>

      {/* 🚀 Start Button */}
      <button
        onClick={startInterview}
        className="w-full max-w-3xl bg-blue-600 hover:bg-blue-700 p-3 rounded-lg mb-6"
      >
        Start Interview
      </button>

      {/* 💬 Chat UI */}
      <div className="w-full max-w-3xl space-y-4">

        {history.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              msg.startsWith("AI")
                ? "bg-[#161b22]"
                : "bg-blue-600 text-right"
            }`}
          >
            {msg}
          </div>
        ))}

        {/* ✍️ Input */}
        {question && (
          <div className="flex gap-2">
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 p-3 rounded-lg bg-[#161b22]"
            />

            {/* 🎤 Mic */}
            <button
              onClick={startListening}
              className="bg-green-600 p-3 rounded-lg"
            >
              <Mic />
            </button>

            <button
              onClick={submitAnswer}
              className="bg-blue-600 px-4 rounded-lg"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}