const stats = [
  { target: 500, suffix: '+', label: 'Properties Listed' },
  { target: 1, suffix: '', label: 'City Covered', tagline: 'and growing' },
  { target: 1200, suffix: '+', label: 'Businesses Served' },
];

const industries = ['Tech', 'Finance', 'Retail', 'Logistics', 'Healthcare'];

export default function Scene6DataViz() {
  return (
    <section className="dataviz-scene" data-scene="dataviz">
      <div className="dataviz-content">
        <h2 className="dataviz-heading">
          Trusted by <span className="text-gradient">businesses</span> across Noida
        </h2>

        {/* Counter cards */}
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card glass-card">
              <div className="stat-number">
                {stat.target.toLocaleString('en-IN')}
                {stat.suffix}
              </div>
              <div className="stat-label">{stat.label}</div>
              {stat.tagline && <div className="stat-tagline">{stat.tagline}</div>}
            </div>
          ))}
        </div>

        {/* Line graph */}
        <div className="graph-container">
          <svg viewBox="0 0 500 150" className="graph-svg">
            <defs>
              <linearGradient id="graphGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="graphFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                y1={i * 50}
                x2="500"
                y2={i * 50}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.5"
              />
            ))}

            {/* Fill area */}
            <path
              d="M0 140 L60 120 L120 110 L180 90 L240 70 L300 50 L360 35 L420 25 L480 15 L500 10 L500 150 L0 150 Z"
              fill="url(#graphFill)"
            />

            {/* Line */}
            <path
              className="graph-line"
              d="M0 140 L60 120 L120 110 L180 90 L240 70 L300 50 L360 35 L420 25 L480 15 L500 10"
              fill="none"
              stroke="url(#graphGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="500"
              strokeDashoffset="0"
            />

            {/* Data points */}
            {[
              [0, 140], [60, 120], [120, 110], [180, 90], [240, 70],
              [300, 50], [360, 35], [420, 25], [480, 15],
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="3" fill="var(--accent)" />
            ))}
          </svg>
          <div className="graph-label">Properties Listed Over Time</div>
        </div>

        {/* Industry icons */}
        <div className="industries">
          {industries.map((ind, i) => (
            <div key={i} className="industry-icon glass">
              {ind}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
