import React, { useState } from "react";
import Editor from "@monaco-editor/react";

const CodeEditorWithJudge0 = () => {
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [languageId, setLanguageId] = useState(63); // JavaScript by default

  const handleRun = async () => {
    console.log("Running code...");
    setOutput("Running...");

    try {
      const response = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            "x-rapidapi-key": "a82faee4d0msh88588181acd3267p11b2f7jsn8ff896afe188",
          },
          body: JSON.stringify({
            source_code: code,
            language_id: languageId,
            stdin: "",
          }),
        }
      );

      const result = await response.json();
      console.log("Full Response:", result);

      if (result.stdout) {
        setOutput(result.stdout);
      } else if (result.stderr) {
        setOutput(result.stderr);
      } else if (result.compile_output) {
        setOutput(result.compile_output);
      } else {
        setOutput("Unknown error occurred.");
      }
    } catch (err) {
      console.error("Error:", err);
      setOutput("Failed to run code. Please check your API key and network.");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-2">
        <select
          className="p-2 border rounded"
          value={languageId}
          onChange={(e) => setLanguageId(Number(e.target.value))}
        >
          <option value={63}>JavaScript</option>
          <option value={62}>Java</option>
          <option value={71}>Python</option>
        </select>
      </div>

      <Editor
        height="400px"
        defaultLanguage="javascript"
        language={
          languageId === 63 ? "javascript" :
          languageId === 62 ? "java" :
          languageId === 71 ? "python" : "plaintext"
        }
        value={code}
        onChange={(value) => setCode(value || "")}
        theme="vs-dark"
      />

      <button
        onClick={handleRun}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Run Code
      </button>

      <div className="mt-4 p-2 bg-gray-100 rounded text-sm whitespace-pre-wrap">
        <strong>Output:</strong>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditorWithJudge0;
