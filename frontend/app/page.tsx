"use client";

import { useRef, useState } from "react";

const companies = [
  "General",
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Tesla",
];

const interviewTypes = ["Technical", "HR", "Behavioral", "DSA", "OOP"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior Level"];

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function Home() {
  const [company, setCompany] = useState("General");
  const [interviewType, setInterviewType] = useState("Technical");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    setError("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };

    recognition.onerror = () => {
      setError("Voice input failed. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const startInterview = async () => {
    setLoading(true);
    setError("");
    setHistory([]);
    setAnswer("");
    setStarted(false);
    stopListening();

    try {
      const res = await fetch("http://127.0.0.1:8000/mock-interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          interview_type: interviewType,
          experience_level: experienceLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to start interview.");
      }

      setCurrentQuestion(data.question);
      setHistory([`AI Question: ${data.question}`]);
      setStarted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please speak or type your answer first.");
      return;
    }

    setLoading(true);
    setError("");
    stopListening();

    try {
      const res = await fetch("http://127.0.0.1:8000/mock-interview/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          interview_type: interviewType,
          experience_level: experienceLevel,
          current_question: currentQuestion,
          user_answer: answer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to submit answer.");
      }

      const resultText = data.result || "";
      const nextQuestionMatch = resultText.match(/Next Question:\s*(.*)/i);
      const nextQuestion = nextQuestionMatch ? nextQuestionMatch[1].trim() : "";

      setHistory((prev) => [
        ...prev,
        `Your Answer: ${answer}`,
        `AI Feedback:\n${resultText}`,
        ...(nextQuestion ? [`AI Question: ${nextQuestion}`] : []),
      ]);

      setAnswer("");

      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const skipQuestion = async () => {
    if (!currentQuestion.trim()) {
      setError("No current question to skip.");
      return;
    }

    setLoading(true);
    setError("");
    stopListening();

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          interview_type: interviewType,
          experience_level: experienceLevel,
          previous_question: currentQuestion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to get next question.");
      }

      const nextQuestion = data.question || "";

      setHistory((prev) => [
        ...prev,
        `Skipped Question: ${currentQuestion}`,
        `AI Question: ${nextQuestion}`,
      ]);

      setCurrentQuestion(nextQuestion);
      setAnswer("");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    stopListening();
    setStarted(false);
    setCurrentQuestion("");
    setAnswer("");
    setHistory([]);
    setError("");
  };

  return (
    <main className="page">
      <div className="backgroundGlow glowOne"></div>
      <div className="backgroundGlow glowTwo"></div>

      <div className="container">
        <header className="hero">
          <div className="badge">AI-Powered Mock Interview</div>
          <h1 className="title">Mock Interview AI</h1>
          <p className="subtitle">
            Practice with realistic interview questions, voice input, feedback,
            scoring, and smarter question progression.
          </p>
        </header>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <h2 className="panelTitle">Interview Setup</h2>
              <p className="panelText">
                Pick your target company, interview style, and experience level.
              </p>
            </div>
          </div>

          <div className="grid">
            <div>
              <label className="label">Company</label>
              <select
                className="input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={started}
              >
                {companies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Interview Type</label>
              <select
                className="input"
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                disabled={started}
              >
                {interviewTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="gridFull">
              <label className="label">Experience Level</label>
              <select
                className="input"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                disabled={started}
              >
                {experienceLevels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!started ? (
            <button className="primaryButton" onClick={startInterview} disabled={loading}>
              {loading ? "Starting..." : "Start Mock Interview"}
            </button>
          ) : (
            <div className="topActionRow">
              <button className="secondaryActionButton" onClick={resetInterview} type="button">
                Reset Interview
              </button>
            </div>
          )}

          {error && <p className="error">{error}</p>}
        </section>

        {started && (
          <>
            <section className="panel">
              <div className="questionCard">
                <div className="rowBetween">
                  <div>
                    <p className="miniLabel">Current Question</p>
                    <h2 className="sectionTitle">Answer this question</h2>
                  </div>
                </div>

                <p className="questionText">{currentQuestion}</p>
              </div>

              <div className="voicePanel">
                <div className="rowBetween">
                  <div>
                    <p className="miniLabel">Your Response</p>
                    <h2 className="sectionTitle">Speak or type your answer</h2>
                  </div>

                  <button
                    className={`micMainButton ${isListening ? "micActive" : ""}`}
                    onClick={isListening ? stopListening : startListening}
                    type="button"
                  >
                    {isListening ? "⏹ Stop Mic" : "🎤 Speak Answer"}
                  </button>
                </div>

                <textarea
                  className="textarea"
                  placeholder="Speak with the mic or type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />

                <p className="helperText">
                  {isListening
                    ? "Listening... speak now."
                    : "Use the mic button for voice input or type manually."}
                </p>

                <div className="buttonRow">
                  <button
                    className="primaryButton halfButton"
                    onClick={submitAnswer}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Answer"}
                  </button>

                  <button
                    className="skipButton halfButton"
                    onClick={skipQuestion}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Skip / Next Question"}
                  </button>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panelHeader">
                <div>
                  <h2 className="panelTitle">Interview History</h2>
                  <p className="panelText">
                    Review asked questions, your answers, and feedback.
                  </p>
                </div>
              </div>

              <div className="historyBox">
                {history.length === 0 ? (
                  <p className="placeholder">Your mock interview history will appear here.</p>
                ) : (
                  history.map((item, index) => {
                    const className = item.startsWith("AI Question:")
                      ? "historyItem questionHistory"
                      : item.startsWith("Your Answer:")
                      ? "historyItem answerHistory"
                      : item.startsWith("AI Feedback:")
                      ? "historyItem feedbackHistory"
                      : "historyItem skipHistory";

                    return (
                      <pre key={index} className={className}>
                        {item}
                      </pre>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}