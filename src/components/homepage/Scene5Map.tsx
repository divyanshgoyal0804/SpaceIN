import Link from 'next/link';

const pins = [
  { name: 'Sector 62', x: '45%', y: '30%', lat: 28.6272, lng: 77.3648 },
  { name: 'Sector 63', x: '52%', y: '35%', lat: 28.6235, lng: 77.3726 },
  { name: 'Sector 135', x: '60%', y: '55%', lat: 28.5172, lng: 77.3915 },
  { name: 'Sector 18', x: '35%', y: '50%', lat: 28.5707, lng: 77.3219 },
  { name: 'Sector 80', x: '48%', y: '60%', lat: 28.5362, lng: 77.3541 },
];

const propertyCards = [
  {
    title: 'Corporate Office · Sector 62',
    type: 'Office',
    area: '1,800 sq ft',
    price: '₹82,000/month',
    slug: 'premium-office-sector-62',
  },
  {
    title: 'Coworking Hub · Sector 63',
    type: 'Coworking',
    area: '150 sq ft',
    price: '₹12,000/month',
    slug: 'coworking-hub-sector-63',
  },
  {
    title: 'Retail Space · Sector 18',
    type: 'Retail',
    area: '1,800 sq ft',
    price: '₹1,50,000/month',
    slug: 'retail-showroom-sector-18',
  },
];

export default function Scene5Map() {
  return (
    <section className="map-scene" data-scene="map">
      <div className="map-layout">
        {/* Map Area */}
        <div className="map-container">
          {/* SVG Map of Noida */}
          <svg viewBox="0 0 600 500" className="noida-map" aria-label="Map of Noida sectors">
            {/* Background */}
            <rect width="600" height="500" fill="#0d0d1a" rx="12" />

            {/* Road network */}
            <path d="M0 250 L600 250" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <path d="M300 0 L300 500" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <path d="M100 0 L500 500" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
            <path d="M500 0 L100 500" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />

            {/* Noida Expressway */}
            <path
              d="M200 0 C250 100, 350 200, 400 500"
              stroke="rgba(1,114,150,0.2)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="8 4"
            />

            {/* Sector blocks */}
            <rect x="220" y="120" width="80" height="60" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
            <rect x="310" y="130" width="70" height="55" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
            <rect x="150" y="220" width="90" height="70" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
            <rect x="320" y="260" width="85" height="60" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />
            <rect x="250" y="340" width="75" height="55" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" />

            {/* Labels */}
            <text x="300" y="30" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="14" fontWeight="600">NOIDA</text>
          </svg>

          {/* Heatmap */}
          <div className="heatmap-overlay">
            <div className="heatmap-zone" style={{ left: '40%', top: '25%' }} />
            <div className="heatmap-zone heatmap-zone--sm" style={{ left: '50%', top: '30%' }} />
          </div>

          {/* Map Pins */}
          {pins.map((pin, i) => (
            <div
              key={i}
              className="map-pin-drop"
              style={{ left: pin.x, top: pin.y }}
            >
              <div className="pin-icon">
                <svg width="24" height="32" viewBox="0 0 24 32" fill="var(--accent)">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0zm0 16a4 4 0 110-8 4 4 0 010 8z" />
                </svg>
              </div>
              <span className="pin-label">{pin.name}</span>
            </div>
          ))}
        </div>

        {/* Property Cards Panel */}
        <div className="map-cards">
          <h3 className="map-cards__title">Featured in this area</h3>
          {propertyCards.map((card, i) => (
            <Link
              key={i}
              href={`/properties/${card.slug}`}
              className="map-property-card glass-card"
            >
              <div className="map-property-card__badge">{card.type}</div>
              <h4 className="map-property-card__title">{card.title}</h4>
              <div className="map-property-card__details">
                <span>{card.area}</span>
                <span className="map-property-card__price">{card.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
