'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { generateSlug, allAmenities, facingDirections } from '@/lib/utils';

interface PropertyFormData {
  title: string;
  slug: string;
  description: string;
  type: string;
  listingType: string;
  price: string;
  rentPerMonth: string;
  carpetArea: string;
  superArea: string;
  floor: string;
  totalFloors: string;
  location: string;
  city: string;
  latitude: string;
  longitude: string;
  amenities: string[];
  furnished: string;
  possession: string;
  facing: string;
  parking: string;
  washrooms: string;
  mainImageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
}

const defaultForm: PropertyFormData = {
  title: '', slug: '', description: '', type: 'OFFICE', listingType: 'RENT',
  price: '', rentPerMonth: '', carpetArea: '', superArea: '',
  floor: '', totalFloors: '', location: '', city: 'Noida',
  latitude: '', longitude: '', amenities: [], furnished: 'FURNISHED',
  possession: 'Ready to Move', facing: '', parking: '', washrooms: '',
  mainImageUrl: '', isFeatured: false, isActive: true,
};

export default function PropertyFormComponent({
  initialData,
  isEdit = false,
  propertyId,
}: {
  initialData?: Partial<PropertyFormData>;
  isEdit?: boolean;
  propertyId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<PropertyFormData>({ ...defaultForm, ...initialData });
  const [loading, setLoading] = useState(false);

  function handleChange(key: keyof PropertyFormData, value: string | boolean | string[]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleTitleBlur() {
    if (!isEdit && !form.slug) {
      handleChange('slug', generateSlug(form.title));
    }
  }

  function toggleAmenity(amenity: string) {
    const current = form.amenities;
    if (current.includes(amenity)) {
      handleChange('amenities', current.filter(a => a !== amenity));
    } else {
      handleChange('amenities', [...current, amenity]);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      rentPerMonth: form.rentPerMonth ? parseFloat(form.rentPerMonth) : null,
      carpetArea: parseFloat(form.carpetArea),
      superArea: form.superArea ? parseFloat(form.superArea) : null,
      floor: form.floor ? parseInt(form.floor) : null,
      totalFloors: form.totalFloors ? parseInt(form.totalFloors) : null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      parking: form.parking ? parseInt(form.parking) : null,
      washrooms: form.washrooms ? parseInt(form.washrooms) : null,
    };

    try {
      const url = isEdit ? `/api/properties/${propertyId}` : '/api/properties';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(isEdit ? 'Property updated!' : 'Property created!');
        router.push('/admin/properties');
      } else {
        toast.error('Failed to save property');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="property-form">
      {/* Section 1: Basic Info */}
      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-grid">
          <div className="form-group full">
            <label>Title *</label>
            <input className="input-field" value={form.title} onChange={e => handleChange('title', e.target.value)} onBlur={handleTitleBlur} required />
          </div>
          <div className="form-group full">
            <label>Slug *</label>
            <input className="input-field" value={form.slug} onChange={e => handleChange('slug', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Property Type *</label>
            <select className="input-field" value={form.type} onChange={e => handleChange('type', e.target.value)}>
              {['OFFICE', 'COWORKING', 'RETAIL', 'WAREHOUSE', 'SHOWROOM', 'PLOT'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Listing Type *</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['SALE', 'RENT', 'BOTH'].map(lt => (
                <button key={lt} type="button" className={`filter-toggle ${form.listingType === lt ? 'filter-toggle--active' : ''}`}
                  onClick={() => handleChange('listingType', lt)} style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '8px', background: form.listingType === lt ? 'rgba(1,114,150,0.1)' : 'transparent', color: form.listingType === lt ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>
                  {lt}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group full">
            <label>Description *</label>
            <textarea className="input-field" rows={4} value={form.description} onChange={e => handleChange('description', e.target.value)} required style={{ resize: 'vertical' }} />
          </div>
        </div>
      </div>

      {/* Section 2: Pricing */}
      <div className="form-section">
        <h3>Pricing</h3>
        <div className="form-grid">
          {(form.listingType === 'SALE' || form.listingType === 'BOTH') && (
            <div className="form-group">
              <label>Sale Price (₹)</label>
              <input className="input-field" type="number" value={form.price} onChange={e => handleChange('price', e.target.value)} />
            </div>
          )}
          {(form.listingType === 'RENT' || form.listingType === 'BOTH') && (
            <div className="form-group">
              <label>Rent Per Month (₹)</label>
              <input className="input-field" type="number" value={form.rentPerMonth} onChange={e => handleChange('rentPerMonth', e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Area & Dimensions */}
      <div className="form-section">
        <h3>Area & Dimensions</h3>
        <div className="form-grid">
          <div className="form-group"><label>Carpet Area (sq ft) *</label><input className="input-field" type="number" value={form.carpetArea} onChange={e => handleChange('carpetArea', e.target.value)} required /></div>
          <div className="form-group"><label>Super Area (sq ft)</label><input className="input-field" type="number" value={form.superArea} onChange={e => handleChange('superArea', e.target.value)} /></div>
          <div className="form-group"><label>Floor Number</label><input className="input-field" type="number" value={form.floor} onChange={e => handleChange('floor', e.target.value)} /></div>
          <div className="form-group"><label>Total Floors</label><input className="input-field" type="number" value={form.totalFloors} onChange={e => handleChange('totalFloors', e.target.value)} /></div>
          <div className="form-group"><label>Facing</label>
            <select className="input-field" value={form.facing} onChange={e => handleChange('facing', e.target.value)}>
              <option value="">Select</option>
              {facingDirections.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Parking Slots</label><input className="input-field" type="number" value={form.parking} onChange={e => handleChange('parking', e.target.value)} /></div>
          <div className="form-group"><label>Washrooms</label><input className="input-field" type="number" value={form.washrooms} onChange={e => handleChange('washrooms', e.target.value)} /></div>
        </div>
      </div>

      {/* Section 4: Status & Features */}
      <div className="form-section">
        <h3>Status & Features</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Furnished Status *</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['FURNISHED', 'SEMI_FURNISHED', 'BARE_SHELL'].map(f => (
                <button key={f} type="button" style={{ padding: '0.4rem 0.8rem', border: '1px solid var(--border)', borderRadius: '8px', background: form.furnished === f ? 'rgba(1,114,150,0.1)' : 'transparent', color: form.furnished === f ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}
                  onClick={() => handleChange('furnished', f)}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group"><label>Possession</label><input className="input-field" value={form.possession} onChange={e => handleChange('possession', e.target.value)} /></div>
          <div className="form-group full">
            <label>Amenities</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {allAmenities.map(a => (
                <button key={a} type="button" style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: '20px', background: form.amenities.includes(a) ? 'rgba(1,114,150,0.1)' : 'transparent', color: form.amenities.includes(a) ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}
                  onClick={() => toggleAmenity(a)}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.isFeatured} onChange={e => handleChange('isFeatured', e.target.checked)} />
              Featured Property
            </label>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.isActive} onChange={e => handleChange('isActive', e.target.checked)} />
              Active
            </label>
          </div>
        </div>
      </div>

      {/* Section 5: Location */}
      <div className="form-section">
        <h3>Location</h3>
        <div className="form-grid">
          <div className="form-group"><label>Location *</label><input className="input-field" value={form.location} onChange={e => handleChange('location', e.target.value)} required placeholder="e.g. Sector 62, Noida" /></div>
          <div className="form-group"><label>City</label><input className="input-field" value={form.city} onChange={e => handleChange('city', e.target.value)} /></div>
          <div className="form-group"><label>Latitude</label><input className="input-field" type="number" step="any" value={form.latitude} onChange={e => handleChange('latitude', e.target.value)} /></div>
          <div className="form-group"><label>Longitude</label><input className="input-field" type="number" step="any" value={form.longitude} onChange={e => handleChange('longitude', e.target.value)} /></div>
        </div>
      </div>

      {/* Section 6: Images */}
      <div className="form-section">
        <h3>Images</h3>
        <div className="form-group">
          <label>Main Image URL *</label>
          <input className="input-field" value={form.mainImageUrl} onChange={e => handleChange('mainImageUrl', e.target.value)} required placeholder="https://..." />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
        {loading ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
      </button>

      <style jsx>{`
        .property-form { display: flex; flex-direction: column; gap: 2rem; max-width: 800px; }
        .form-section { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; }
        .form-section h3 { font-size: 1rem; margin-bottom: 1.25rem; color: var(--text-primary); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.35rem; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label { font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); }
        @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </form>
  );
}
