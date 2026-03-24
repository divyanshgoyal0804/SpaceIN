const propertyTypes = [
  {
    name: 'Office',
    features: ['Grade A glass facade', 'High-speed connectivity', 'Premium interiors'],
    color: '#60a5fa',
    shape: { width: 120, height: 280, rx: 4 },
  },
  {
    name: 'Coworking',
    features: ['Flexible seating', 'Community events', 'All-inclusive pricing'],
    color: '#c084fc',
    shape: { width: 120, height: 240, rx: 4 },
  },
  {
    name: 'Retail',
    features: ['High-street frontage', 'Heavy foot traffic', 'Brand visibility'],
    color: '#fbbf24',
    shape: { width: 180, height: 140, rx: 4 },
  },
  {
    name: 'Warehouse',
    features: ['High ceiling clearance', 'Loading bays', 'Industrial power'],
    color: '#9ca3af',
    shape: { width: 200, height: 120, rx: 2 },
  },
];

export default function Scene3Transformation() {
  return (
    <section className="transform-scene" data-scene="transform">
      <div className="transform-content">
        {/* Central building display */}
        <div className="building-display">
          {propertyTypes.map((type, i) => (
            <div key={i} className={`building-type building-type-${i}`}>
              <svg viewBox="0 0 300 400" className="building-svg">
                <defs>
                  <linearGradient id={`buildGrad${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={type.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={type.color} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <rect
                  x={(300 - type.shape.width) / 2}
                  y={400 - type.shape.height - 20}
                  width={type.shape.width}
                  height={type.shape.height}
                  rx={type.shape.rx}
                  fill={`url(#buildGrad${i})`}
                  stroke={type.color}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
                {/* Windows */}
                {Array.from({ length: Math.floor(type.shape.height / 30) }).map((_, ri) =>
                  Array.from({ length: Math.floor(type.shape.width / 25) }).map((_, ci) => (
                    <rect
                      key={`${ri}-${ci}`}
                      x={(300 - type.shape.width) / 2 + 10 + ci * 25}
                      y={400 - type.shape.height - 10 + ri * 30}
                      width={8}
                      height={12}
                      rx={1}
                      fill={type.color}
                      fillOpacity={(ri + ci + i) % 2 === 0 ? 0.4 : 0.1}
                    />
                  ))
                )}
              </svg>
            </div>
          ))}
        </div>

        {/* Text info panels */}
        {propertyTypes.map((type, i) => (
          <div
            key={i}
            className={`type-info type-info-${i}`}
            style={{
              [i % 2 === 0 ? 'left' : 'right']: '5%',
              [i % 2 === 0 ? 'right' : 'left']: 'auto',
            }}
          >
            <h2 className="type-name" style={{ color: type.color }}>
              {type.name}
            </h2>
            <div className="type-features glass-card">
              {type.features.map((f, fi) => (
                <div key={fi} className="feature-item">
                  <div className="feature-dot" style={{ background: type.color }} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
