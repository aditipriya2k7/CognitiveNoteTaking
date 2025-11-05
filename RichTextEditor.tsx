import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import EditorToolbar from './EditorToolbar';
import { v4 as uuidv4 } from 'uuid';

interface RichTextEditorProps {
  content: string;
  onChange: (richText: string, plainText: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    // Add unique IDs to headings for the structure view
    onCreate({ editor }) {
      const { state, dispatch } = editor.view;
      let { tr } = state;
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading' && !node.attrs.id) {
          tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, id: uuidv4() });
        }
      });
      dispatch(tr);
    },
    content: (() => {
      try {
        const parsed = JSON.parse(content);
        // Ensure headings have IDs for scrolling
        let hasChanged = false;
        function traverse(node: any) {
          if (node.type === 'heading' && !node.attrs?.id) {
            node.attrs = { ...node.attrs, id: uuidv4() };
            hasChanged = true;
          }
          if (node.content) {
            node.content.forEach(traverse);
          }
        }
        traverse(parsed);
        if (hasChanged) {
            // If we modified the content, we should ideally inform the parent
            // but for now, we just use the modified content for initialization.
        }
        return parsed;
      } catch (e) {
        return { type: 'doc', content: [{ type: 'paragraph' }] };
      }
    })(),
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()), editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert focus:outline-none max-w-none text-text-primary',
      },
    },
  });

  return (
    <div className="flex flex-col flex-grow bg-canvas-bg border border-border-color rounded-md">
      <EditorToolbar editor={editor} />
      <div className="p-4 flex-grow overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;