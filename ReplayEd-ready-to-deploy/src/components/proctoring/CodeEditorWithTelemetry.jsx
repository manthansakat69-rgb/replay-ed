import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext';

export default function CodeEditorWithTelemetry({
  value,
  onChange,
  language = 'javascript',
  onPasteBlocked,
  onKeyDownLog,
  onModelContentChange,
  readOnly = false,
}) {
  const { monacoTheme } = useTheme();
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [monacoAvailable, setMonacoAvailable] = useState(true);

  // Handle Monaco mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // 1. Monaco Keybinding Overrides to intercept paste commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      if (onPasteBlocked) {
        onPasteBlocked({ preventDefault: () => {} }, 50);
      }
    });

    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, () => {
      if (onPasteBlocked) {
        onPasteBlocked({ preventDefault: () => {} }, 50);
      }
    });

    // 2. Keystroke and deletion telemetry recording for replay
    editor.onDidChangeModelContent((event) => {
      const changes = event.changes || [];
      for (const ch of changes) {
        if (ch.text === '' && ch.rangeLength > 0) {
          // Deletion event
          if (onKeyDownLog) {
            onKeyDownLog({
              key: 'Delete',
              type: 'delete',
              range: ch.range,
              rangeLength: ch.rangeLength,
            });
          }
        } else if (ch.text) {
          // Insertion / keystroke event
          if (onKeyDownLog) {
            onKeyDownLog({
              key: ch.text.length === 1 ? ch.text : 'Input',
              type: 'key',
              text: ch.text,
              range: ch.range,
            });
          }
        }
      }

      if (onModelContentChange) {
        onModelContentChange(editor.getValue());
      }
    });
  };

  // 3. Capture-phase DOM listener on editor container for clipboard paste, drop, contextmenu
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleDomPaste = (e) => {
      e.preventDefault();
      e.stopPropagation();
      let count = 0;
      if (e.clipboardData) {
        count = (e.clipboardData.getData('text') || '').length;
      }
      if (onPasteBlocked) {
        onPasteBlocked(e, count);
      }
    };

    const handleDomDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      let count = 0;
      if (e.dataTransfer) {
        count = (e.dataTransfer.getData('text') || '').length;
      }
      if (onPasteBlocked) {
        onPasteBlocked(e, count);
      }
    };

    const handleContextMenu = (e) => {
      // Don't disable entire right-click menu, but suppress paste action
    };

    el.addEventListener('paste', handleDomPaste, true);
    el.addEventListener('drop', handleDomDrop, true);
    el.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      el.removeEventListener('paste', handleDomPaste, true);
      el.removeEventListener('drop', handleDomDrop, true);
      el.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [onPasteBlocked]);

  // Fallback textarea change handler
  const handleTextareaChange = (e) => {
    const newVal = e.target.value;
    onChange(newVal);

    if (newVal.length < (value || '').length) {
      if (onKeyDownLog) onKeyDownLog({ key: 'Backspace', type: 'delete' });
    } else {
      const addedChar = newVal.slice(-1);
      if (onKeyDownLog) onKeyDownLog({ key: addedChar, type: 'key', text: addedChar });
    }
  };

  const handleTextareaKeyDown = (e) => {
    const isPaste =
      ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) ||
      (e.shiftKey && e.key === 'Insert');

    if (isPaste) {
      e.preventDefault();
      if (onPasteBlocked) onPasteBlocked(e, 50);
      return false;
    }

    // Normal typing, Backspace, Tab indentation, Enter auto-indent, or Ctrl+Z are NOT blocked
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const updated = value.substring(0, start) + '  ' + value.substring(end);
      onChange(updated);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
      if (onKeyDownLog) onKeyDownLog({ key: 'Tab', type: 'key', text: '  ' });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[380px] flex flex-col font-mono text-xs">
      {monacoAvailable ? (
        <Editor
          height="100%"
          minHeight="380px"
          language={language === 'python' ? 'python' : 'javascript'}
          value={value}
          theme={monacoTheme}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full p-8 text-zinc-500 font-sans text-xs">
              Loading Monaco Editor...
            </div>
          }
          options={{
            readOnly,
            fontSize: 13,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            cursorBlinking: 'smooth',
            lineDecorationsWidth: 8,
            renderLineHighlight: 'all',
          }}
        />
      ) : (
        <textarea
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleTextareaKeyDown}
          onPaste={(e) => {
            e.preventDefault();
            if (onPasteBlocked) onPasteBlocked(e);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (onPasteBlocked) onPasteBlocked(e);
          }}
          readOnly={readOnly}
          spellCheck="false"
          className="w-full flex-1 p-4 bg-transparent resize-none focus:outline-none leading-relaxed font-mono text-xs"
          rows={18}
        />
      )}
    </div>
  );
}
