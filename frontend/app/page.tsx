"use client";

import { useState, useEffect } from "react";

type Recommendation = {
  topics: string[];
  focus_areas: string[];
  practice_questions: string[];
  study_plan: string[];
};

export default function Home() {
  const [company, setCompany] = useState("Amazon");
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("Entry Level");
  const [interviewType, setInterviewType] = useState("Coding");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const savedCompany = localStorage.getItem("company");
    const savedRole = localStorage.getItem("role");
    const savedLevel = localStorage.getItem("level");
    const savedInterviewType = localStorage.getItem("interviewType");

    if (savedCompany) setCompany(savedCompany);
    if (savedRole) setRole(savedRole);
    if (savedLevel) setLevel(savedLevel);
    if (savedInterviewType) setInterviewType(savedInterviewType);
  }, []);

  useEffect(() => {
    localStorage.setItem("company", company);
  }, [company]);

  useEffect(() => {
    localStorage.setItem("role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("level", level);
  }, [level]);

  useEffect(() => {
    localStorage.setItem("interviewType", interviewType);
  }, [interviewType]);

  const getPrepPlan = async () => {
    const response = await fetch("http://127.0.0.1:8000/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company,
        role,
        level,
        interview_type: interviewType,
      }),
    });

    const data = await response.json();
    setResult(data);
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Interview Preparation Generator</h1>

      <div>
        <label>Company</label>
        <select value={company} onChange={(e) => setCompany(e.target.value)}>
          <option>Amazon</option>
          <option>Google</option>
          <option>Microsoft</option>
        </select>
      </div>

      <div>
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Software Engineer">Software Engineer</option>
          <option value="AI Engineer">AI Engineer</option>
          <option value="Data Scientist">Data Scientist</option>
        </select>
      </div>

      <div>
        <label>Level</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="Entry Level">Entry Level</option>
          <option value="Mid Level">Mid Level</option>
          <option value="Senior Level">Senior Level</option>
        </select>
      </div>

      <div>
        <label>Interview Type</label>
        <select
          value={interviewType}
          onChange={(e) => setInterviewType(e.target.value)}
        >
          <option value="Coding">Coding</option>
          <option value="System Design">System Design</option>
          <option value="Behavioral">Behavioral</option>
          <option value="ML/AI">ML/AI</option>
        </select>
      </div>

      <br />

      <button onClick={getPrepPlan}>Generate Prep Plan</button>
      {result && (
        <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", maxWidth: "200px"}}>
          <h2 style={{fontWeight: "bold", textDecoration: "underline"}}>Topics</h2>
          <ul>
            {result?.prep_plan?.topics?.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>

          <h2 style={{fontWeight: "bold", textDecoration: "underline"}}>Algorithms</h2>
          <ul>
            {result?.prep_plan?.algorithms?.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>

          <h2 style={{fontWeight: "bold", textDecoration: "underline"}}>Behavioral</h2>
          <ul>
            {result?.prep_plan?.behavioral?.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>

          <h2 style={{fontWeight: "bold", textDecoration: "underline"}}>System Design</h2>
          <ul>
            {result?.prep_plan?.system_design?.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          <h2 style={{ fontWeight: "bold", textDecoration: "underline", marginTop: "20px" }}>
            AI Generated Questions & Study Plan
          </h2>

          <div
            style={{
              marginTop: "30px",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              maxWidth: "900px",
              width: "100%",
            }}
          >
            {result?.ai_generated || "AI output will appear here once OpenAI billing is active."}
          </div>
        </div>
      )}
    </main>
  );
}