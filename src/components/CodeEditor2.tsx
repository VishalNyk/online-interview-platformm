"use client";

import { useTheme } from "next-themes";
import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import axios from "axios";

export function CodeEditor2() {
  const { theme } = useTheme();
  const {
    questions,
    selectedQuestion,
    setSelectedQuestion,
    language,
    setLanguage,
    codeSnippets,
    setCodeSnippets,
  } = useGlobalState();

  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCode = (questionId: number, lang: string) => {
    return codeSnippets[questionId]?.[lang] || "";
  };

  const handleCodeChange = (value: string | undefined) => {
    if (!selectedQuestion || value === undefined) return;
    setCodeSnippets((prev: { [x: string]: any; }) => ({
      ...prev,
      [selectedQuestion.id]: {
        ...prev[selectedQuestion.id],
        [language]: value,
      },
    }));
  };

  const runCode = async () => {
    setIsLoading(true);
    setOutput(null);

    const languageMap: Record<string, number> = {
      javascript: 63,
      python: 71,
      java: 62,
    };

    const encodedCode = btoa(getCode(selectedQuestion.id, language));

    try {
      const response = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        {
          source_code: encodedCode,
          language_id: languageMap[language],
          stdin: selectedQuestion.examples[0]?.input || "",
        },
        {
          headers: {
            "content-type": "application/json",
            "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY_HERE",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const token = response.data.token;

      const getResult = async () => {
        const resultRes = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
          {
            headers: {
              "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY_HERE",
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
        );

        if (resultRes.data.status.id <= 2) {
          setTimeout(getResult, 1000);
        } else {
          setOutput(atob(resultRes.data.stdout || resultRes.data.stderr || "No Output"));
          setIsLoading(false);
        }
      };

      getResult();
    } catch (err) {
      console.error("Execution failed", err);
      setOutput("Error while submitting code.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && !selectedQuestion) {
      setSelectedQuestion(questions[0]);
    }
  }, [questions, selectedQuestion, setSelectedQuestion]);

  if (!selectedQuestion) return <div className="text-white p-4">No question selected</div>;

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={50}>
        <Card className="p-4 h-full overflow-y-auto bg-neutral-900 border-none rounded-none">
          <ScrollArea className="h-full text-white">
            <h2 className="text-xl font-semibold mb-2">{selectedQuestion.title}</h2>
            <p className="mb-4 text-sm text-gray-300 whitespace-pre-wrap">{selectedQuestion.description}</p>

            <div className="mb-4">
              <h3 className="font-medium text-white">Examples:</h3>
              {selectedQuestion.examples.map((example: { input: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; output: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }, index: Key | null | undefined) => (
                <div key={index} className="bg-neutral-800 p-3 rounded my-2 text-sm">
                  <strong>Input:</strong> <pre className="text-gray-300">{example.input}</pre>
                  <strong>Expected Output:</strong> <pre className="text-gray-300">{example.output}</pre>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={50}>
        <div className="relative h-full">
          <Editor
            height="100%"
            theme={theme === "dark" ? "vs-dark" : "light"}
            language={language}
            value={getCode(selectedQuestion.id, language)}
            onChange={handleCodeChange}
            className="rounded-none"
          />

          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={runCode}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
            >
              {isLoading ? "Running..." : "Run Code"}
            </button>
          </div>

          {output && (
            <div className="absolute bottom-4 left-4 right-4 bg-black text-white p-4 rounded-md max-h-[200px] overflow-y-auto text-sm shadow-lg">
              <pre>{output}</pre>
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}




function useGlobalState(): { questions: any; selectedQuestion: any; setSelectedQuestion: any; language: any; setLanguage: any; codeSnippets: any; setCodeSnippets: any; } {
    throw new Error("Function not implemented.");
}

