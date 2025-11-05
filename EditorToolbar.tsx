import React from 'react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Image as ImageIcon, Table } from 'lucide-react';

type EditorToolbarProps = {
  editor: Editor | null;
};

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border border-border-color rounded-t-md bg-canvas-bg">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-accent text-canvas-bg p-1 rounded' : 'p-1 rounded hover:bg-border-color'} aria-label="Bold"><Bold size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-accent text-canvas-bg p-1 rounded' : 'p-1 rounded hover:bg-border-color'} aria-label="Italic"><Italic size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-accent text-canvas-bg p-1 rounded' : 'p-1 rounded hover:bg-border-color'} aria-label="Heading 1"><Heading1 size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-accent text-canvas-bg p-1 rounded' : 'p-1 rounded hover:bg-border-color'} aria-label="Heading 2"><Heading2 size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-accent text-canvas-bg p-1 rounded' : 'p-1 rounded hover:bg-border-color'} aria-label="Heading 3"><Heading3 size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-accent text-canvas-bg p-1 rounded' : 'p-1 rounded hover:bg-border-color'} aria-label="Bullet List"><List size={16} /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-accent text-canvas-bg p-1 rounded' : 'p-1 rounded hover:bg-border-color'} aria-label="Ordered List"><ListOrdered size={16} /></button>
      <button onClick={addImage} className="p-1 rounded hover:bg-border-color" aria-label="Add Image"><ImageIcon size={16} /></button>
      <button onClick={addTable} className="p-1 rounded hover:bg-border-color" aria-label="Add Table"><Table size={16} /></button>
    </div>
  );
};

export default EditorToolbar;
