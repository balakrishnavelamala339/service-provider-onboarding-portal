import { useEffect, useState } from 'react';
import api from '../api/axios';
import { fileUrl } from '../api/fileUrl';

const CATEGORY_OPTIONS = ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'AC Repair'];

export default function ProviderDashboard() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [docType, setDocType] = useState('ID Proof');

  const loadProfile = async () => {
    const res = await api.get('/provider/profile');
    setProfile(res.data);
    setForm({
      phone: res.data.phone || '',
      categories: res.data.categories || [],
      skills: res.data.skills || [],
      experienceYears: res.data.experienceYears || 0,
      location: res.data.location || { city: '', state: '', pincode: '' },
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const locked = profile?.status === 'approved' || profile?.status === 'pending';

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setForm((f) => ({ ...f, skills: [...f.skills, skillInput.trim()] }));
    setSkillInput('');
  };

  const removeSkill = (s) => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.put('/provider/profile', form);
      setProfile(res.data);
      setMessage('Profile saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile');
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      await api.post('/provider/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Photo upload failed');
    }
  };

  const uploadDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('document', file);
    fd.append('docType', docType);
    try {
      await api.post('/provider/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Document upload failed');
    }
  };

  const submitApplication = async () => {
    setError('');
    setMessage('');
    try {
      const res = await api.post('/provider/submit');
      setProfile(res.data);
      setMessage('Application submitted for review');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  if (!profile || !form) return <div className="page-loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="status-banner">
        Status: <span className={`badge badge-${profile.status}`}>{profile.status}</span>
        {profile.status === 'rejected' && profile.rejectionRemark && (
          <p className="remark">Reason: {profile.rejectionRemark}</p>
        )}
      </div>

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <form className="profile-form" onSubmit={saveProfile}>
        <h3>Profile Details</h3>

        <label>
          Phone
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={locked}
          />
        </label>

        <fieldset disabled={locked}>
          <legend>Service Categories</legend>
          {CATEGORY_OPTIONS.map((cat) => (
            <label key={cat} className="checkbox-label">
              <input
                type="checkbox"
                checked={form.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>
          ))}
        </fieldset>

        <label>
          Experience (years)
          <input
            type="number"
            min="0"
            value={form.experienceYears}
            onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
            disabled={locked}
          />
        </label>

        <div className="skills-box">
          <label>Skills</label>
          <div className="skill-input-row">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. Pipe fitting"
              disabled={locked}
            />
            <button type="button" onClick={addSkill} disabled={locked}>
              Add
            </button>
          </div>
          <div className="chips">
            {form.skills.map((s) => (
              <span key={s} className="chip">
                {s}
                {!locked && <button type="button" onClick={() => removeSkill(s)}>x</button>}
              </span>
            ))}
          </div>
        </div>

        <h4>Service Location</h4>
        <label>
          City
          <input
            value={form.location.city}
            onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })}
            disabled={locked}
          />
        </label>
        <label>
          State
          <input
            value={form.location.state}
            onChange={(e) => setForm({ ...form, location: { ...form.location, state: e.target.value } })}
            disabled={locked}
          />
        </label>
        <label>
          Pincode
          <input
            value={form.location.pincode}
            onChange={(e) =>
              setForm({ ...form, location: { ...form.location, pincode: e.target.value } })
            }
            disabled={locked}
          />
        </label>

        <button type="submit" disabled={locked}>
          Save Profile
        </button>
      </form>

      <div className="upload-section">
        <h3>Profile Photo</h3>
        {profile.profilePhoto && (
          <img src={fileUrl(profile.profilePhoto)} alt="profile" className="preview-photo" />
        )}
        <input type="file" accept="image/*" onChange={uploadPhoto} disabled={locked} />
      </div>

      <div className="upload-section">
        <h3>Verification Documents</h3>
        <ul className="doc-list">
          {profile.documents.map((d, i) => (
            <li key={i}>
              {d.docType} — <a href={fileUrl(d.fileUrl)} target="_blank" rel="noreferrer">view</a>
            </li>
          ))}
        </ul>
        <select value={docType} onChange={(e) => setDocType(e.target.value)} disabled={locked}>
          <option>ID Proof</option>
          <option>Address Proof</option>
          <option>Certification</option>
          <option>Other</option>
        </select>
        <input type="file" accept="image/*,.pdf" onChange={uploadDoc} disabled={locked} />
      </div>

      {profile.status === 'incomplete' && (
        <button className="submit-btn" onClick={submitApplication}>
          Submit Application
        </button>
      )}
    </div>
  );
}