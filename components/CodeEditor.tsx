"use client";

import Editor from "@monaco-editor/react";

export default function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="h-[520px]">
      <Editor
        height="100%"
        defaultLanguage="sol"
        value={value}
        onChange={(val) => onChange(val || "")}
        theme="vs-dark"
        options={{ fontSize: 14, minimap: { enabled: false } }}
      />
    </div>
  );
}
