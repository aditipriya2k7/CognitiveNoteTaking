
import { GoogleGenAI, Type } from "@google/genai";
import { Note, Link } from '../types';

// Per guidelines, API key must be from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
// Per guidelines, select appropriate model for basic text tasks.
const model = 'gemini-2.5-flash';

function extractPlainText(jsonContent: string): string {
  try {
    if (!jsonContent || jsonContent.trim() === '') return '';
    // A simple check to see if the content is already plain text, not JSON
    try {
        JSON.parse(jsonContent);
    } catch {
        return jsonContent;
    }

    const parsed = JSON.parse(jsonContent);
    let text = '';
    
    function traverse(node: any) {
      if (node.type === 'text' && node.text) {
        text += node.text + ' ';
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(traverse);
      }
    }

    traverse(parsed);
    return text.trim();
  } catch (e) {
    console.error('Error parsing TipTap JSON:', e);
    if (typeof jsonContent === 'string') return jsonContent;
    return '';
  }
}

export async function suggestLinks(currentNote: Note, allNotes: Note[]): Promise<string[]> {
  const otherNotes = allNotes.filter(n => n.id !== currentNote.id);
  if (otherNotes.length === 0) {
    return [];
  }

  const currentNoteText = `Title: ${currentNote.title}\nContent: ${extractPlainText(currentNote.content)}`;
  const otherNotesText = otherNotes.map(n => `ID: ${n.id}\nTitle: ${n.title}\nContent: ${extractPlainText(n.content)}`).join('\n\n');

  const prompt = `
    Here is a main note:
    ---
    ${currentNoteText}
    ---

    Here is a list of other notes:
    ---
    ${otherNotesText}
    ---

    Based on the content of the main note, identify which of the other notes are strongly related.
    Return a JSON array of the IDs of the related notes. For example: ["note-id-1", "note-id-2"].
    Only include IDs from the provided list of other notes. Do not include the main note's ID.
    If no notes are related, return an empty array.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    // Fix: Extract text from response correctly
    const resultText = response.text.trim();
    const suggestedIds = JSON.parse(resultText);
    return Array.isArray(suggestedIds) ? suggestedIds.filter(id => typeof id === 'string') : [];
  } catch (error) {
    console.error("Error suggesting links:", error);
    return [];
  }
}

export async function suggestNewNotes(currentNote: Note): Promise<{title: string; content: string}[]> {
  const currentNoteText = `Title: ${currentNote.title}\nContent: ${extractPlainText(currentNote.content)}`;

  const prompt = `
    Based on the following note:
    ---
    ${currentNoteText}
    ---
    Suggest 2-3 new, related topics or questions that could be explored in new notes.
    For each suggestion, provide a concise title and a short paragraph for the content.
    Return a JSON array of objects, where each object has a "title" and "content" key.
    Example: [{"title": "New Topic", "content": "This is a new note about..."}]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING, description: "A paragraph for the new note content." }
            },
            required: ['title', 'content']
          }
        }
      }
    });

    // Fix: Extract text from response correctly
    const resultText = response.text.trim();
    const suggestions = JSON.parse(resultText);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error("Error suggesting new notes:", error);
    return [];
  }
}


export async function suggestLinkReason(noteA: Note, noteB: Note): Promise<string> {
  const noteAText = `Title: ${noteA.title}\nContent: ${extractPlainText(noteA.content)}`;
  const noteBText = `Title: ${noteB.title}\nContent: ${extractPlainText(noteB.content)}`;
  
  const prompt = `
    Here are two notes:

    Note A:
    ---
    ${noteAText}
    ---

    Note B:
    ---
    ${noteBText}
    ---

    Briefly explain, in one sentence, the relationship or connection between Note A and Note B.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    // Fix: Extract text from response correctly
    return response.text.trim();
  } catch (error) {
    console.error("Error suggesting link reason:", error);
    return "Could not determine reason.";
  }
}
