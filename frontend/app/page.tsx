"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const [company, setCompany] = useState("General");
  const [role, setRole] = useState("SE");
  const [interviewType, setInterviewType] = useState("Technical");
  const [experienceLevel, setExperienceLevel] = useState("Entry Level");

  const [companies, setCompanies] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [interviewTypes, setInterviewTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);

  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [betterAnswer, setBetterAnswer] = useState("");
  const [nextQuestion, setNextQuestion] = useState("");

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [companiesRes, rolesRes, interviewTypesRes, experienceLevelsRes] =
          await Promise.all([
            fetch(`${API_URL}/companies`),
            fetch(`${API_URL}/roles`),
            fetch(`${API_URL}/interview-types`),
            fetch(`${API_URL}/experience-levels`),
          ]);

        const companiesData = await companiesRes.json();
        const rolesData = await rolesRes.json();
        const interviewTypesData = await interviewTypesRes.json();
        const experienceLevelsData = await experienceLevelsRes.json();

        setCompanies(companiesData.companies || []);
        setRoles(rolesData.roles || []);
        setInterviewTypes(interviewTypesData.interview_types || []);
        setExperienceLevels(experienceLevelsData.experience_levels || []);
      } catch {
        setError("Failed to load interview settings.");
      }
    };

    loadDropdownData();
  }, [API_URL]);

  const roleLabels: Record<string, string> = {
    SE: "Software Engineer",
    SD: "Software Developer",
    AI: "AI Engineer",
    NE: "Network Engineer",
  };

  const resetInterview = () => {
    setCurrentQuestion("");
    setAnswer("");
    setHistory([]);
    setError("");
    setLoading(false);
    setStarted(false);
    setScore("");
    setFeedback("");
    setBetterAnswer("");
    setNextQuestion("");
    stopListening();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

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
      const transcript = event.results[0][0].transcript;
      setAnswer((prev) => `${prev} ${transcript}`.trim());
    };

    recognition.onerror = () => {
      setError("Speech recognition failed.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const startInterview = async () => {
    setLoading(true);
    setError("");
    setHistory([]);
    setAnswer("");
    setStarted(false);
    setScore("");
    setFeedback("");
    setBetterAnswer("");
    setNextQuestion("");
    stopListening();

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
      const res = await fetch(`${API_URL}/mock-interview/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          role,
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
        `Your Answer: ${answer}`,
        `Score: ${parsedScore}`,
        `Feedback: ${parsedFeedback}`,
        `Better Answer: ${parsedBetterAnswer}`,
        `Next Question: ${parsedNextQuestion}`,
      ]);

      if (parsedNextQuestion) {
        setCurrentQuestion(parsedNextQuestion);
      }

      setAnswer("");
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
      const res = await fetch(`${API_URL}/mock-interview/next`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          role,
          interview_type: interviewType,
          experience_level: experienceLevel,
          previous_question: currentQuestion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to get next question.");
      }

      setCurrentQuestion(data.question);
      setHistory((prev) => [...prev, `Skipped to Next Question: ${data.question}`]);
      setAnswer("");
      setScore("");
      setFeedback("");
      setBetterAnswer("");
      setNextQuestion("");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 md:px-8">
        <aside className="hidden w-80 shrink-0 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:block">
          <div className="mb-6">
            <div className="mb-2 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
              AI-Powered Mock Interview
            </div>
            <h1 className="text-3xl font-bold leading-tight">Mock Interview AI</h1>
            <p className="mt-2 text-sm text-gray-300">
              Practice technical, behavioral, and role-based questions with live
              feedback.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Company
              </label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
              >
                {companies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {roleLabels[item] || item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Interview Type
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
              >
                {interviewTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 outline-none"
              >
                {experienceLevels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={startInterview}
                disabled={loading}
                className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700 disabled:opacity-60"
              >
                {loading && !started ? "Starting..." : "Start Mock Interview"}
              </button>

              <button
                onClick={resetInterview}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold transition hover:bg-white/10"
              >
                Reset Interview
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 lg:hidden">
                AI-Powered Mock Interview
              </div>
              <h2 className="text-2xl font-bold md:text-3xl">Interview Workspace</h2>
              <p className="mt-1 text-sm text-gray-300">
                {company} • {roleLabels[role] || role} • {interviewType} •{" "}
                {experienceLevel}
              </p>
            </div>

            <button
              onClick={resetInterview}
              className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 lg:block"
            >
              Reset
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
              {error}
            </div>
          )}

          {!started ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#0f172a]/60 p-10 text-center">
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold">Ready to practice?</h3>
                <p className="mt-3 text-gray-300">
                  Choose your company, role, interview type, and experience level,
                  then start a mock interview.
                </p>
                <button
                  onClick={startInterview}
                  disabled={loading}
                  className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? "Starting..." : "Start Mock Interview"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
                  Current Question
                </p>
                <p className="text-lg leading-8 text-gray-100">{currentQuestion}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold">Your Response</h3>
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-700"
                  >
                    {isListening ? "Stop Listening" : "Speak Answer"}
                  </button>
                </div>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={8}
                  className="w-full rounded-2xl border border-white/10 bg-[#111827] px-4 py-4 text-white outline-none placeholder:text-gray-500"
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={submitAnswer}
                    disabled={loading}
                    className="rounded-2xl bg-green-600 px-5 py-3 font-semibold transition hover:bg-green-700 disabled:opacity-60"
                  >
                    {loading ? "Submitting..." : "Submit Answer"}
                  </button>

                  <button
                    onClick={skipQuestion}
                    disabled={loading}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold transition hover:bg-white/10 disabled:opacity-60"
                  >
                    {loading ? "Loading..." : "Skip Question"}
                  </button>
                </div>
              </div>

              {score && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-6">
                    <p className="mb-2 text-sm font-semibold text-blue-300">Score</p>
                    <p className="text-4xl font-bold">{score}</p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-6">
                    <p className="mb-2 text-sm font-semibold text-blue-300">Feedback</p>
                    <p className="text-gray-200">{feedback}</p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-6 md:col-span-2">
                    <p className="mb-2 text-sm font-semibold text-blue-300">
                      Better Answer
                    </p>
                    <p className="whitespace-pre-line text-gray-200">{betterAnswer}</p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-6 md:col-span-2">
                    <p className="mb-2 text-sm font-semibold text-blue-300">
                      Next Question
                    </p>
                    <p className="whitespace-pre-line text-gray-200">{nextQuestion}</p>
                  </div>
                </div>
              )}

              {history.length > 0 && (
                <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-6">
                  <h3 className="mb-4 text-xl font-semibold">Interview History</h3>
                  <div className="space-y-3">
                    {history.map((item, index) => {
                      const isUser = item.startsWith("Your Answer:");
                      const isAI = item.startsWith("AI Question:");
                      return (
                        <div
                          key={index}
                          className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
                            isUser
                              ? "ml-auto max-w-[85%] bg-blue-600/20 border border-blue-400/20"
                              : isAI
                              ? "max-w-[85%] bg-white/5 border border-white/10"
                              : "max-w-[85%] bg-emerald-500/10 border border-emerald-400/20"
                          }`}
                        >
                          {item}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}