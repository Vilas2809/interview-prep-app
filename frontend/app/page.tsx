"use client";

import { useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function Home() {
  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Developer");
  const [interviewType, setInterviewType] = useState("Theory");
  const [experience, setExperience] = useState("Entry Level");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [betterAnswer, setBetterAnswer] = useState("");
  const [nextQuestion, setNextQuestion] = useState("");

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      if (text) {
        setAnswer((prev) => `${prev} ${text}`.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError("Speech recognition failed.");
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const resetInterview = () => {
    setQuestion("");
    setAnswer("");
    setHistory([]);
    setError("");
    setScore("");
    setFeedback("");
    setBetterAnswer("");
    setNextQuestion("");
    stopListening();
  };

  const startInterview = async () => {
    setLoading(true);
    setError("");
    setScore("");
    setFeedback("");
    setBetterAnswer("");
    setNextQuestion("");

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

      if (!res.ok) {
        throw new Error(data.detail || "Failed to start interview");
      }

      setQuestion(data.question);
      setHistory([`AI: ${data.question}`]);
    } catch (err: any) {
      setError(err.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please enter or speak an answer first.");
      return;
    }

    setLoading(true);
    setError("");
    stopListening();

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

      if (!res.ok) {
        throw new Error(data.detail || "Failed to submit answer");
      }

      const resultText = data.result || "";

      const scoreMatch = resultText.match(/Score:\s*(.*)/i);
      const feedbackMatch = resultText.match(/Feedback:\s*(.*)/i);
      const betterAnswerMatch = resultText.match(
        /Better Answer:\s*([\s\S]*?)Next Question:/i
      );
      const nextQuestionMatch = resultText.match(/Next Question:\s*([\s\S]*)/i);

      const parsedScore = scoreMatch ? scoreMatch[1].trim() : "";
      const parsedFeedback = feedbackMatch ? feedbackMatch[1].trim() : "";
      const parsedBetterAnswer = betterAnswerMatch
        ? betterAnswerMatch[1].trim()
        : "";
      const parsedNextQuestion = nextQuestionMatch
        ? nextQuestionMatch[1].trim()
        : "";

      setScore(parsedScore);
      setFeedback(parsedFeedback);
      setBetterAnswer(parsedBetterAnswer);
      setNextQuestion(parsedNextQuestion);

      setHistory((prev) => [
        ...prev,
        `You: ${answer}`,
        `Score: ${parsedScore}`,
        `Feedback: ${parsedFeedback}`,
        `Better Answer: ${parsedBetterAnswer}`,
        `Next Question: ${parsedNextQuestion}`,
      ]);

      if (parsedNextQuestion) {
        setQuestion(parsedNextQuestion);
      }

      setAnswer("");
    } catch (err: any) {
      setError(err.message || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const skipQuestion = async () => {
    if (!question.trim()) {
      setError("No current question to skip.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/mock-interview/next`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          role,
          interview_type: interviewType,
          experience_level: experience,
          previous_question: question,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to skip question");
      }

      setQuestion(data.question);
      setHistory((prev) => [...prev, `AI: ${data.question}`]);
      setAnswer("");
      setScore("");
      setFeedback("");
      setBetterAnswer("");
      setNextQuestion("");
    } catch (err: any) {
      setError(err.message || "Failed to skip question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="backgroundGlow glowOne" />
      <div className="backgroundGlow glowTwo" />

      <div className="container">
        <section className="hero">
          <div className="badge">AI-Powered Mock Interview</div>
          <h1 className="title">Mock Interview AI</h1>
          <p className="subtitle">
            Type any company, role, interview type, and experience level. Practice
            theory, coding, behavioral, system design, and more.
          </p>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2 className="panelTitle">Interview Setup</h2>
            <p className="panelText">
              Make it as specific as you want. Examples: Tesla, Backend Engineer,
              DBMS, Mid Level.
            </p>
          </div>

          <div className="grid">
            <div>
              <label className="label">Company</label>
              <input
                className="input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google, Tesla, NVIDIA, Stripe..."
              />
            </div>

            <div>
              <label className="label">Role</label>
              <input
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Software Engineer, AI Engineer..."
              />
            </div>

            <div>
              <label className="label">Interview Type</label>
              <input
                className="input"
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                placeholder="Theory, Coding, Behavioral, OOP, DBMS..."
              />
            </div>

            <div>
              <label className="label">Experience Level</label>
              <input
                className="input"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Entry Level, Mid Level, Senior Level"
              />
            </div>
          </div>

          <button
            className="primaryButton"
            onClick={startInterview}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Interview"}
          </button>

          {error && <div className="error">{error}</div>}
        </section>

        {question && (
          <>
            <section className="questionCard">
              <div className="miniLabel">Current Question</div>
              <div className="questionText">{question}</div>
            </section>

            <section className="voicePanel">
              <div className="rowBetween">
                <div>
                  <div className="sectionTitle">Your Response</div>
                  <div className="helperText">Type your answer or use the mic.</div>
                </div>

                <div className="audioActions">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`micMainButton ${isListening ? "micActive" : ""}`}
                  >
                    {isListening ? "Stop Listening 🎙️" : "Speak Answer 🎤"}
                  </button>
                </div>
              </div>

              <textarea
                className="textarea"
                placeholder="Type your answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />

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
                  {loading ? "Loading..." : "Skip Question"}
                </button>
              </div>
            </section>
          </>
        )}

        {(score || feedback || betterAnswer || nextQuestion) && (
          <section className="feedbackGrid">
            {score && (
              <div className="feedbackCard">
                <div className="feedbackLabel">Score</div>
                <div className="scoreValue">{score}</div>
              </div>
            )}

            {feedback && (
              <div className="feedbackCard">
                <div className="feedbackLabel">Feedback</div>
                <div className="feedbackValue">{feedback}</div>
              </div>
            )}

            {betterAnswer && (
              <div className="feedbackCard feedbackFull">
                <div className="feedbackLabel">Better Answer</div>
                <div className="feedbackValue">{betterAnswer}</div>
              </div>
            )}

            {nextQuestion && (
              <div className="feedbackCard feedbackFull">
                <div className="feedbackLabel">Next Question</div>
                <div className="feedbackValue">{nextQuestion}</div>
              </div>
            )}
          </section>
        )}

        <div className="topActionRow">
          <button className="secondaryActionButton" onClick={resetInterview}>
            Reset Interview
          </button>
        </div>

        <section className="panel">
          <div className="panelHeader">
            <h2 className="panelTitle">Interview History</h2>
            <p className="panelText">
              Track your questions, answers, feedback, and follow-up prompts.
            </p>
          </div>

          {history.length === 0 ? (
            <div className="placeholder">No interview history yet.</div>
          ) : (
            <div className="historyBox">
              {history.map((item, index) => {
                let className = "historyItem";

                if (item.startsWith("AI:")) className += " questionHistory";
                else if (item.startsWith("You:")) className += " answerHistory";
                else if (
                  item.startsWith("Score:") ||
                  item.startsWith("Feedback:") ||
                  item.startsWith("Better Answer:") ||
                  item.startsWith("Next Question:")
                ) {
                  className += " feedbackHistory";
                } else {
                  className += " skipHistory";
                }

                return (
                  <div key={index} className={className}>
                    {item}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}