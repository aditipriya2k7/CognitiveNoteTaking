
import React, { useMemo, useRef, useEffect } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import { Note, Link } from '../types';

interface GraphVisualizationProps {
  notes: Note[];
  links: Link[];
  onNodeClick: (noteId: string) => void;
  selectedNoteId: string | null;
}

// Memoize to prevent unnecessary re-renders
const GraphVisualization: React.FC<GraphVisualizationProps> = React.memo(({ notes, links, onNodeClick, selectedNoteId }) => {
  const fgRef = useRef<ForceGraphMethods>();

  const graphData = useMemo(() => {
    const nodes: NodeObject[] = notes.map(note => ({
      id: note.id,
      name: note.title,
      val: 1, // basic size
    }));
    const graphLinks: LinkObject[] = links.map(link => ({
      source: link.source,
      target: link.target,
    }));
    return { nodes, links: graphLinks };
  }, [notes, links]);

  useEffect(() => {
    if (selectedNoteId) {
      const node = graphData.nodes.find(n => n.id === selectedNoteId);
      if (node && typeof node.x === 'number' && typeof node.y === 'number') {
        fgRef.current?.centerAt(node.x, node.y, 1000);
        fgRef.current?.zoom(2.5, 1000);
      }
    } else {
        fgRef.current?.zoomToFit(400);
    }
  }, [selectedNoteId, graphData.nodes]);

  return (
    <div className="w-full h-full bg-canvas-bg-alt border border-border-color rounded-md overflow-hidden">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name as string || '';
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const r = 5;

          ctx.beginPath();
          ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.id === selectedNoteId ? '#A78BFA' : 'rgba(167, 139, 250, 0.5)';
          ctx.fill();

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#E5E7EB';
          ctx.fillText(label, node.x!, node.y! + r + fontSize);
        }}
        linkColor={() => 'rgba(255, 255, 255, 0.2)'}
        linkWidth={1}
        onNodeClick={(node) => onNodeClick(node.id as string)}
        backgroundColor="transparent"
      />
    </div>
  );
});

export default GraphVisualization;
