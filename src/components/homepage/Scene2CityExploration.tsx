const categories = [
  { label: 'Office Spaces', x: '20%', y: '35%', color: '#60a5fa' },
  { label: 'Retail Outlets', x: '70%', y: '40%', color: '#fbbf24' },
  { label: 'Warehouses', x: '30%', y: '65%', color: '#9ca3af' },
  { label: 'Coworking Hubs', x: '60%', y: '25%', color: '#c084fc' },
  { label: 'Showrooms', x: '80%', y: '60%', color: '#f472b6' },
];

export default function Scene2CityExploration() {
  return (
    <section className="city-scene" data-scene="city">
      <div className="city-grid">
        {/* Isometric city grid SVG */}
        <svg viewBox="0 0 800 600" className="city-svg" aria-hidden="true">
          {/* Grid lines */}
          <defs>
            <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(1,114,150,0.1)" />
              <stop offset="100%" stopColor="rgba(1,114,150,0.02)" />
            </linearGradient>
          </defs>

          {/* Ground grid */}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={300 + i * 25}
              x2="800"
              y2={300 + i * 25}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 55}
              y1="300"
              x2={i * 55}
              y2="600"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
          ))}

          {/* Buildings */}
          <rect x="100" y="200" width="50" height="160" rx="2" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <rect x="160" y="140" width="60" height="220" rx="2" fill="#15152a" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <rect x="230" y="180" width="45" height="180" rx="2" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <rect x="290" y="120" width="55" height="240" rx="2" fill="#121228" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <rect x="360" y="160" width="50" height="200" rx="2" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <rect x="425" y="100" width="65" height="260" rx="2" fill="#15152a" stroke="rgba(1,114,150,0.15)" strokeWidth="1" />
          <rect x="505" y="170" width="50" height="190" rx="2" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <rect x="570" y="130" width="55" height="230" rx="2" fill="#121228" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <rect x="640" y="190" width="48" height="170" rx="2" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />

          {/* Building windows (dots of light) */}
          {[
            { bx: 110, by: 210, w: 30, h: 140, cols: 3, rows: 8 },
            { bx: 170, by: 150, w: 40, h: 200, cols: 4, rows: 12 },
            { bx: 300, by: 130, w: 35, h: 220, cols: 3, rows: 14 },
            { bx: 435, by: 110, w: 45, h: 240, cols: 4, rows: 15 },
            { bx: 580, by: 140, w: 35, h: 210, cols: 3, rows: 13 },
          ].map((b, bi) =>
            Array.from({ length: b.rows }).map((_, ri) =>
              Array.from({ length: b.cols }).map((_, ci) => (
                <rect
                  key={`win-${bi}-${ri}-${ci}`}
                  x={b.bx + ci * (b.w / b.cols)}
                  y={b.by + ri * (b.h / b.rows)}
                  width={3}
                  height={3}
                  rx={0.5}
                      fill={(bi + ri + ci) % 3 === 0 ? 'rgba(1,114,150,0.3)' : 'rgba(255,255,255,0.08)'}
                />
              ))
            )
          )}
        </svg>

        {/* Map Pins */}
        {categories.map((cat, i) => (
          <div
            key={i}
            className={`map-pin map-pin-${i}`}
            style={{ left: cat.x, top: cat.y }}
          >
            <div className="pin-marker" style={{ background: cat.color }}>
              <div className="pin-pulse" style={{ background: cat.color }} />
            </div>
            <div className={`category-label category-label-${i} glass`}>
              <span style={{ color: cat.color, fontWeight: 600 }}>{cat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
