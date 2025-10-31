"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

const FONT_SIZE_KEY = "code-editor-font-size";

export default function CodeEditor({ value, onChange, language = "sol", height = 680 }: { value: string; onChange: (v: string) => void; language?: string; height?: number }) {
  const editorRef = useRef<any>(null);
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(FONT_SIZE_KEY);
      return saved ? parseInt(saved, 10) : 17;
    }
    return 17;
  });

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // Ensure editor updates when value changes externally (e.g., from AI fix)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Update font size in editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  const decreaseFont = () => {
    setFontSize((prev) => {
      const newSize = Math.max(8, prev - 1);
      localStorage.setItem(FONT_SIZE_KEY, newSize.toString());
      return newSize;
    });
  };

  const increaseFont = () => {
    setFontSize((prev) => {
      const newSize = Math.min(24, prev + 1);
      localStorage.setItem(FONT_SIZE_KEY, newSize.toString());
      return newSize;
    });
  };

  return (
    <div className="rounded-md relative" style={{ height }}>
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-md px-2 py-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={decreaseFont}
          className="h-6 w-6 p-0"
          title="Decrease font size"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="text-xs font-mono w-8 text-center">{fontSize}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={increaseFont}
          className="h-6 w-6 p-0"
          title="Increase font size"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={(val) => onChange(val || "")}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{ 
          fontSize, 
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
