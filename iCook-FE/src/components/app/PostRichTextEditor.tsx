"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ColorIcon,
  ImageIcon,
  ItalicIcon,
  UnderlineIcon,
} from "@/components/app/icons";
import { loadImageAsDataUrl } from "@/lib/imageUpload";
import { sanitizePostHtml } from "@/lib/postRichText";

type Props = {
  id: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type BlockStyle = "h1" | "h2" | "h3" | "p" | "small" | "tiny";

type FormatCmd =
  | "bold"
  | "italic"
  | "underline"
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight";

function closestBlock(editor: HTMLElement): HTMLElement | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node: Node | null = sel.anchorNode;
  if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
  while (node && node !== editor) {
    if (node instanceof HTMLElement) {
      const tag = node.tagName;
      if (tag === "H1" || tag === "H2" || tag === "H3" || tag === "P" || tag === "DIV" || tag === "SMALL") {
        return node;
      }
    }
    node = node.parentNode;
  }
  return null;
}

function blockStyleFromEl(el: HTMLElement | null): BlockStyle {
  if (!el) return "p";
  if (el.classList.contains("post-tiny")) return "tiny";
  if (el.classList.contains("post-small") || el.tagName === "SMALL") return "small";
  if (el.tagName === "H1") return "h1";
  if (el.tagName === "H2") return "h2";
  if (el.tagName === "H3") return "h3";
  return "p";
}

const COLOR_CLASSES = [
  "post-color-ink",
  "post-color-brand",
  "post-color-muted",
] as const;

type ThemeColorName = "ink" | "brand" | "muted";

function closestColorTarget(editor: HTMLElement): HTMLElement | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node: Node | null = sel.anchorNode;
  if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
  while (node && node !== editor) {
    if (node instanceof HTMLElement) {
      const tag = node.tagName;
      if (
        tag === "SPAN" ||
        tag === "FONT" ||
        COLOR_CLASSES.some((cls) => node.classList.contains(cls))
      ) {
        return node;
      }
    }
    node = node.parentNode;
  }
  return null;
}

