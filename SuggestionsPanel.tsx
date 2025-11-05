
import React, { useState, useEffect, useCallback } from 'react';
import { Note, Link } from '../types';
import { suggestLinks, suggestNewNotes, suggestLinkReason } from '../services/geminiService';
import { Sparkles, Link as LinkIcon, PlusCircle, Loader2 } from 'lucide-react';

interface SuggestionsPanelProps {
  selectedNote: Note | null;
  allNotes: Note[];
  links: Link[];
  onAddLink: (link: Link) => void;
  onAddNote: (note: { title: string; content: string }, spaceId: string) => void;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ selectedNote, allNotes, links, onAddLink, onAddNote }) => {
  const [suggestedLinkIds, setSuggestedLinkIds] = useState<string[]>([]);
  const [suggestedNewNotes, setSuggestedNewNotes] = useState<{ title: string; content: string }[]>([]);
  const [isLinksLoading, setIsLinksLoading] = useState(false);
  const [isNewNotesLoading, setIsNewNotesLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    if (!selectedNote) return;

    setIsLinksLoading(true);
    setIsNewNotesLoading(true);

    try {
      const [linksResult, newNotesResult] = await Promise.all([
        suggestLinks(selectedNote, allNotes),
        suggestNewNotes(selectedNote),
      ]);
      const existingLinkTargets = new Set(links.filter(l => l.source === selectedNote.id).map(l => l.target));
      const existingLinkSources = new Set(links.filter(l => l.target === selectedNote.id).map(l => l.source));

      setSuggestedLinkIds(linksResult.filter(id => !existingLinkTargets.has(id) && !existingLinkSources.has(id)));
      setSuggestedNewNotes(newNotesResult);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setIsLinksLoading(false);
      setIsNewNotesLoading(false);
    }
  }, [selectedNote, allNotes, links]);

  useEffect(() => {
    if (selectedNote) {
      // Reset state before fetching
      setSuggestedLinkIds([]);
      setSuggestedNewNotes([]);
      const timer = setTimeout(() => fetchSuggestions(), 1000); // Debounce fetching
      return () => clearTimeout(timer);
    }
  }, [selectedNote, fetchSuggestions]);

  const handleAddLink = async (targetNoteId: string) => {
    if (!selectedNote) return;
    const targetNote = allNotes.find(n => n.id === targetNoteId);
    if (!targetNote) return;

    const reason = await suggestLinkReason(selectedNote, targetNote);
    onAddLink({ source: selectedNote.id, target: targetNoteId, reason });
    setSuggestedLinkIds(prev => prev.filter(id => id !== targetNoteId));
  };

  const handleAddNote = (newNote: { title: string; content: string }) => {
    if (!selectedNote) return;
    onAddNote(newNote, selectedNote.spaceId);
    setSuggestedNewNotes(prev => prev.filter(n => n.title !== newNote.title));
  };
  
  if (!selectedNote) return <div className="p-4"><h2 className="text-lg font-semibold text-text-primary flex items-center"><Sparkles size={18} className="mr-2 text-accent" /> AI Suggestions</h2><p className="text-sm text-text-secondary mt-4">Select a note to see suggestions.</p></div>;

  return (
    <div className="flex flex-col h-full bg-canvas-bg-alt border-l border-border-color p-4 space-y-6">
      <h2 className="text-lg font-semibold text-text-primary flex items-center"><Sparkles size={18} className="mr-2 text-accent" /> AI Suggestions</h2>
      
      {/* Suggested Links */}
      <div>
        <h3 className="text-md font-semibold text-text-secondary mb-2">Suggested Links</h3>
        {isLinksLoading ? (
          <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin" /></div>
        ) : (
          suggestedLinkIds.length > 0 ? (
            <ul className="space-y-2">
              {suggestedLinkIds.map(noteId => {
                const note = allNotes.find(n => n.id === noteId);
                if (!note) return null;
                return (
                  <li key={noteId} className="bg-canvas-bg p-2 rounded-md flex justify-between items-center">
                    <span className="text-sm text-text-primary truncate">{note.title}</span>
                    <button onClick={() => handleAddLink(noteId)} className="p-1 hover:bg-border-color rounded flex-shrink-0"><LinkIcon size={16} /></button>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-sm text-text-secondary">No new links suggested.</p>
        )}
      </div>

      {/* Suggested New Notes */}
      <div>
        <h3 className="text-md font-semibold text-text-secondary mb-2">Suggested New Notes</h3>
        {isNewNotesLoading ? (
          <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin" /></div>
        ) : (
          suggestedNewNotes.length > 0 ? (
            <ul className="space-y-2">
              {suggestedNewNotes.map((note, index) => (
                <li key={index} className="bg-canvas-bg p-2 rounded-md flex justify-between items-center">
                  <span className="text-sm text-text-primary truncate">{note.title}</span>
                   <button onClick={() => handleAddNote(note)} className="p-1 hover:bg-border-color rounded flex-shrink-0"><PlusCircle size={16} /></button>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-text-secondary">No new notes suggested.</p>
        )}
      </div>
    </div>
  );
};

export default SuggestionsPanel;
