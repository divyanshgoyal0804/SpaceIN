'use client';
import { useState } from 'react';

export default function AIDemoPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setExplanation(null);
    setProperties([]);
    setFilters(null);

    try {
      // 1. Parse Query
      const parseRes = await fetch('/api/ai/parse-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const parseData = await parseRes.json();
      setFilters(parseData.filters);

      // 2. Fetch DB
      const searchRes = await fetch('/api/ai/search-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parseData.filters)
      });
      const searchData = await searchRes.json();
      setProperties(searchData.properties);

      // 3. Explain Results
      const explainRes = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: parseData.filters.intent,
          properties: searchData.properties
        })
      });
      const explainData = await explainRes.json();
      setExplanation(explainData.explanation);

    } catch (err) {
      console.error(err);
      setExplanation("Sorry, something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>AI Property Search</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input 
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. I want to buy a luxury showroom near the metro under 5 crores"
          style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {filters && (
        <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '4px', marginBottom: '24px', fontSize: '14px' }}>
          <strong>Extracted Filters (JSON):</strong>
          <pre style={{ margin: 0, marginTop: '8px', whiteSpace: 'pre-wrap' }}>{JSON.stringify(filters, null, 2)}</pre>
        </div>
      )}

      {explanation && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#b45309' }}>AI Explanation</h2>
          <p style={{ margin: 0, color: '#92400e', lineHeight: 1.5 }}>{explanation}</p>
        </div>
      )}

      {properties.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {properties.map(p => (
            <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src={p.mainImageUrl || '/placeholder.jpg'} alt={p.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{p.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>{p.location}</p>
                <div style={{ fontWeight: 'bold', color: '#111827' }}>
                  {p.price ? `₹${p.price.toLocaleString()}` : p.rentPerMonth ? `₹${p.rentPerMonth.toLocaleString()}/mo` : 'Price upon request'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && explanation && <p>No exact property matches found.</p>
      )}
    </div>
  );
}
