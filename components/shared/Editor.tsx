"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { FC, useCallback, memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
}

// Memoize toolbar buttons to prevent unnecessary re-renders
const ToolbarButton = memo(
  ({
    active,
    onClick,
    disabled,
    icon: Icon,
    title,
  }: {
    active?: boolean;
    onClick: () => void;
    disabled?: boolean;
    icon: FC<{ className?: string }>;
    title?: string;
  }) => (
    <Button
      type="button"
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  ),
);

ToolbarButton.displayName = "ToolbarButton";

const TiptapEditor: FC<TiptapEditorProps> = memo(
  ({
    content = "",
    onChange,
    placeholder = "Start typing...",
    editable = true,
  }) => {
    // Memoize editor configuration
    const editorConfig = useMemo(
      () => ({
        extensions: [
          StarterKit.configure({
            heading: {
              levels: [1, 2, 3],
            },
          }),
          Underline,
          TextAlign.configure({
            types: ["heading", "paragraph"],
          }),
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              class: "text-blue-500 underline cursor-pointer",
            },
          }),
          Image.configure({
            HTMLAttributes: {
              class: "max-w-full h-auto rounded-lg",
            },
          }),
          TableRow,
          TableHeader.configure({
            HTMLAttributes: {
              class: "border border-border bg-muted font-bold p-2",
            },
          }),
          TableCell.configure({
            HTMLAttributes: {
              class: "border border-border p-2",
            },
          }),
          Highlight.configure({
            multicolor: true,
          }),
          TaskList.configure({
            HTMLAttributes: {
              class: "not-prose",
            },
          }),
          TaskItem.configure({
            nested: true,
            HTMLAttributes: {
              class: "flex items-start gap-2",
            },
          }),
          Color,
          Placeholder.configure({
            placeholder,
          }),
        ],
        content,
        editable,
        editorProps: {
          attributes: {
            class:
              "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
          },
        },
      }),
      [content, editable, placeholder],
    );

    const editor = useEditor(
      {
        ...editorConfig,
        onUpdate: ({ editor }) => {
          onChange?.(editor.getHTML());
        },
      },
      [editorConfig, onChange],
    );

    // Memoize all callbacks
    const setLink = useCallback(() => {
      if (!editor) return;

      const previousUrl = editor.getAttributes("link").href;
      const url = window.prompt("URL", previousUrl);

      if (url === null) return;

      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }, [editor]);

    const addImage = useCallback(() => {
      if (!editor) return;

      const url = window.prompt("Image URL");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }, [editor]);

    // Memoize common editor commands
    const editorCommands = useMemo(
      () => ({
        toggleBold: () => editor?.chain().focus().toggleBold().run(),
        toggleItalic: () => editor?.chain().focus().toggleItalic().run(),
        toggleUnderline: () => editor?.chain().focus().toggleUnderline().run(),
        toggleStrike: () => editor?.chain().focus().toggleStrike().run(),
        toggleCode: () => editor?.chain().focus().toggleCode().run(),
        toggleHighlight: () => editor?.chain().focus().toggleHighlight().run(),
        toggleHeading1: () =>
          editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        toggleHeading2: () =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        toggleHeading3: () =>
          editor?.chain().focus().toggleHeading({ level: 3 }).run(),
        setAlignLeft: () => editor?.chain().focus().setTextAlign("left").run(),
        setAlignCenter: () =>
          editor?.chain().focus().setTextAlign("center").run(),
        setAlignRight: () =>
          editor?.chain().focus().setTextAlign("right").run(),
        setAlignJustify: () =>
          editor?.chain().focus().setTextAlign("justify").run(),
        toggleBulletList: () =>
          editor?.chain().focus().toggleBulletList().run(),
        toggleOrderedList: () =>
          editor?.chain().focus().toggleOrderedList().run(),
        toggleTaskList: () => editor?.chain().focus().toggleTaskList().run(),
        toggleBlockquote: () =>
          editor?.chain().focus().toggleBlockquote().run(),
        insertTable: () =>
          editor
            ?.chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
        undo: () => editor?.chain().focus().undo().run(),
        redo: () => editor?.chain().focus().redo().run(),
      }),
      [editor],
    );

    if (!editor) {
      return (
        <div className="border rounded-lg overflow-hidden bg-card min-h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading editor...</div>
        </div>
      );
    }

    return (
      <div className="border rounded-lg overflow-hidden bg-card">
        {/* Toolbar */}
        <div className="border-b bg-muted/50 p-2 flex flex-wrap gap-1 items-center">
          {/* Text Formatting */}
          <div className="flex gap-1">
            <ToolbarButton
              active={editor.isActive("bold")}
              onClick={editorCommands.toggleBold}
              icon={Bold}
              title="Bold"
            />
            <ToolbarButton
              active={editor.isActive("italic")}
              onClick={editorCommands.toggleItalic}
              icon={Italic}
              title="Italic"
            />
            <ToolbarButton
              active={editor.isActive("underline")}
              onClick={editorCommands.toggleUnderline}
              icon={UnderlineIcon}
              title="Underline"
            />
            <ToolbarButton
              active={editor.isActive("strike")}
              onClick={editorCommands.toggleStrike}
              icon={Strikethrough}
              title="Strikethrough"
            />
            <ToolbarButton
              active={editor.isActive("code")}
              onClick={editorCommands.toggleCode}
              icon={Code}
              title="Code"
            />
            <ToolbarButton
              active={editor.isActive("highlight")}
              onClick={editorCommands.toggleHighlight}
              icon={Highlighter}
              title="Highlight"
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Headings */}
          <div className="flex gap-1">
            <ToolbarButton
              active={editor.isActive("heading", { level: 1 })}
              onClick={editorCommands.toggleHeading1}
              icon={Heading1}
              title="Heading 1"
            />
            <ToolbarButton
              active={editor.isActive("heading", { level: 2 })}
              onClick={editorCommands.toggleHeading2}
              icon={Heading2}
              title="Heading 2"
            />
            <ToolbarButton
              active={editor.isActive("heading", { level: 3 })}
              onClick={editorCommands.toggleHeading3}
              icon={Heading3}
              title="Heading 3"
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Text Align */}
          <div className="flex gap-1">
            <ToolbarButton
              active={editor.isActive({ textAlign: "left" })}
              onClick={editorCommands.setAlignLeft}
              icon={AlignLeft}
              title="Align Left"
            />
            <ToolbarButton
              active={editor.isActive({ textAlign: "center" })}
              onClick={editorCommands.setAlignCenter}
              icon={AlignCenter}
              title="Align Center"
            />
            <ToolbarButton
              active={editor.isActive({ textAlign: "right" })}
              onClick={editorCommands.setAlignRight}
              icon={AlignRight}
              title="Align Right"
            />
            <ToolbarButton
              active={editor.isActive({ textAlign: "justify" })}
              onClick={editorCommands.setAlignJustify}
              icon={AlignJustify}
              title="Justify"
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Lists */}
          <div className="flex gap-1">
            <ToolbarButton
              active={editor.isActive("bulletList")}
              onClick={editorCommands.toggleBulletList}
              icon={List}
              title="Bullet List"
            />
            <ToolbarButton
              active={editor.isActive("orderedList")}
              onClick={editorCommands.toggleOrderedList}
              icon={ListOrdered}
              title="Numbered List"
            />
            <ToolbarButton
              active={editor.isActive("taskList")}
              onClick={editorCommands.toggleTaskList}
              icon={CheckSquare}
              title="Task List"
            />
            <ToolbarButton
              active={editor.isActive("blockquote")}
              onClick={editorCommands.toggleBlockquote}
              icon={Quote}
              title="Blockquote"
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Insert */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={setLink}
              icon={LinkIcon}
              title="Insert Link"
            />
            <ToolbarButton
              onClick={addImage}
              icon={ImageIcon}
              title="Insert Image"
            />
            <ToolbarButton
              onClick={editorCommands.insertTable}
              icon={TableIcon}
              title="Insert Table"
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* History */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={editorCommands.undo}
              disabled={!editor.can().undo()}
              icon={Undo}
              title="Undo"
            />
            <ToolbarButton
              onClick={editorCommands.redo}
              disabled={!editor.can().redo()}
              icon={Redo}
              title="Redo"
            />
          </div>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>
    );
  },
);

TiptapEditor.displayName = "TiptapEditor";

export default TiptapEditor;
