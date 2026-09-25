import { Package, MapPin } from 'lucide-react';

type Coords = { lat: number; lng: number };

type Props = {
  origin: Coords;
  destination: Coords;
  current: Coords | null;
  progress: number;
};

// Projects lat/lng to an SVG coordinate system using a simple linear interpolation
// with padding around the bounding box.
export default function RouteMap({ origin, destination, current, progress }: Props) {
  const padding = 40;
  const width = 320;
  const height = 280;

  const coords = [origin, destination];
  if (current) coords.push(current);

  const minLat = Math.min(...coords.map((c) => c.lat));
  const maxLat = Math.max(...coords.map((c) => c.lat));
  const minLng = Math.min(...coords.map((c) => c.lng));
  const maxLng = Math.max(...coords.map((c) => c.lng));

  const latRange = Math.max(maxLat - minLat, 0.1);
  const lngRange = Math.max(maxLng - minLng, 0.1);

  const project = (c: Coords) => {
    const x = padding + ((c.lng - minLng) / lngRange) * (width - 2 * padding);
    // Invert lat because SVG y grows downward
    const y = padding + ((maxLat - c.lat) / latRange) * (height - 2 * padding);
    return { x, y };
  };

  const originPt = project(origin);
  const destPt = project(destination);
  const currentPt = current ? project(current) : null;

  // Build a curved path from origin to destination
  const midX = (originPt.x + destPt.x) / 2;
  const midY = (originPt.y + destPt.y) / 2 - 30;
  const fullDashedPath = `M ${originPt.x} ${originPt.y} Q ${midX} ${midY} ${destPt.x} ${destPt.y}`;

  // Build the solid (completed) portion up to current point
  let solidPath = '';
  if (currentPt) {
    const t = progress / 100;
    // Quadratic Bezier interpolation
    const sx = (1 - t) * (1 - t) * originPt.x + 2 * (1 - t) * t * midX + t * t * destPt.x;
    const sy = (1 - t) * (1 - t) * originPt.y + 2 * (1 - t) * t * midY + t * t * destPt.y;
    solidPath = `M ${originPt.x} ${originPt.y} Q ${midX} ${midY} ${sx} ${sy}`;
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-gray-50 border border-gray-200">
      {/* Grid background */}
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="block"
        role="img"
        aria-label="Delivery route map"
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Decorative landmass shapes */}
        <ellipse cx="60" cy="80" rx="45" ry="35" fill="#dcfce7" opacity="0.5" />
        <ellipse cx="250" cy="200" rx="50" ry="40" fill="#fef3c7" opacity="0.4" />
        <ellipse cx="160" cy="150" rx="35" ry="28" fill="#dcfce7" opacity="0.3" />

        {/* Dashed route (full) */}
        <path
          d={fullDashedPath}
          fill="none"
          stroke="#d1d5db"
          strokeWidth="2"
          strokeDasharray="5 4"
        />

        {/* Solid route (completed portion) */}
        {solidPath && (
          <path
            d={solidPath}
            fill="none"
            stroke="#15803d"
            strokeWidth="2.5"
          />
        )}

        {/* Origin marker */}
        <g>
          <circle cx={originPt.x} cy={originPt.y} r="8" fill="#15803d" />
          <circle cx={originPt.x} cy={originPt.y} r="14" fill="#15803d" opacity="0.2" />
          <text x={originPt.x} y={originPt.y - 16} textAnchor="middle" className="fill-gray-700 text-[9px] font-semibold">
            Start
          </text>
        </g>

        {/* Current location marker */}
        {currentPt && (
          <g>
            <circle cx={currentPt.x} cy={currentPt.y} r="7" fill="#eab308" />
            <circle cx={currentPt.x} cy={currentPt.y} r="13" fill="#eab308" opacity="0.25">
              <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <g transform={`translate(${currentPt.x - 10}, ${currentPt.y - 10})`}>
              <rect width="20" height="20" rx="4" fill="#eab308" />
              <g transform="translate(2, 2)">
                <Package className="w-4 h-4 text-white" />
              </g>
            </g>
          </g>
        )}

        {/* Destination marker */}
        <g>
          <circle cx={destPt.x} cy={destPt.y} r="8" fill="#ef4444" />
          <circle cx={destPt.x} cy={destPt.y} r="14" fill="#ef4444" opacity="0.2" />
          <text x={destPt.x} y={destPt.y - 16} textAnchor="middle" className="fill-gray-700 text-[9px] font-semibold">
            End
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur rounded-lg px-2 py-1.5 flex items-center gap-3 text-[10px] text-gray-600 shadow-sm">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-green-700" /> Origin
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-yellow-500" /> Current
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-red-500" /> Dest
        </span>
      </div>
    </div>
  );
}