function restoreSelection(editor: HTMLElement, range: Range | null) {
  editor.focus();
  if (!range) return;
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

export default function PostRichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Write your post…",
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [blockStyle, setBlockStyle] = useState<BlockStyle>("p");
  const [active, setActive] = useState<Record<FormatCmd, boolean>>({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const next = value || "";
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value]);

  function rememberRange() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRange.current = range.cloneRange();
    }
  }

  function syncHtml() {
    const el = editorRef.current;
    if (!el) return;
    onChange(sanitizePostHtml(el.innerHTML));
  }

  function refreshActive() {
    const query = (cmd: FormatCmd) => {
      try {
        return document.queryCommandState(cmd);
      } catch {
        return false;
      }
    };
    setActive({
      bold: query("bold"),
      italic: query("italic"),
      underline: query("underline"),
      justifyLeft: query("justifyLeft"),
      justifyCenter: query("justifyCenter"),
      justifyRight: query("justifyRight"),
    });
    const editor = editorRef.current;
    setBlockStyle(blockStyleFromEl(editor ? closestBlock(editor) : null));
  }

  function run(command: FormatCmd | "foreColor" | "insertHTML", value?: string) {
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelection(editor, savedRange.current);
    document.execCommand(command, false, value);
    rememberRange();
    syncHtml();
    refreshActive();
  }

  function apply(command: FormatCmd) {
    run(command);
  }

  function applyTextColor(name: ThemeColorName) {
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelection(editor, savedRange.current);
    const cls = `post-color-${name}`;
    const existing = closestColorTarget(editor);
    if (existing) {
      existing.classList.remove(...COLOR_CLASSES);
      existing.classList.add(cls);
      existing.style.removeProperty("color");
      existing.removeAttribute("color");
    } else {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const span = document.createElement("span");
        span.className = cls;
        try {
          range.surroundContents(span);
        } catch {
          try {
            document.execCommand("styleWithCSS", false, "true");
          } catch {
            /* ignore */
          }
          document.execCommand("foreColor", false, "#292929");
          const nested = closestColorTarget(editor);
          if (nested) {
            nested.classList.remove(...COLOR_CLASSES);
            nested.classList.add(cls);
            nested.style.removeProperty("color");
            nested.removeAttribute("color");
          }
        }
      } else {
        const block = closestBlock(editor);
        if (block) {
          block.classList.remove(...COLOR_CLASSES);
          block.classList.add(cls);
        }
      }
    }
    rememberRange();
    syncHtml();
    refreshActive();
  }

  function applyBlock(style: BlockStyle) {
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelection(editor, savedRange.current);
    const tag = style === "tiny" || style === "small" ? "p" : style;
    document.execCommand("formatBlock", false, tag);
    const block = closestBlock(editor);
    if (block) {
      block.classList.remove("post-small", "post-tiny");
      if (style === "small") block.classList.add("post-small");
      if (style === "tiny") block.classList.add("post-tiny");
    }
    rememberRange();
    syncHtml();
    refreshActive();
  }

  async function onInsertImage(file: File | undefined) {
    if (!file) return;
    const result = await loadImageAsDataUrl(file);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    const editor = editorRef.current;
    if (!editor) return;
    restoreSelection(editor, savedRange.current);
    run(
      "insertHTML",
      `<img src="${result.dataUrl}" alt="" />`,
    );
  }

  const toolBtn =
    "grid size-10 shrink-0 place-items-center rounded transition-colors hover:text-brand";

  return (
    <div className="flex flex-col rounded border border-line">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-line bg-app p-2 text-ink-secondary">
        <select
          aria-label="Text style"
          value={blockStyle}
          className="me-1 h-10 min-w-[7.5rem] rounded border border-line bg-surface px-2 text-sm font-bold text-ink outline-none"
          onMouseDown={() => rememberRange()}
          onChange={(e) => applyBlock(e.target.value as BlockStyle)}
        >
          <option value="h1">Header 1</option>
          <option value="h2">Header 2</option>
          <option value="h3">Header 3</option>
          <option value="p">Paragraph</option>
          <option value="small">Small</option>
          <option value="tiny">Tiny</option>
        </select>
        {(
          [
            ["bold", "Bold", BoldIcon],
            ["italic", "Italic", ItalicIcon],
            ["underline", "Underline", UnderlineIcon],
          ] as const
        ).map(([cmd, label, Icon]) => (
          <button
            key={cmd}
            type="button"
            aria-label={label}
            aria-pressed={active[cmd]}
            className={`${toolBtn} ${active[cmd] ? "bg-brand/10 text-brand" : ""}`}
            onMouseDown={(e) => {
              e.preventDefault();
              rememberRange();
            }}
            onClick={() => apply(cmd)}
          >
            <Icon className="size-5" />
          </button>
        ))}
        <button
          type="button"
          aria-label="Insert image"
          className={toolBtn}
          onMouseDown={(e) => {
            e.preventDefault();
            rememberRange();
          }}
          onClick={() => fileRef.current?.click()}
        >
          <ImageIcon className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Ink color"
          className={`${toolBtn} text-ink`}
          onMouseDown={(e) => {
            e.preventDefault();
            rememberRange();
          }}
          onClick={() => applyTextColor("ink")}
        >
          <ColorIcon className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Accent color"
          className={`${toolBtn} text-brand`}
          onMouseDown={(e) => {
            e.preventDefault();
            rememberRange();
          }}
          onClick={() => applyTextColor("brand")}
        >
          <ColorIcon className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Muted color"
          className={`${toolBtn} text-muted`}
          onMouseDown={(e) => {
            e.preventDefault();
            rememberRange();
          }}
          onClick={() => applyTextColor("muted")}
        >
          <ColorIcon className="size-5" />
        </button>
        {(
          [
            ["justifyLeft", "Align left", AlignLeftIcon],
            ["justifyCenter", "Align center", AlignCenterIcon],
            ["justifyRight", "Align right", AlignRightIcon],
          ] as const
        ).map(([cmd, label, Icon]) => (
          <button
            key={cmd}
            type="button"
            aria-label={label}
            aria-pressed={active[cmd]}
            className={`${toolBtn} ${active[cmd] ? "bg-brand/10 text-brand" : ""}`}
            onMouseDown={(e) => {
              e.preventDefault();
              rememberRange();
            }}
            onClick={() => apply(cmd)}
          >
            <Icon className="size-5" />
          </button>
        ))}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void onInsertImage(file);
        }}
      />
      <div
        id={id}
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label="Post content"
        contentEditable
        data-placeholder={placeholder}
        className="post-rich-editor min-h-48 bg-surface p-2.5 text-base text-ink outline-none"
        onInput={syncHtml}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        onBlur={() => {
          rememberRange();
          syncHtml();
        }}
        onFocus={refreshActive}
      />
    </div>
  );
}
