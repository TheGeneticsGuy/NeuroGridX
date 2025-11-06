import React, { useState } from 'react';
import './tooltips.css';


interface TooltipProps {
  text: string;
  offsetX?: number;
  offsetY?: number;
}

const Tooltip: React.FC<React.PropsWithChildren<TooltipProps>> = ({
    text,
    children,
    offsetX = 12,
    offsetY = 12,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    return (
        <div style={{ display: "inline-block" }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onMouseMove={(e) => {
                setPos({ x: e.clientX, y: e.clientY });
            }}
        >
            {children}
            {isVisible && (
                <div
                style={{
                    position: "fixed",
                    top: pos.y + offsetY,
                    left: pos.x + offsetX,
                    background: "black",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    pointerEvents: "none", // IMPORTANT!
                    whiteSpace: "nowrap",
                    zIndex: 1000,
                }}
                >
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;