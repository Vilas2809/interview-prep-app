"use client";

import { useState } from "react";
import {
  Briefcase,
  Building2,
  ChevronDown,
  History,
  MessageSquare,
  Mic,
  RefreshCcw,
  Send,
  Sparkles,
} from "lucide-react";

const companies = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix"];
const roles = ["Software Engineer", "Software Developer", "AI Engineer", "Network Engineer"];
const interviewTypes = ["Technical", "Behavioral", "HR", "System Design"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior Level"];

export default function Home() {
  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Engineer");
  const [interviewType, setInterviewType] = useState("Technical");
  const [experience, setExperience] = useState("Entry Level");
  const [answer, setAnswer] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(
    `Suppose you are working on a Google Maps application. You are given a simple navigation system with two features: "Shortest Path" and "Optimized Route". The "Shortest Path" feature returns the shortest distance between two points on the map, and the "Optimized Route" feature provides the most efficient route considering factors like traffic and road closures. Write a function to calculate and return the optimized route between two points on the Google Maps application, given their latitude and longitude coordinates.`
  );

  const [history, setHistory] = useState<string[]>([
    `AI Question: Suppose you are working on a Google Maps application. You are given a simple navigation system with two features: "Shortest Path" and "Optimized Route". The "Shortest Path" feature returns the shortest distance between two points on the map, and the "Optimized Route" feature provides the most efficient route considering factors like traffic and road closures. Write a function to calculate and return the optimized route between two points on the Google Maps application, given their latitude and longitude coordinates.`,
  ]);

  const startInterview = () => {
    const newQuestion = `Tell me about a time you solved a challenging problem as a ${role} candidate for ${company}.`;
    setCurrentQuestion(newQuestion);
    setHistory((prev) => [`AI Question: ${newQuestion}`, ...prev]);
    setAnswer("");
  };

  const submitAnswer = () => {
    if (!answer.trim()) return;

    const record = `You: ${answer}`;
    setHistory((prev) => [record, ...prev]);
    setAnswer("");
  };

  const skipQuestion = () => {
    const newQuestion = `Explain how you would approach a real-world ${interviewType.toLowerCase()} interview question for a ${role} role at ${company}.`;
    setCurrentQuestion(newQuestion);
    setHistory((prev) => [`AI Question: ${newQuestion}`, ...prev]);
    setAnswer("");
  };

  const resetInterview = () => {
    setCompany("Google");
    setRole("Software Engineer");
    setInterviewType("Technical");
    setExperience("Entry Level");
    setAnswer("");
    setCurrentQuestion(
      `Suppose you are working on a Google Maps application. You are given a simple navigation system with two features: "Shortest Path" and "Optimized Route". The "Shortest Path" feature returns the shortest distance between two points on the map, and the "Optimized Route" feature provides the most efficient route considering factors like traffic and road closures. Write a function to calculate and return the optimized route between two points on the Google Maps application, given their latitude and longitude coordinates.`
    );
    setHistory([
      `AI Question: Suppose you are working on a Google Maps application. You are given a simple navigation system with two features: "Shortest Path" and "Optimized Route". The "Shortest Path" feature returns the shortest distance between two points on the map, and the "Optimized Route" feature provides the most efficient route considering factors like traffic and road closures. Write a function to calculate and return the optimized route between two points on the Google Maps application, given their latitude and longitude coordinates.`,
    ]);
  };

  return (
    <main className="min-h-screen bg-[#0a0f1c] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 p-4 md:p-6">
        {/* LEFT SIDEBAR */}
        <aside className="hidden w-[320px] shrink-0 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Mock Interview AI</h1>
              <p className="text-sm text-gray-400">AI-powered interview workspace</p>
            </div>
          </div>

          <div className="space-y-4">
            <SelectField
              label="Company"
              icon={<Building2 className="h-4 w-4" />}
              value={company}
              onChange={setCompany}
              options={companies}
            />

            <SelectField
              label="Role"
              icon={<Briefcase className="h-4 w-4" />}
              value={role}
              onChange={setRole}
              options={roles}
            />

            <SelectField
              label="Interview Type"
              icon={<MessageSquare className="h-4 w-4" />}
              value={interviewType}
              onChange={setInterviewType}
              options={interviewTypes}
            />

            <SelectField
              label="Experience Level"
              icon={<Sparkles className="h-4 w-4" />}
              value={experience}
              onChange={setExperience}
              options={experienceLevels}
            />
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={startInterview}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Start Mock Interview
            </button>

            <button
              onClick={resetInterview}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-200 transition hover:bg-white/10"
            >
              Reset Interview
            </button>
          </div>

          <div className="mt-auto rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-gray-300">
              Practice technical, behavioral, and role-based interview questions with a cleaner,
              more premium AI experience.
            </p>
          </div>
        </aside>

        {/* MOBILE TOP BAR */}
        <div className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#0a0f1c]/80 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold">Mock Interview AI</h1>
              <p className="text-xs text-gray-400">AI interview workspace</p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <section className="flex min-h-[90vh] flex-1 flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-4 shadow-2xl backdrop-blur-xl md:p-6 lg:ml-0 mt-16 lg:mt-0">
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Interview Workspace
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {company} • {role} • {interviewType} • {experience}
              </p>
            </div>

            <button
              onClick={resetInterview}
              className="inline-flex items-center gap-2 self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/10"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          {/* CURRENT QUESTION */}
          <div className="mb-5 rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5">
            <div className="mb-3 flex items-center gap-2 text-blue-300">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-[0.16em]">
                Current Question
              </span>
            </div>
            <p className="text-base leading-8 text-gray-100">{currentQuestion}</p>
          </div>

          {/* ANSWER BOX */}
          <div className="mb-5 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Response</h3>
              <button className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 transition hover:bg-blue-500/20">
                <Mic className="h-4 w-4" />
                Speak Answer
              </button>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[220px] w-full resize-none rounded-2xl border border-white/10 bg-[#0d1324] p-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={submitAnswer}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium transition hover:bg-emerald-500"
              >
                <Send className="h-4 w-4" />
                Submit Answer
              </button>

              <button
                onClick={skipQuestion}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-gray-200 transition hover:bg-white/10"
              >
                Skip Question
              </button>
            </div>
          </div>

          {/* HISTORY */}
          <div className="flex-1 rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-gray-300" />
              <h3 className="text-lg font-medium">Interview History</h3>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
              {history.map((item, index) => {
                const isAI = item.startsWith("AI Question:");
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border p-4 text-sm leading-7 ${
                      isAI
                        ? "border-blue-500/20 bg-blue-500/10 text-gray-100"
                        : "border-emerald-500/20 bg-emerald-500/10 text-gray-100"
                    }`}
                  >
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type SelectFieldProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

function SelectField({ label, icon, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-[#0d1324] pl-11 pr-10 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#0d1324]">
              {option}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}