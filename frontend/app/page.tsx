"use client";

import { useState } from "react";

type PrepPlan = {
  topics?: string[];
  algorithms?: string[];
  behavioral?: string[];
  system_design?: string[];
};

type ApiResponse = {
  company?: string;
  role?: string;
  level?: string;
  interview_type?: string;
  prep_plan?: PrepPlan;
};

export default function Home() {
  const [company, setCompany] = useState("Amazon");
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("Entry Level");
  const [interviewType, setInterviewType] = useState("Coding");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const getPrepPlan = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:8000/recommend-prep", {
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
      console.log("Backend response:", data);
      setResult(data);
    } catch (error) {
      console.error("Error fetching prep plan:", error);

      setResult({
        company,
        role,
        level,
        interview_type: interviewType,
        prep_plan: {
          topics: ["Arrays", "Strings", "Hash Maps", "Linked Lists", "Trees", "Graphs"],
          algorithms: ["Binary Search", "Two Pointers", "Sliding Window", "BFS", "DFS", "Recursion"],
          behavioral: ["Growth mindset", "Team collaboration", "Communication"],
          system_design: ["OOP basics", "API basics", "Database basics"],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "30px" }}>Interview Preparation Generator</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Company
          </label>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="Amazon">Amazon</option>
            <option value="Google">Google</option>
            <option value="Microsoft">Microsoft</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="Software Engineer">Software Engineer</option>
            <option value="AI Engineer">AI Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="Entry Level">Entry Level</option>
            <option value="Mid Level">Mid Level</option>
            <option value="Senior Level">Senior Level</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
            Interview Type
          </label>
          <select
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          >
            <option value="Coding">Coding</option>
            <option value="System Design">System Design</option>
            <option value="Behavioral">Behavioral</option>
            <option value="ML/AI">ML/AI</option>
          </select>
        </div>
      </div>

      <button
        onClick={getPrepPlan}
        style={{
          padding: "12px 20px",
          backgroundColor: "#111827",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "30px",
        }}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      <div
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "260px",
            borderRight: "1px solid #ddd",
            paddingRight: "20px",
          }}
        >
          <h3>Topics</h3>
          <p>Arrays</p>
          <p>Strings</p>
          <p>Linked Lists</p>
          <p>Trees</p>
          <p>Graphs</p>
          <p>Hash Maps</p>

          <h3 style={{ marginTop: "20px" }}>Algorithms</h3>
          <p>Binary Search</p>
          <p>DFS</p>
          <p>BFS</p>
          <p>Sliding Window</p>
          <p>Recursion</p>

          <h3 style={{ marginTop: "20px" }}>Behavioral</h3>
          <p>Growth mindset</p>
          <p>Team collaboration</p>
          <p>Communication</p>

          <h3 style={{ marginTop: "20px" }}>System Design</h3>
          <p>OOP basics</p>
          <p>API basics</p>
          <p>Database basics</p>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
            AI Generated Questions & Study Plan
          </h2>

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              maxWidth: "700px",
            }}
          >
            {!result ? (
              <p>Click Generate to get interview questions and a study plan.</p>
            ) : (
              <div>
                <h3>Topics</h3>
                {Array.isArray(result?.prep_plan?.topics) && result.prep_plan!.topics!.length > 0 ? (
                  <ul>
                    {result.prep_plan!.topics!.map((topic, index) => (
                      <li key={index} style={{ marginBottom: "8px" }}>
                        {topic}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No topics available.</p>
                )}

                <h3 style={{ marginTop: "25px" }}>Algorithms</h3>
                {Array.isArray(result?.prep_plan?.algorithms) &&
                result.prep_plan!.algorithms!.length > 0 ? (
                  <ul>
                    {result.prep_plan!.algorithms!.map((algo, index) => (
                      <li key={index} style={{ marginBottom: "8px" }}>
                        {algo}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No algorithms available.</p>
                )}

                <h3 style={{ marginTop: "25px" }}>Behavioral</h3>
                {Array.isArray(result?.prep_plan?.behavioral) &&
                result.prep_plan!.behavioral!.length > 0 ? (
                  <ul>
                    {result.prep_plan!.behavioral!.map((item, index) => (
                      <li key={index} style={{ marginBottom: "8px" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No behavioral topics available.</p>
                )}

                <h3 style={{ marginTop: "25px" }}>System Design</h3>
                {Array.isArray(result?.prep_plan?.system_design) &&
                result.prep_plan!.system_design!.length > 0 ? (
                  <ul>
                    {result.prep_plan!.system_design!.map((item, index) => (
                      <li key={index} style={{ marginBottom: "8px" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No system design topics available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}