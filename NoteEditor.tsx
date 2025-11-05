import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import RichTextEditor from './RichTextEditor';
import { useDebounce } from '../hooks/useDebounce';
import { Trash2 } from 'lucide-react';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdateNote, onDeleteNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);
  
  useEffect(() => {
    if (note && (debouncedTitle !== note.title || debouncedContent !== note.content)) {
        onUpdateNote({
            ...note,
            title: debouncedTitle,
            content: debouncedContent,
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle, debouncedContent]);

  const handleDelete = () => {
    if (note && window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      onDeleteNote(note.id);
    }
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        Select a note to start editing or create a new one.
      </div>
    );
  }

  const handleContentChange = (richText: string) => {
    setContent(richText);
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="flex-grow text-2xl font-bold bg-transparent border-b border-border-color focus:outline-none focus:border-accent text-text-primary pb-2"
        />
        <button 
          onClick={handleDelete}
          className="p-2 text-text-secondary hover:text-red-500 rounded-md hover:bg-border-color"
          aria-label="Delete note"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <RichTextEditor content={content} onChange={(richText) => handleContentChange(richText)} />
    </div>
  );
};

export default NoteEditor;