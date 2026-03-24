'use client';

import { useState, FormEvent, useMemo } from 'react';
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
  images: string[];
  videoUrl: string;
  isFeatured: boolean;
  isActive: boolean;
}

const defaultForm: PropertyFormData = {
  title: '', slug: '', description: '', type: 'OFFICE', listingType: 'RENT',
  price: '', rentPerMonth: '', carpetArea: '', superArea: '',
  floor: '', totalFloors: '', location: '', city: 'Noida',
  latitude: '', longitude: '', amenities: [], furnished: 'FURNISHED',
  possession: 'Ready to Move', facing: '', parking: '', washrooms: '',
  mainImageUrl: '', images: [], videoUrl: '', isFeatured: false, isActive: true,
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
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const imagePreviews = useMemo(() => {
    if (form.images.length > 0) {
      return form.images;
    }
    return form.mainImageUrl ? [form.mainImageUrl] : [];
  }, [form.images, form.mainImageUrl]);

  function handleChange(key: keyof PropertyFormData, value: string | boolean | string[]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleTitleBlur() {
    if (!isEdit && !form.slug) {
      handleChange('slug', generateSlug(form.title));
    }
  }

  async function handleImagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const data = new FormData();
        data.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: data,
        });

        if (!res.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const payload = await res.json();
        if (payload?.url) {
          uploadedUrls.push(payload.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setForm(prev => {
          const nextImages = [...prev.images, ...uploadedUrls];
          return {
            ...prev,
            images: nextImages,
            mainImageUrl: nextImages[0] || prev.mainImageUrl,
          };
        });
        toast.success(`${uploadedUrls.length} image${uploadedUrls.length > 1 ? 's' : ''} uploaded`);
      }
    } catch {
      toast.error('Failed to upload image(s)');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        throw new Error('Failed to upload video');
      }

      const payload = await res.json();
      if (payload?.url) {
        handleChange('videoUrl', payload.url);
        toast.success('Video uploaded');
      }
    } catch {
      toast.error('Failed to upload video');
    } finally {
      setUploadingVideo(false);
      e.target.value = '';
    }
  }

  function removeImage(index: number) {
    setForm(prev => {
      const nextImages = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: nextImages,
        mainImageUrl: nextImages[0] || '',
      };
    });
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
      images: form.images.map((url, index) => ({ url, order: index })),
      mainImageUrl: form.images[0] || form.mainImageUrl,
      videoUrl: form.videoUrl || null,
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
          <label>Upload Image Files *</label>
          <input
            className="input-field"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesUpload}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            You can select multiple images at once. First image is used as cover.
          </span>
        </div>

        {imagePreviews.length > 0 && (
          <div className="image-grid">
            {imagePreviews.map((url, index) => (
              <div key={`${url}-${index}`} className="image-tile">
                <img src={url} alt={`Property image ${index + 1}`} className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeImage(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {!imagePreviews.length && (
          <div style={{ fontSize: '0.85rem', color: 'var(--error)' }}>
            Please upload at least one image.
          </div>
        )}

        {uploading && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Uploading images...
          </div>
        )}

        <div className="form-group" style={{ marginTop: '0.9rem' }}>
          <label>Fallback Cover Image URL</label>
          <input
            className="input-field"
            value={form.mainImageUrl}
            onChange={e => handleChange('mainImageUrl', e.target.value)}
            placeholder="Used if no uploaded images exist"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Video (Optional)</h3>
        <div className="form-group">
          <label>Upload Property Video</label>
          <input
            className="input-field"
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            This is optional. Add a short walkthrough video if available.
          </span>
        </div>

        {uploadingVideo && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Uploading video...
          </div>
        )}

        {form.videoUrl && (
          <div className="form-group" style={{ marginTop: '0.9rem' }}>
            <label>Uploaded Video Preview</label>
            <video controls className="video-preview" src={form.videoUrl} />
            <button
              type="button"
              className="remove-image-btn"
              onClick={() => handleChange('videoUrl', '')}
              style={{ maxWidth: '180px', border: '1px solid var(--border)' }}
            >
              Remove Video
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={loading || uploading || uploadingVideo || (!form.images.length && !form.mainImageUrl)}
        style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}
      >
        {loading ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
      </button>

      <style jsx>{`
        .property-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 980px;
          margin: 0 auto;
          padding-bottom: 2rem;
        }
        .form-section {
          background:
            radial-gradient(circle at top right, rgba(var(--accent-rgb), 0.08), transparent 40%),
            var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 1.35rem;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
        }
        .form-section h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
          letter-spacing: 0.01em;
        }
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.95rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); }
        .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; margin-top: 0.75rem; }
        .image-tile { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: var(--bg-primary); }
        .image-preview { width: 100%; height: 105px; object-fit: cover; display: block; }
        .remove-image-btn {
          width: 100%; border: none; border-top: 1px solid var(--border); padding: 0.45rem;
          background: transparent; color: var(--text-secondary); font-size: 0.8rem; cursor: pointer;
        }
        .remove-image-btn:hover { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
        .video-preview {
          width: 100%; max-width: 360px; border: 1px solid var(--border); border-radius: 10px;
          background: #000;
        }
        @media (max-width: 640px) {
          .property-form { gap: 1rem; }
          .form-section { padding: 1rem; border-radius: 14px; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </form>
  );
}
