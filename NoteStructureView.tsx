import React, { useState, useEffect } from 'react';
import { Note } from '../types';

interface NoteStructureViewProps {
  note: Note | null;
}

interface Heading {
  level: number;
  text: string;
  id: string;
}

const NoteStructureView: React.FC<NoteStructureViewProps> = ({ note }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    if (note && note.content) {
      try {
        const parsedContent = JSON.parse(note.content);
        const extractedHeadings: Heading[] = [];

        function traverse(node: any) {
          if (node.type === 'heading' && node.attrs?.id) {
            const text = node.content?.map((n: any) => n.text).join('') || 'Untitled Heading';
            extractedHeadings.push({
              level: node.attrs.level,
              text,
              id: node.attrs.id,
            });
          }
          if (node.content) {
            node.content.forEach(traverse);
          }
        }

        traverse(parsedContent);
        setHeadings(extractedHeadings);
      } catch (e) {
        console.error("Failed to parse note content for structure view:", e);
        setHeadings([]);
      }
    } else {
      setHeadings([]);
    }
  }, [note, note?.content]);

  const handleHeadingClick = (id: string) => {
    // The editor content is in a scrollable div inside the RichTextEditor component
    const editorContainer = document.querySelector('.ProseMirror')?.parentElement;
    const element = document.getElementById(id);
    if (element && editorContainer) {
        // We scroll the container, not the window
        editorContainer.scrollTo({
            top: element.offsetTop - 10, // Small offset from the top
            behavior: 'smooth'
        });
    }
  };

  if (!note) {
    return <div className="p-4 text-text-secondary">Select a note to see its structure.</div>;
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-color pb-2">Structure</h2>
      {headings.length > 0 ? (
        <ul>
          {headings.map((heading) => (
            <li key={heading.id} style={{ marginLeft: `${(heading.level - 1) * 1}rem` }}>
              <button
                onClick={() => handleHeadingClick(heading.id)}
                className="text-left w-full p-1 rounded hover:bg-border-color text-text-secondary hover:text-text-primary text-sm"
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-secondary text-sm">No headings found in this note. Add some H1, H2, or H3 headings to build the structure.</p>
      )}
    </div>
  );
};

export default NoteStructureView;