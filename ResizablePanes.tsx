import React, { useState, useRef, useCallback, ReactNode } from 'react';

interface ResizablePanesProps {
  topContent: ReactNode;
  bottomContent: ReactNode;
}

const ResizablePanes: React.FC<ResizablePanesProps> = ({ topContent, bottomContent }) => {
  const [topPaneHeight, setTopPaneHeight] = useState(66); // Initial height as percentage
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newTopHeight = moveEvent.clientY - containerRect.top;
      const containerHeight = containerRect.height;
      
      // Prevent resize if container has no height, which would result in NaN
      if(containerHeight === 0) return;

      // Clamp values between 15% and 85% to prevent panes from disappearing
      const newTopPercentage = Math.max(15, Math.min(85, (newTopHeight / containerHeight) * 100));
      
      setTopPaneHeight(newTopPercentage);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      <div style={{ height: `${topPaneHeight}%` }} className="overflow-hidden">
        {topContent}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="h-2 w-full bg-border-color cursor-row-resize hover:bg-accent transition-colors flex-shrink-0"
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize handle"
      />
      {/* Replaced flex-grow with an explicit height calculation using calc()
          This provides a more stable and predictable resizing behavior by removing
          layout ambiguity that can cause jitter with complex child components.
          The handle is 0.5rem (h-2), so the bottom pane takes the remaining height.
      */}
      <div style={{ height: `calc(100% - ${topPaneHeight}% - 0.5rem)` }} className="overflow-hidden">
        {bottomContent}
      </div>
    </div>
  );
};

export default ResizablePanes;
