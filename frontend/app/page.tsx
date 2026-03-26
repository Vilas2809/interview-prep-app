"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const TOTAL_QUESTIONS = 5;
const QUESTION_TIME_SECONDS = 120;

type EvaluationResult = {
  score: string;
  feedback: string;
  better_answer: string;
  next_question: string;
};

export default function Home() {
  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Developer");
  const [interviewType, setInterviewType] = useState("Theory");
  const [experience, setExperience] = useState("Entry Level");

  const [question, setQuestion] = useState("");
  const [pendingNextQuestion, setPendingNextQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [betterAnswer, setBetterAnswer] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [showNextButton, setShowNextButton] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const recognitionRef = useRef<any>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!interviewStarted || !question || showNextButton || interviewCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, question, showNextButton, interviewCompleted]);

  useEffect(() => {
    if (timeLeft === 0 && question && !showNextButton && !loading && !interviewCompleted) {
      handleSubmitAnswer(true);
    }
  }, [timeLeft, question, showNextButton, loading, interviewCompleted]);

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
    stopListening();
    setQuestion("");
    setPendingNextQuestion("");
    setAnswer("");
    setHistory([]);
    setError("");
    setScore("");
    setFeedback("");
    setBetterAnswer("");
    setInterviewStarted(false);
    setQuestionNumber(0);
    setTimeLeft(QUESTION_TIME_SECONDS);
    setShowNextButton(false);
    setInterviewCompleted(false);
  };

  const clearEvaluation = () => {
    setScore("");
    setFeedback("");
    setBetterAnswer("");
  };

  const startInterview = async () => {
    setLoading(true);
    setError("");
    clearEvaluation();
    setPendingNextQuestion("");
    setAnswer("");
    setShowNextButton(false);
    setInterviewCompleted(false);

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
      setInterviewStarted(true);
      setQuestionNumber(1);
      setTimeLeft(QUESTION_TIME_SECONDS);
      setHistory([`AI: ${data.question}`]);
    } catch (err: any) {
      setError(err.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (autoSubmit = false) => {
    const finalAnswer = answer.trim();

    if (!finalAnswer && !autoSubmit) {
      setError("Please enter or speak an answer first.");
      return;
    }

    setLoading(true);
    setError("");
    stopListening();

    try {
      const res = await fetch(`${API_URL}/mock_interview/answer`, {
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
          user_answer: finalAnswer || "No answer provided. Time ran out.",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to submit answer");
      }

      const result: EvaluationResult = data;

      setScore(result.score || "");
      setFeedback(result.feedback || "");
      setBetterAnswer(result.better_answer || "");
      setPendingNextQuestion(result.next_question || "");
      setShowNextButton(true);

      setHistory((prev) => [
        ...prev,
        `You: ${finalAnswer || "No answer provided. Time ran out."}`,
        `Score: ${result.score || ""}`,
        `Feedback: ${result.feedback || ""}`,
        `Better Answer: ${result.better_answer || ""}`,
        `Next Question: ${result.next_question || ""}`,
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (questionNumber >= TOTAL_QUESTIONS) {
      setInterviewCompleted(true);
      setShowNextButton(false);
      setPendingNextQuestion("");
      setQuestion("");
      stopListening();
      return;
    }

    setQuestion(pendingNextQuestion);
    setAnswer("");
    clearEvaluation();
    setPendingNextQuestion("");
    setShowNextButton(false);
    setQuestionNumber((prev) => prev + 1);
    setTimeLeft(QUESTION_TIME_SECONDS);
    setHistory((prev) => [...prev, `AI: ${pendingNextQuestion}`]);
  };

  const skipQuestion = async () => {
    if (!question.trim()) {
      setError("No current question to skip.");
      return;
    }

    setLoading(true);
    setError("");
    stopListening();

    try {
      const res = await fetch(`${API_URL}/mock_interview/next`, {
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
      setAnswer("");
      clearEvaluation();
      setPendingNextQuestion("");
      setShowNextButton(false);
      setTimeLeft(QUESTION_TIME_SECONDS);

      setHistory((prev) => [...prev, `Skipped Question`, `AI: ${data.question}`]);
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
          <h1 className="title">Interview Prep AI</h1>
          <p className="subtitle">
            Practice company-specific technical, behavioral, coding, OOP, DBMS,
            and system design interviews with AI-generated questions and feedback.
          </p>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2 className="panelTitle">Interview Setup</h2>
            <p className="panelText">
              Enter the company, role, interview type, and experience level to begin.
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
                disabled={interviewStarted && !interviewCompleted}
              />
            </div>

            <div>
              <label className="label">Role</label>
              <input
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Software Engineer, AI Engineer..."
                disabled={interviewStarted && !interviewCompleted}
              />
            </div>

            <div>
              <label className="label">Interview Type</label>
              <input
                className="input"
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                placeholder="Theory, Coding, Behavioral, OOP, DBMS..."
                disabled={interviewStarted && !interviewCompleted}
              />
            </div>

            <div>
              <label className="label">Experience Level</label>
              <input
                className="input"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Entry Level, Mid Level, Senior Level"
                disabled={interviewStarted && !interviewCompleted}
              />
            </div>
          </div>

          {!interviewStarted || interviewCompleted ? (
            <button
              className="primaryButton"
              onClick={startInterview}
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Interview"}
            </button>
          ) : (
            <div className="lockedBanner">
              Interview in progress. Reset interview to change setup.
            </div>
          )}

          {error && <div className="error">{error}</div>}
        </section>

        {interviewStarted && !interviewCompleted && question && (
          <>
            <section className="sessionCard">
              <div className="rowBetween sessionMeta">
                <div className="miniLabel">
                  Question {questionNumber} of {TOTAL_QUESTIONS}
                </div>
                <div className={`timerBadge ${timeLeft <= 20 ? "timerDanger" : ""}`}>
                  ⏱ {formatTime(timeLeft)}
                </div>
              </div>

              <div className="sectionTitle">Current Question</div>
              <div className="questionText">{question}</div>
            </section>

            <section className="voicePanel">
              <div className="rowBetween">
                <div>
                  <div className="sectionTitle">Your Answer</div>
                  <div className="helperText">
                    Type your answer or use voice input.
                  </div>
                </div>

                <div className="audioActions">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`micMainButton ${isListening ? "micActive" : ""}`}
                    disabled={showNextButton || loading}
                  >
                    {isListening ? "Stop Listening 🎙️" : "Speak Answer 🎤"}
                  </button>
                </div>
              </div>

              <textarea
                className="textarea"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={showNextButton || loading}
              />

              <div className="buttonRow">
                <button
                  className="primaryButton halfButton"
                  onClick={() => handleSubmitAnswer(false)}
                  disabled={loading || showNextButton}
                >
                  {loading ? "Submitting..." : "Submit Answer"}
                </button>

                <button
                  className="skipButton halfButton"
                  onClick={skipQuestion}
                  disabled={loading || showNextButton}
                >
                  {loading ? "Loading..." : "Skip Question"}
                </button>
              </div>
            </section>

            {(score || feedback || betterAnswer) && (
              <section className="panel">
                <div className="panelHeader">
                  <h2 className="panelTitle">Evaluation</h2>
                  <p className="panelText">
                    Review your score, feedback, and a stronger sample answer.
                  </p>
                </div>

                <div className="feedbackGrid">
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
                </div>

                {showNextButton && (
                  <div className="nextActionRow">
                    <button className="primaryButton nextButton" onClick={handleNextQuestion}>
                      {questionNumber >= TOTAL_QUESTIONS
                        ? "Finish Interview"
                        : "Next Question →"}
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {interviewCompleted && (
          <section className="panel">
            <div className="panelHeader">
              <h2 className="panelTitle">Interview Completed</h2>
              <p className="panelText">
                Great job — you completed the mock interview session.
              </p>
            </div>

            <div className="completionBox">
              <div className="completionTitle">Session Finished</div>
              <div className="completionText">
                You answered {TOTAL_QUESTIONS} questions. Review your interview history
                below or reset to start another session.
              </div>
            </div>
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
              Track your questions, answers, scores, and feedback throughout the session.
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