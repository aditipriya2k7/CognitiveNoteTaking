import React, { useState, useCallback, useEffect } from 'react';
import { Note, Link, Space } from './types';
import { INITIAL_NOTES, INITIAL_LINKS, INITIAL_SPACES } from './constants';
import { initGoogleDrive, handleAuthClick, handleFileImport } from './services/googleDriveService';
import NotePanel from './components/NotePanel';
import NoteEditor from './components/NoteEditor';
import GraphVisualization from './components/GraphVisualization';
import SuggestionsPanel from './components/SuggestionsPanel';
import NoteStructureView from './components/NoteStructureView';
import { v4 as uuidv4 } from 'uuid';
import ResizablePanes from './components/ResizablePanes';

type ActiveTab = 'editor' | 'graph';

const App: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [links, setLinks] = useState<Link[]>(INITIAL_LINKS);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(INITIAL_NOTES[0]?.id || null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [isDriveApiReady, setIsDriveApiReady] = useState(false);

  useEffect(() => {
    initGoogleDrive(() => setIsDriveApiReady(true));
  }, []);

  const selectedNote = notes.find(note => note.id === selectedNoteId) || null;

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
  };

  const handleUpdateNote = useCallback((updatedNote: Note) => {
    setNotes(prevNotes =>
      prevNotes.map(note => (note.id === updatedNote.id ? updatedNote : note))
    );
  }, []);

  const handleCreateEmptyNote = (spaceId: string) => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
      spaceId,
    };
    setNotes(prevNotes => [...prevNotes, newNote]);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    setLinks(prev => prev.filter(l => l.source !== noteId && l.target !== noteId));
    
    // Select another note if the deleted one was selected
    if (selectedNoteId === noteId) {
      const remainingNotes = notes.filter(n => n.id !== noteId);
      setSelectedNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
    }
  }, [selectedNoteId, notes]);

  const handleImportNote = useCallback((importedNote: { title: string, content: string }) => {
    const newNote: Note = {
      id: uuidv4(),
      title: importedNote.title,
      content: JSON.stringify({
        type: 'doc',
        content: importedNote.content.split('\n\n').map(paragraph => ({
          type: 'paragraph',
          content: [{ type: 'text', text: paragraph }]
        }))
      }),
      spaceId: INITIAL_SPACES.find(s => s.name === 'General')?.id || INITIAL_SPACES[0].id, // Default to 'General' space
    };
    setNotes(prev => [...prev, newNote]);
    setSelectedNoteId(newNote.id);
  }, []);

  const handleInitiateImport = () => {
    handleAuthClick((tokenResponse) => {
      if (tokenResponse) {
        handleFileImport(handleImportNote);
      }
    });
  };

  const handleAddSuggestedNote = useCallback((newNoteData: {title: string, content: string}, spaceId: string) => {
    const newNote: Note = {
      id: uuidv4(),
      title: newNoteData.title,
      content: JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: newNoteData.content }] }],
      }),
      spaceId: spaceId,
    };
    setNotes(prev => [...prev, newNote]);
    setSelectedNoteId(newNote.id);
  }, []);

  const handleAddLink = useCallback((newLink: Link) => {
    setLinks(prevLinks => {
      if (prevLinks.some(l => (l.source === newLink.source && l.target === newLink.target) || (l.source === newLink.target && l.target === newLink.source))) {
        return prevLinks;
      }
      return [...prevLinks, newLink];
    });
  }, []);
  
  const renderContent = () => {
    switch (activeTab) {
      case 'graph':
        return (
          <div className="p-4 h-full">
            <GraphVisualization
              notes={notes}
              links={links}
              onNodeClick={handleSelectNote}
              selectedNoteId={selectedNoteId}
            />
          </div>
        );
      case 'editor':
      default:
        return (
          <ResizablePanes
            topContent={
              <NoteEditor 
                note={selectedNote} 
                onUpdateNote={handleUpdateNote} 
                onDeleteNote={handleDeleteNote}
              />
            }
            bottomContent={
              <NoteStructureView note={selectedNote} />
            }
          />
        );
    }
  };

  return (
    <main className="h-screen w-screen bg-canvas-bg text-text-primary flex font-sans">
      <div className="w-1/4 max-w-xs h-full flex-shrink-0">
        <NotePanel
          notes={notes}
          spaces={spaces}
          selectedNoteId={selectedNoteId}
          onSelectNote={handleSelectNote}
          onAddNote={handleCreateEmptyNote}
          onImport={handleInitiateImport}
          isImportReady={isDriveApiReady}
        />
      </div>
      <div className="flex-1 flex flex-col h-full min-w-0 border-l border-r border-border-color">
         <div className="flex-shrink-0 flex border-b border-border-color">
            <button 
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'editor' ? 'text-accent border-b-2 border-accent bg-panel-bg' : 'text-text-secondary hover:bg-panel-bg'}`}
            >
                Editor
            </button>
            <button
                onClick={() => setActiveTab('graph')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'graph' ? 'text-accent border-b-2 border-accent bg-panel-bg' : 'text-text-secondary hover:bg-panel-bg'}`}
            >
                Graph
            </button>
        </div>
        <div className="flex-grow min-h-0">
          {renderContent()}
        </div>
      </div>
      <div className="w-1/4 max-w-xs h-full flex-shrink-0">
        <SuggestionsPanel 
            selectedNote={selectedNote}
            allNotes={notes}
            links={links}
            onAddLink={handleAddLink}
            onAddNote={handleAddSuggestedNote}
        />
      </div>
    </main>
  );
}

export default App;