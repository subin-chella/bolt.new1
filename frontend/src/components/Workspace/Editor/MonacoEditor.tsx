import React from 'react';
import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
  content: string;
  language: string;
  onChange: (value: string | undefined) => void;
}

export default function MonacoEditor({ content, language, onChange }: MonacoEditorProps) {
  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      defaultValue={content}
      theme="vs-dark"
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}