import Link from 'next/link';

export default function Scene8CTA() {
  // Generate window positions for buildings
  const windows = [];
  const buildings = [
    { x: 5, w: 8, h: 45, floors: 12, cols: 3 },
    { x: 14, w: 10, h: 55, floors: 15, cols: 4 },
    { x: 25, w: 7, h: 35, floors: 10, cols: 3 },
    { x: 33, w: 12, h: 60, floors: 16, cols: 5 },
    { x: 46, w: 9, h: 50, floors: 14, cols: 4 },
    { x: 56, w: 11, h: 42, floors: 12, cols: 4 },
    { x: 68, w: 8, h: 58, floors: 16, cols: 3 },
    { x: 77, w: 10, h: 38, floors: 10, cols: 4 },
    { x: 88, w: 9, h: 52, floors: 14, cols: 3 },
  ];

  for (const b of buildings) {
    for (let row = 0; row < b.floors; row++) {
      for (let col = 0; col < b.cols; col++) {
        windows.push({
          left: `${b.x + col * (b.w / b.cols) + 0.5}%`,
          bottom: `${(row + 1) * (b.h / b.floors)}%`,
          color: (row + col) % 3 === 0
            ? 'rgba(var(--accent-rgb), 0.7)'
            : (row + col) % 3 === 1
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(var(--accent-rgb), 0.4)',
        });
      }
    }
  }

  const headline = 'Find the Space Where Your Business Grows';

  return (
    <section className="cta-scene" data-scene="cta">
      {/* City skyline background */}
      <div className="cta-skyline">
        {/* Gradient sky */}
        <div className="cta-sky" />

        {/* Buildings silhouette */}
        <div className="cta-buildings">
          {buildings.map((b, i) => (
            <div
              key={i}
              className="building-silhouette"
              style={{
                left: `${b.x}%`,
                width: `${b.w}%`,
                height: `${b.h}%`,
              }}
            />
          ))}
        </div>

        {/* Window lights */}
        {windows.map((w, i) => (
          <div
            key={i}
            className="window-light"
            style={{
              left: w.left,
              bottom: w.bottom,
              backgroundColor: w.color,
            }}
          />
        ))}
      </div>

      {/* Content overlay */}
      <div className="cta-content">
        <h2 className="cta-headline">
          {headline.split(' ').map((word, i) => (
            <span key={i} className="cta-word">
              {word}{' '}
            </span>
          ))}
        </h2>

        <div className="cta-buttons">
          <Link href="/properties" className="cta-main-btn">
            Explore Spaces in Noida
          </Link>
          <Link href="/chat" className="cta-secondary-link">
            Chat with our AI →
          </Link>
        </div>
      </div>
    </section>
  );
}
