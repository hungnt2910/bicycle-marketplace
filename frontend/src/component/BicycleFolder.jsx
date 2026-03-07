import { useState } from 'react';
import './BicycleFolder.css';

const BicycleFolder = ({ color = '#059669', size = 1, items = [], className = '' }) => {
  const maxItems = 5;
  // Only render papers that have real content — no empty placeholders
  const papers = items.slice(0, maxItems).filter(Boolean);

  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );

  const handleClick = () => {
    setOpen((prev) => !prev);
    if (open) {
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  };

  const handlePaperMouseMove = (e, index) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (e, index) => {
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  // Lighten a hex color
  const lighten = (hex, pct) => {
    let c = hex.startsWith('#') ? hex.slice(1) : hex;
    if (c.length === 3)
      c = c
        .split('')
        .map((ch) => ch + ch)
        .join('');
    const num = parseInt(c, 16);
    let r = (num >> 16) & 0xff,
      g = (num >> 8) & 0xff,
      b = num & 0xff;
    r = Math.min(255, Math.floor(r + (255 - r) * pct));
    g = Math.min(255, Math.floor(g + (255 - g) * pct));
    b = Math.min(255, Math.floor(b + (255 - b) * pct));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const frameColor = color;
  const wheelColor = color;
  const spokeColor = lighten(color, 0.4);

  const bikeClass = `bicycle-folder ${open ? 'open' : ''}`.trim();

  // Spoke angles (6 spokes per wheel)
  const spokeAngles = [0, 30, 60, 90, 120, 150];

  return (
    <div style={{ transform: `scale(${size})` }} className={className}>
      <div className={bikeClass} onClick={handleClick}>
        <div className="bicycle-body">
          {/* Papers behind the bicycle */}
          {papers.map((item, i) => (
            <div
              key={i}
              className={`bike-paper bike-paper-${i + 1}`}
              onMouseMove={(e) => handlePaperMouseMove(e, i)}
              onMouseLeave={(e) => handlePaperMouseLeave(e, i)}
              style={
                open
                  ? {
                      '--magnet-x': `${paperOffsets[i]?.x || 0}px`,
                      '--magnet-y': `${paperOffsets[i]?.y || 0}px`,
                    }
                  : {}
              }
            >
              {item}
            </div>
          ))}

          {/* Bicycle SVG */}
          <svg
            className="bicycle-svg"
            viewBox="0 0 240 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground shadow */}
            <ellipse cx="120" cy="168" rx="90" ry="6" fill={frameColor} opacity="0.08" />

            {/* Back wheel */}
            <g className="bike-wheel">
              <circle cx="55" cy="120" r="38" stroke={wheelColor} strokeWidth="3" />
              <circle
                cx="55"
                cy="120"
                r="35"
                stroke={wheelColor}
                strokeWidth="0.5"
                opacity="0.15"
              />
              <circle cx="55" cy="120" r="5" fill={wheelColor} />
              {spokeAngles.map((a) => (
                <line
                  key={`b-${a}`}
                  x1={55 + 34 * Math.cos((a * Math.PI) / 180)}
                  y1={120 + 34 * Math.sin((a * Math.PI) / 180)}
                  x2={55 - 34 * Math.cos((a * Math.PI) / 180)}
                  y2={120 - 34 * Math.sin((a * Math.PI) / 180)}
                  stroke={spokeColor}
                  strokeWidth="0.8"
                />
              ))}
            </g>

            {/* Front wheel */}
            <g className="bike-wheel">
              <circle cx="185" cy="120" r="38" stroke={wheelColor} strokeWidth="3" />
              <circle
                cx="185"
                cy="120"
                r="35"
                stroke={wheelColor}
                strokeWidth="0.5"
                opacity="0.15"
              />
              <circle cx="185" cy="120" r="5" fill={wheelColor} />
              {spokeAngles.map((a) => (
                <line
                  key={`f-${a}`}
                  x1={185 + 34 * Math.cos((a * Math.PI) / 180)}
                  y1={120 + 34 * Math.sin((a * Math.PI) / 180)}
                  x2={185 - 34 * Math.cos((a * Math.PI) / 180)}
                  y2={120 - 34 * Math.sin((a * Math.PI) / 180)}
                  stroke={spokeColor}
                  strokeWidth="0.8"
                />
              ))}
            </g>

            {/* Frame - main triangle */}
            <path
              d="M55,120 L95,58 L120,120 Z"
              stroke={frameColor}
              strokeWidth="4"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Top tube */}
            <line
              x1="95"
              y1="58"
              x2="148"
              y2="58"
              stroke={frameColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Seat stay */}
            <line
              x1="55"
              y1="120"
              x2="148"
              y2="58"
              stroke={frameColor}
              strokeWidth="2.5"
              opacity="0.6"
            />
            {/* Chain stay */}
            <line
              x1="120"
              y1="120"
              x2="185"
              y2="120"
              stroke={frameColor}
              strokeWidth="2.5"
              opacity="0.5"
            />
            {/* Head tube / fork */}
            <line
              x1="148"
              y1="58"
              x2="185"
              y2="120"
              stroke={frameColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Seat post */}
            <line
              x1="95"
              y1="58"
              x2="92"
              y2="36"
              stroke={frameColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Seat */}
            <ellipse cx="92" cy="33" rx="15" ry="5.5" fill={frameColor} />

            {/* Handlebar stem */}
            <line
              x1="148"
              y1="58"
              x2="157"
              y2="34"
              stroke={frameColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Handlebars */}
            <path
              d="M150,34 C155,22 165,22 170,32"
              stroke={frameColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Grip dots */}
            <circle cx="150" cy="35" r="2.5" fill={frameColor} opacity="0.7" />
            <circle cx="170" cy="33" r="2.5" fill={frameColor} opacity="0.7" />

            {/* Bottom bracket */}
            <circle cx="120" cy="120" r="9" stroke={frameColor} strokeWidth="2.5" fill="none" />
            <circle cx="120" cy="120" r="3.5" fill={frameColor} />
            {/* Crank arms */}
            <line x1="120" y1="111" x2="120" y2="129" stroke={frameColor} strokeWidth="2.5" />
            {/* Pedals */}
            <rect x="114" y="108" width="12" height="4" rx="2" fill={frameColor} opacity="0.75" />
            <rect x="114" y="128" width="12" height="4" rx="2" fill={frameColor} opacity="0.75" />

            {/* Chain */}
            <path
              d="M55,120 Q87,138 120,120"
              stroke={frameColor}
              strokeWidth="1.5"
              strokeDasharray="3,2"
              opacity="0.25"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BicycleFolder;
