const cards = [
  { icon: 'Rs', text: 'Rs45/sq ft · Sector 62 Noida', sub: 'Starting rental price' },
  { icon: 'Sq', text: '2,400 sq ft · Fully Furnished', sub: 'Premium workspace' },
  { icon: '24', text: '24x7 Security · Power Backup · Parking', sub: 'Enterprise amenities' },
];

export default function Scene4Interior() {
  return (
    <section className="interior-scene" data-scene="interior">
      <div id="interior-desk" className="interior-layer interior-layer--desk">
        <div className="desk-bg" />
      </div>

      <div id="interior-people" className="interior-layer interior-layer--people">
        <div className="people-silhouettes">
          <div className="silhouette" style={{ left: '20%', height: '60%' }} />
          <div className="silhouette" style={{ left: '35%', height: '55%' }} />
          <div className="silhouette" style={{ left: '65%', height: '58%' }} />
          <div className="silhouette" style={{ left: '80%', height: '52%' }} />
        </div>
      </div>

      <div id="interior-lights" className="interior-layer interior-layer--lights">
        <div className="bokeh-overlay" />
      </div>

      <div className="interior-cards">
        {cards.map((card, i) => (
          <div key={i} className="interior-card glass-card">
            <div className="interior-card__icon">{card.icon}</div>
            <div>
              <div className="interior-card__text">{card.text}</div>
              <div className="interior-card__sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
