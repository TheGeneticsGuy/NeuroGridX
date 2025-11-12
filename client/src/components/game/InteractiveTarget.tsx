import React, { useRef, type MouseEvent } from 'react'; // NEED useRef because ity was super sluggish until I investigated how to do this.
import './InteractiveTarget.css';

interface InteractiveTargetProps {
  id: number;
  x: number;
  y: number;
  size: number;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}

const InteractiveTarget: React.FC<InteractiveTargetProps> = ({ x, y, size, onClick }) => {
  const targetRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!targetRef.current) return;

    const target = targetRef.current;
    const rect = target.getBoundingClientRect();
    const radius = size / 2;

    // calculate center of the circle
    const centerX = rect.left + radius;
    const centerY = rect.top + radius;

    // calculate distance from cursor to center
    const dist = Math.sqrt(Math.pow(centerX - e.clientX, 2) + Math.pow(centerY - e.clientY, 2));

    // Calculate percentage (1.0 = center, 0.0 = edge), and clamp it
    let accuracyPercent = Math.max(0, 1 - (dist / radius));

    // PERFORMANCE CONSIDERATION - THis is more efficient
    target.style.setProperty('--accuracy-percent', accuracyPercent.toString());

    // Position the float up tooltip of text
    const tooltipX = e.clientX - rect.left;
    const tooltipY = e.clientY - rect.top;
    target.style.setProperty('--cursor-x', `${tooltipX}px`);
    target.style.setProperty('--cursor-y', `${tooltipY}px`);
  };

  const handleMouseLeave = () => {
    if (!targetRef.current) return;
    // Reset when mouse leaves
    targetRef.current.style.setProperty('--accuracy-percent', '0');
  };

  return (
    <div
      ref={targetRef}
      className="interactive-target"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div className="target-gradient"></div>
      <div className="target-outline"></div>
      <div className="accuracy-tooltip"></div>
    </div>
  );
};

export default InteractiveTarget;