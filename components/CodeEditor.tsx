"use client";

import React from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  code,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-gray-700/50">
      <Editor
        height="100%"
        defaultLanguage="python"
        value={code}
        onChange={(val) => onChange(val || "")}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily:
            "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          readOnly,
          lineNumbers: "on",
          renderLineHighlight: "gutter",
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          wordWrap: "on",
          tabSize: 4,
          insertSpaces: true,
          bracketPairColorization: { enabled: true },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
        }}
      />
    </div>
  );
}
