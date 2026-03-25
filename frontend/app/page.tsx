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
        setError("Failed to load dropdown data.");
      }
    };

    loadDropdownData();
  }, [API_URL]);

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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
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
    <main className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#121a33] to-[#0f172a] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-2 rounded-full border border-blue-400/30 bg-blue-500/10 text-sm font-medium mb-4">
            AI-Powered Mock Interview
          </span>
          <h1 className="text-5xl font-extrabold mb-4">Mock Interview AI</h1>
          <p className="text-lg text-gray-300">
            Practice with realistic interview questions, voice input, feedback,
            scoring, and smarter question progression.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 mb-6">
          <h2 className="text-3xl font-bold mb-2">Interview Setup</h2>
          <p className="text-gray-300 mb-6">
            Pick your target company, role, interview style, and experience level.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 font-semibold">Company</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl bg-[#111827] border border-white/10 px-4 py-3"
              >
                {companies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl bg-[#111827] border border-white/10 px-4 py-3"
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Interview Type</label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full rounded-xl bg-[#111827] border border-white/10 px-4 py-3"
              >
                {interviewTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-xl bg-[#111827] border border-white/10 px-4 py-3"
              >
                {experienceLevels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={startInterview}
              disabled={loading}
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-5 py-3 font-semibold"
            >
              {loading && !started ? "Loading..." : "Start Mock Interview"}
            </button>

            <button
              onClick={resetInterview}
              className="rounded-xl bg-gray-700 hover:bg-gray-800 px-5 py-3 font-semibold"
            >
              Reset Interview
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
              {error}
            </div>
          )}
        </div>

        {started && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-blue-300 font-semibold mb-2">
                CURRENT QUESTION
              </p>
              <h3 className="text-3xl font-bold mb-3">Answer this question</h3>
              <p className="text-lg text-gray-200">{currentQuestion}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Your Response</h3>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 font-semibold"
                >
                  {isListening ? "Stop Listening" : "Speak Answer"}
                </button>
              </div>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Speak with the mic or type your answer here..."
                rows={6}
                className="w-full rounded-xl bg-[#111827] border border-white/10 px-4 py-3 text-white"
              />

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={submitAnswer}
                  disabled={loading}
                  className="rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 px-5 py-3 font-semibold"
                >
                  {loading ? "Submitting..." : "Submit Answer"}
                </button>

                <button
                  onClick={skipQuestion}
                  disabled={loading}
                  className="rounded-xl bg-yellow-600 hover:bg-yellow-700 disabled:opacity-60 px-5 py-3 font-semibold"
                >
                  {loading ? "Loading..." : "Skip Question"}
                </button>
              </div>
            </div>

            {score && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <h3 className="text-2xl font-bold">Interview Feedback</h3>

                <p>
                  <span className="font-semibold text-blue-300">Score:</span>{" "}
                  {score}
                </p>

                <p>
                  <span className="font-semibold text-blue-300">Feedback:</span>{" "}
                  {feedback}
                </p>

                <div>
                  <p className="font-semibold text-blue-300">Better Answer:</p>
                  <p className="mt-1 text-gray-200 whitespace-pre-line">
                    {betterAnswer}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-blue-300">Next Question:</p>
                  <p className="mt-1 text-gray-200 whitespace-pre-line">
                    {nextQuestion}
                  </p>
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-2xl font-bold mb-4">Interview History</h3>
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-[#111827] border border-white/10 px-4 py-3 text-gray-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}