"use client";

import { useState, useRef } from "react";
import {
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  Edit3,
} from "lucide-react";
import MarkdownRenderer from "./markdown-renderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Briefly describe your idea and what problem it solves",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateValue = (newVal: string) => {
    onChange(newVal);
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(newVal);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange(history[newIndex]);
    }
  };

  const insertTextAtCursor = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = prefix + (selectedText || "text") + suffix;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    updateValue(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : 4)
      );
    }, 0);
  };

  return (
    <div className="w-full bg-white border-[3px] border-black rounded-[24px] overflow-hidden shadow-[4px_4px_0px_0px_#000000] focus-within:shadow-[6px_6px_0px_0px_#000000] transition-all">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b-2 border-black/10 bg-gray-50/50">
        <div className="flex flex-wrap items-center gap-1.5 md:gap-3">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-700 disabled:opacity-30 transition-colors"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-gray-300 mx-1" />

          {/* Heading Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                insertTextAtCursor(e.target.value + " ", "\n");
                e.target.value = "";
              }
            }}
            defaultValue=""
            className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer hover:text-[#EE2B69] py-1 px-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>
              Heading ▾
            </option>
            <option value="# ">Heading 1</option>
            <option value="## ">Heading 2</option>
            <option value="### ">Heading 3</option>
          </select>

          <div className="h-5 w-[1px] bg-gray-300 mx-1" />

          {/* Bold, Italic, Underline */}
          <button
            type="button"
            onClick={() => insertTextAtCursor("**", "**")}
            className="p-1.5 font-extrabold text-sm rounded-lg hover:bg-gray-200 text-gray-800 transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTextAtCursor("*", "*")}
            className="p-1.5 italic font-bold text-sm rounded-lg hover:bg-gray-200 text-gray-800 transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTextAtCursor("<u>", "</u>")}
            className="p-1.5 font-bold text-sm rounded-lg hover:bg-gray-200 text-gray-800 transition-colors"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-gray-300 mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={() => insertTextAtCursor("\n- ", "")}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-800 transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTextAtCursor("\n1. ", "")}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-800 transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTextAtCursor("\n> ", "")}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-800 transition-colors"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-gray-300 mx-1" />

          {/* Image & Link */}
          <button
            type="button"
            onClick={() => insertTextAtCursor("![Image Alt](", ")")}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-800 transition-colors"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTextAtCursor("[Link Text](", ")")}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-800 transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Preview / Edit Toggle */}
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-bold rounded-full hover:bg-[#EE2B69] transition-colors cursor-pointer"
        >
          {isPreview ? (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="p-4 md:p-6 min-h-[220px]">
        {isPreview ? (
          <div className="min-h-[180px] p-2">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-gray-400 italic text-sm">Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => updateValue(e.target.value)}
            placeholder={placeholder}
            rows={8}
            className="w-full bg-transparent font-medium text-sm md:text-base text-black placeholder:text-gray-400 outline-none resize-y leading-relaxed"
          />
        )}
      </div>
    </div>
  );
}
