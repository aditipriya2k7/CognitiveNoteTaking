import React from 'react';
import { Note, Space } from '../types';
import { Plus, Download } from 'lucide-react';

interface NotePanelProps {
  notes: Note[];
  spaces: Space[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: (spaceId: string) => void;
  onImport: () => void;
  isImportReady: boolean;
}

const NotePanel: React.FC<NotePanelProps> = ({ notes, spaces, selectedNoteId, onSelectNote, onAddNote, onImport, isImportReady }) => {
  return (
    <div className="flex flex-col h-full bg-canvas-bg-alt border-r border-border-color">
      <div className="p-4 border-b border-border-color flex justify-between items-center">
        <h1 className="text-xl font-bold text-text-primary">My Notes</h1>
        <button
          onClick={onImport}
          disabled={!isImportReady}
          className="flex items-center gap-2 px-2 py-1 text-xs rounded text-text-secondary hover:text-text-primary hover:bg-border-color disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Import from Google Drive"
        >
          <Download size={14} /> Import
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {spaces.map(space => {
          const notesInSpace = notes.filter(note => note.spaceId === space.id);
          return (
            <div key={space.id} className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-text-secondary uppercase" style={{ color: space.color }}>{space.name}</h2>
                <button
                  onClick={() => onAddNote(space.id)}
                  className="text-text-secondary hover:text-text-primary"
                  aria-label={`Add note to ${space.name}`}
                >
                  <Plus size={16} />
                </button>
              </div>
              <ul>
                {notesInSpace.map(note => (
                  <li key={note.id}>
                    <button
                      onClick={() => onSelectNote(note.id)}
                      className={`w-full text-left p-2 rounded-md truncate ${selectedNoteId === note.id ? 'bg-accent text-canvas-bg' : 'hover:bg-border-color'}`}
                    >
                      {note.title || 'Untitled Note'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotePanel;