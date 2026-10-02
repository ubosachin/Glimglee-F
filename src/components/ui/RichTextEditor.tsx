"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading3,
  Heading2,
  Quote,
  Minus,
  RemoveFormatting,
  Sparkles,
  Code,
  Eye,
  PenLine,
  Undo,
  Redo,
  Palette,
  ChevronDown,
  CheckCircle2,
  ListPlus,
} from "lucide-react";
import { formatDescriptionHtml, isHtmlContent } from "@/lib/utils/text";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value = "",
  onChange,
  label = "Product Description",
  placeholder = "Write detailed description, features, bullet points, care instructions...",
  minHeight = "180px",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"visual" | "html" | "preview">("visual");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value with contentEditable
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const currentHtml = editorRef.current.innerHTML;
      const normalizedValue = value ? formatDescriptionHtml(value) : "";
      if (currentHtml !== normalizedValue) {
        editorRef.current.innerHTML = normalizedValue;
      }
    }
    isInternalChange.current = false;
  }, [value, activeTab]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      const html = editorRef.current.innerHTML;
      // If editor contains only empty tags, treat as empty
      if (html === "<p><br></p>" || html === "<br>" || html.trim() === "") {
        onChange("");
      } else {
        onChange(html);
      }
    }
  }, [onChange]);

  // Tab switcher that maintains DOM sync
  const switchTab = (tab: "visual" | "html" | "preview") => {
    if (tab === "visual" && editorRef.current) {
      const normalized = value ? formatDescriptionHtml(value) : "";
      editorRef.current.innerHTML = normalized;
    }
    setActiveTab(tab);
  };

  // Execute standard formatting commands
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (activeTab !== "visual") {
      switchTab("visual");
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand(command, false, arg);
          handleInput();
        }
      }, 50);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, arg);
      handleInput();
    }
  };

  // Insert custom HTML fragment at current selection or end
  const insertHtmlFragment = (htmlFragment: string) => {
    if (activeTab !== "visual") {
      onChange((value || "") + "\n" + htmlFragment);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement("div");
        el.innerHTML = htmlFragment;
        const frag = document.createDocumentFragment();
        let node;
        let lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          const newRange = range.cloneRange();
          newRange.setStartAfter(lastNode);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        // Fallback append
        editorRef.current.innerHTML += htmlFragment;
      }
      handleInput();
    }
  };

  // Apply highlight / badge tag to selected text
  const applyHighlight = (className: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const text = selection.toString();
        insertHtmlFragment(`<span class="${className}">${text}</span>`);
      } else {
        insertHtmlFragment(`<span class="${className}">Highlight</span>&nbsp;`);
      }
    }
    setShowHighlights(false);
  };

  // Auto-format existing unformatted text into bullet points
  const autoFormatIntoPoints = () => {
    if (!value || !value.trim()) return;
    const cleanText = value
      .replace(/<[^>]+>/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (cleanText.length > 0) {
      const bulletListHtml = `<ul>${cleanText.map((item) => `<li>${item}</li>`).join("")}</ul>`;
      onChange(bulletListHtml);
      if (editorRef.current) {
        editorRef.current.innerHTML = bulletListHtml;
      }
    }
    setShowTemplates(false);
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        executeCommand("bold");
      } else if (e.key === "i" || e.key === "I") {
        e.preventDefault();
        executeCommand("italic");
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        executeCommand("underline");
      }
    }
  };

  // Calculate stats
  const plainText = (value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(" ").length : 0;
  const charCount = plainText.length;
  const hasExistingContent = Boolean(value && value.trim().length > 0);

  return (
    <div className="w-full space-y-1.5">
      {/* Top Header Label, Badges & Mode Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="block text-xs font-bold text-stone-700 tracking-wide uppercase">
            {label}
          </label>
          {hasExistingContent ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              Existing Content Loaded
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
              Rich Formatter
            </span>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs font-medium border border-stone-200/80">
          <button
            type="button"
            onClick={() => switchTab("visual")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeTab === "visual"
                ? "bg-white text-stone-900 shadow-xs font-bold"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <PenLine className="w-3.5 h-3.5 text-rose-600" />
            <span>Visual</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab("html")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeTab === "html"
                ? "bg-white text-stone-900 shadow-xs font-bold"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Code className="w-3.5 h-3.5 text-amber-600" />
            <span>HTML Code</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              activeTab === "preview"
                ? "bg-white text-stone-900 shadow-xs font-bold"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Store Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Main Container */}
      <div className="border border-stone-200 rounded-2xl bg-white shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-400 transition-all">
        {/* Toolbar (Only visible in Visual mode) */}
        {activeTab === "visual" && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-stone-50/90 border-b border-stone-200 text-stone-700">
            {/* Bold, Italic, Underline, Strikethrough */}
            <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                title="Bold (Ctrl+B)"
                onClick={() => executeCommand("bold")}
                className="p-1.5 rounded-md hover:bg-stone-100 hover:text-rose-600 transition-colors"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Italic (Ctrl+I)"
                onClick={() => executeCommand("italic")}
                className="p-1.5 rounded-md hover:bg-stone-100 hover:text-rose-600 transition-colors"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Underline (Ctrl+U)"
                onClick={() => executeCommand("underline")}
                className="p-1.5 rounded-md hover:bg-stone-100 hover:text-rose-600 transition-colors"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Strikethrough"
                onClick={() => executeCommand("strikeThrough")}
                className="p-1.5 rounded-md hover:bg-stone-100 hover:text-rose-600 transition-colors"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </div>

            <div className="h-5 w-px bg-stone-200 mx-0.5" />

            {/* Headings */}
            <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                title="Section Heading (H3)"
                onClick={() => executeCommand("formatBlock", "<h3>")}
                className="flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-md hover:bg-stone-100 hover:text-rose-600 transition-colors"
              >
                <Heading3 className="w-4 h-4" />
                <span>Title</span>
              </button>
              <button
                type="button"
                title="Subheading (H4)"
                onClick={() => executeCommand("formatBlock", "<h4>")}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md hover:bg-stone-100 hover:text-rose-600 transition-colors"
              >
                <Heading2 className="w-3.5 h-3.5" />
                <span>Sub</span>
              </button>
              <button
                type="button"
                title="Normal Paragraph"
                onClick={() => executeCommand("formatBlock", "<p>")}
                className="px-2 py-1 text-xs font-medium rounded-md hover:bg-stone-100 transition-colors"
              >
                Body
              </button>
            </div>

            <div className="h-5 w-px bg-stone-200 mx-0.5" />

            {/* Points / Lists - Primary feature */}
            <div className="flex items-center bg-white border border-rose-200 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                title="Bullet Points (Unordered list)"
                onClick={() => executeCommand("insertUnorderedList")}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50/70 hover:bg-rose-100 rounded-md transition-colors"
              >
                <List className="w-4 h-4 text-rose-600" />
                <span>Points</span>
              </button>
              <button
                type="button"
                title="Numbered Points (1. 2. 3.)"
                onClick={() => executeCommand("insertOrderedList")}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
              >
                <ListOrdered className="w-4 h-4 text-stone-600" />
                <span>1. 2. 3.</span>
              </button>
            </div>

            <div className="h-5 w-px bg-stone-200 mx-0.5" />

            {/* Design & Accents */}
            <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                title="Callout Box"
                onClick={() => executeCommand("formatBlock", "<blockquote>")}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold hover:bg-stone-100 rounded-md transition-colors"
              >
                <Quote className="w-3.5 h-3.5 text-stone-600" />
                <span>Callout</span>
              </button>
              <button
                type="button"
                title="Horizontal Divider"
                onClick={() => executeCommand("insertHorizontalRule")}
                className="p-1.5 rounded-md hover:bg-stone-100 hover:text-stone-900 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Highlights Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  title="Badge / Highlight Color"
                  onClick={() => setShowHighlights(!showHighlights)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium hover:bg-stone-100 rounded-md transition-colors"
                >
                  <Palette className="w-3.5 h-3.5 text-rose-500" />
                  <span>Color</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {showHighlights && (
                  <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-stone-200 rounded-xl shadow-lg p-1.5 z-20 space-y-1">
                    <button
                      type="button"
                      onClick={() => applyHighlight("hl-rose")}
                      className="w-full text-left px-2 py-1 text-xs rounded-md bg-rose-50 text-rose-800 font-semibold hover:bg-rose-100 flex items-center justify-between"
                    >
                      <span>Rose Pill</span>
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHighlight("hl-amber")}
                      className="w-full text-left px-2 py-1 text-xs rounded-md bg-amber-50 text-amber-800 font-semibold hover:bg-amber-100 flex items-center justify-between"
                    >
                      <span>Gold Accent</span>
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyHighlight("hl-emerald")}
                      className="w-full text-left px-2 py-1 text-xs rounded-md bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100 flex items-center justify-between"
                    >
                      <span>Green Accent</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="h-5 w-px bg-stone-200 mx-0.5" />

            {/* Quick Templates & Conversion Actions */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Presets & Tools</span>
                <ChevronDown className="w-3 h-3 text-amber-500" />
              </button>

              {showTemplates && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-stone-200 rounded-xl shadow-xl p-1.5 z-20 space-y-1">
                  {hasExistingContent && (
                    <>
                      <div className="px-2 py-1 text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                        Upgrade Old Description
                      </div>
                      <button
                        type="button"
                        onClick={autoFormatIntoPoints}
                        className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg bg-rose-50/60 hover:bg-rose-100 text-rose-900 transition-colors flex items-center gap-2"
                      >
                        <ListPlus className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Convert Lines to Points</div>
                          <div className="text-[10px] text-rose-600/80">Turn text into bullet list</div>
                        </div>
                      </button>
                      <div className="h-px bg-stone-100 my-1" />
                    </>
                  )}

                  <div className="px-2 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Quick Templates
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      insertHtmlFragment(
                        `<h3>Key Features</h3><ul><li><strong>Handcrafted Luxury:</strong> Made with premium artisanal materials.</li><li><strong>Signature Packaging:</strong> Comes in a keepsake box with wax seal.</li><li><strong>Express Safe Dispatch:</strong> Multi-layer transit-safe packaging.</li></ul>`
                      );
                      setShowTemplates(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-rose-50 text-stone-700 hover:text-rose-900 transition-colors"
                  >
                    <div className="font-semibold">✨ Key Feature Points</div>
                    <div className="text-[10px] text-stone-400">Bulleted specifications list</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      insertHtmlFragment(
                        `<h3>Specifications & Care</h3><ul><li><strong>Material:</strong> 100% Organic Soy Wax & Pure Cotton Wick</li><li><strong>Burn Time:</strong> Approx 45-50 Hours</li><li><strong>Fragrance Notes:</strong> French Vanilla & Wild Lavender</li></ul>`
                      );
                      setShowTemplates(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-rose-50 text-stone-700 hover:text-rose-900 transition-colors"
                  >
                    <div className="font-semibold">📦 Specs & Materials</div>
                    <div className="text-[10px] text-stone-400">Dimensions, burn time, materials</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      insertHtmlFragment(
                        `<blockquote>Every Glimglee gift arrives nestled in our custom matte keepsake gift box, surrounded by celebratory confetti ribbons, and sealed with an authentic wax stamp.</blockquote>`
                      );
                      setShowTemplates(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-rose-50 text-stone-700 hover:text-rose-900 transition-colors"
                  >
                    <div className="font-semibold">💌 Curator Gifting Note</div>
                    <div className="text-[10px] text-stone-400">Signature boxed callout</div>
                  </button>
                </div>
              )}
            </div>

            {/* Undo / Redo & Clear */}
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                title="Undo"
                onClick={() => executeCommand("undo")}
                className="p-1.5 rounded-md hover:bg-stone-200 text-stone-600 transition-colors"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Redo"
                onClick={() => executeCommand("redo")}
                className="p-1.5 rounded-md hover:bg-stone-200 text-stone-600 transition-colors"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Remove Formatting"
                onClick={() => executeCommand("removeFormat")}
                className="p-1.5 rounded-md hover:bg-stone-200 text-stone-600 transition-colors"
              >
                <RemoveFormatting className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: Visual WYSIWYG Editor (Kept mounted with CSS visibility for state preservation) */}
        <div className={`relative p-3.5 ${activeTab === "visual" ? "block" : "hidden"}`}>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className="prose-glimglee outline-none min-h-[160px] text-stone-800 text-sm focus:outline-none"
            style={{ minHeight }}
            data-placeholder={placeholder}
          />
          {/* Visual Placeholder when empty */}
          {(!value || value.trim() === "" || value === "<p><br></p>") && (
            <div
              onClick={() => editorRef.current?.focus()}
              className="absolute top-3.5 left-3.5 text-stone-400 text-sm pointer-events-none italic select-none"
            >
              {placeholder}
            </div>
          )}
        </div>

        {/* TAB 2: HTML Source Code View */}
        <div className={`p-3 bg-stone-900 text-stone-100 ${activeTab === "html" ? "block" : "hidden"}`}>
          <div className="text-[10px] uppercase font-mono text-stone-400 mb-2 flex items-center justify-between">
            <span>Direct HTML Source Editor</span>
            <span className="text-amber-400">Edits update in real-time</span>
          </div>
          <textarea
            rows={8}
            value={value || ""}
            onChange={(e) => {
              onChange(e.target.value);
              if (editorRef.current) {
                editorRef.current.innerHTML = formatDescriptionHtml(e.target.value);
              }
            }}
            className="w-full bg-transparent font-mono text-xs text-rose-200 leading-relaxed outline-none resize-y"
            style={{ minHeight }}
            placeholder="<p>Enter raw HTML tags here...</p>"
          />
        </div>

        {/* TAB 3: Storefront Live Preview */}
        <div className={`p-4 bg-[#fdfcfb] border-t border-stone-100 ${activeTab === "preview" ? "block" : "hidden"}`}>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200/80">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Live Customer Storefront Simulation
            </span>
            <span className="text-[10px] text-stone-400 font-medium">
              Rendered exactly as buyers see it
            </span>
          </div>

          {value && value.trim() ? (
            <div
              className="prose-glimglee bg-white p-4 rounded-xl border border-stone-200/60 shadow-2xs"
              dangerouslySetInnerHTML={{ __html: formatDescriptionHtml(value) }}
            />
          ) : (
            <div className="py-8 text-center text-stone-400 text-xs italic">
              No description added yet. Switch to Visual mode to add text, points, and styling.
            </div>
          )}
        </div>

        {/* Bottom Status & Helpful Tips Bar */}
        <div className="px-3 py-2 bg-stone-50/80 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
          <div className="flex items-center gap-3">
            <span>
              Words: <strong className="text-stone-700">{wordCount}</strong>
            </span>
            <span>
              Characters: <strong className="text-stone-700">{charCount}</strong>
            </span>
            {hasExistingContent && (
              <span className="text-emerald-700 font-medium hidden sm:inline">
                • Ready to edit or add points
              </span>
            )}
          </div>

          <div className="text-stone-400 hidden sm:block">
            💡 Select any text to make it <strong className="text-stone-700">Bold</strong>, click <strong className="text-rose-600 font-bold">Points</strong> for lists, or use Presets
          </div>
        </div>
      </div>
    </div>
  );
}

export default RichTextEditor;
