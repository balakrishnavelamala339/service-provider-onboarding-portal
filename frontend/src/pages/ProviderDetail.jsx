import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get(`/admin/providers/${id}`);
    setProvider(res.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const approve = async () => {
    setError('');
    try {
      await api.put(`/admin/providers/${id}/approve`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    }
  };

  const reject = async () => {
    setError('');
    if (!remark.trim()) {
      setError('Add a rejection remark first');
      return;
    }
    try {
      await api.put(`/admin/providers/${id}/reject`, { remark });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Rejection failed');
    }
  };

  if (!provider) return <div className="page-loading">Loading...</div>;

  return (
    <div className="provider-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <div className="detail-header">
        {provider.profilePhoto && <img src={provider.profilePhoto} alt="profile" />}
        <div>
          <h2>{provider.user.name}</h2>
          <p>{provider.user.email}</p>
          <span className={`badge badge-${provider.status}`}>{provider.status}</span>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <h4>Phone</h4>
          <p>{provider.phone || '-'}</p>
        </div>
        <div>
          <h4>Experience</h4>
          <p>{provider.experienceYears} years</p>
        </div>
        <div>
          <h4>Categories</h4>
          <p>{provider.categories.join(', ') || '-'}</p>
        </div>
        <div>
          <h4>Skills</h4>
          <p>{provider.skills.join(', ') || '-'}</p>
        </div>
        <div>
          <h4>Location</h4>
          <p>
            {provider.location.city}, {provider.location.state} {provider.location.pincode}
          </p>
        </div>
      </div>

      <h4>Documents</h4>
      <ul className="doc-list">
        {provider.documents.map((d, i) => (
          <li key={i}>
            {d.docType} —{' '}
            <a href={d.fileUrl} target="_blank" rel="noreferrer">
              view
            </a>
          </li>
        ))}
        {provider.documents.length === 0 && <li>No documents uploaded</li>}
      </ul>

      {error && <p className="error-text">{error}</p>}

      {provider.status === 'pending' && (
        <div className="review-actions">
          <button className="approve-btn" onClick={approve}>
            Approve
          </button>
          <div className="reject-row">
            <input
              placeholder="Rejection remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <button className="reject-btn" onClick={reject}>
              Reject
            </button>
          </div>
        </div>
      )}

      {provider.status === 'rejected' && provider.rejectionRemark && (
        <p className="remark">Rejection reason: {provider.rejectionRemark}</p>
      )}
    </div>
  );
}
