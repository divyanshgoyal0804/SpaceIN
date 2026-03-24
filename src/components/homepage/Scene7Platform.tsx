const filterPills = ['Budget', 'Area', 'Type', 'Furnished'];

const mockCards = [
  { title: 'Premium Office · Sector 62', area: '2,400 sq ft', price: '₹85,000/mo', type: 'Office' },
  { title: 'Coworking Hub · Sector 63', area: '150 sq ft', price: '₹12,000/mo', type: 'Coworking' },
  { title: 'Retail Showroom · Sector 18', area: '1,800 sq ft', price: '₹1,50,000/mo', type: 'Retail' },
  { title: 'Auto Showroom · Sec 135', area: '5,000 sq ft', price: '₹4.5 Cr', type: 'Showroom' },
  { title: 'Warehouse · Sector 80', area: '8,000 sq ft', price: '₹2,00,000/mo', type: 'Warehouse' },
  { title: 'Commercial Plot · Sec 142', area: '12,000 sq ft', price: '₹8 Cr', type: 'Plot' },
];

export default function Scene7Platform() {
  return (
    <section className="platform-scene" data-scene="platform">
      <div className="platform-content">
        <h2 className="platform-heading">
          One platform. <span className="text-gradient">Every space.</span>
        </h2>

        <div className="mock-frame">
          {/* Nav bar */}
          <div className="mock-nav">
            <div className="mock-logo">SpaceIn</div>
            <div className="mock-nav-links">
              <span>Properties</span>
              <span>Blog</span>
              <span>About</span>
              <span className="mock-nav-highlight">Chat with AI</span>
            </div>
          </div>

          {/* Search */}
          <div className="mock-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span>Search properties in Noida...</span>
          </div>

          {/* Filter pills */}
          <div className="mock-filters">
            {filterPills.map((pill, i) => (
              <div key={i} className="mock-pill">
                {pill}
              </div>
            ))}
          </div>

          {/* Property grid */}
          <div className="mock-grid">
            {mockCards.map((card, i) => (
              <div key={i} className="mock-card">
                <div className={`mock-card__image badge-${card.type.toLowerCase()}`}>
                  <span className="mock-card__badge">{card.type}</span>
                </div>
                <div className="mock-card__body">
                  <div className="mock-card__title">{card.title}</div>
                  <div className="mock-card__meta">
                    <span>{card.area}</span>
                    <span className="mock-card__price">{card.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
