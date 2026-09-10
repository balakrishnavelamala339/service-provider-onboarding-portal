import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const loadStats = async () => {
    const res = await api.get('/admin/stats');
    setStats(res.data);
  };

  const loadProviders = async () => {
    const res = await api.get('/admin/providers', { params: { status, search, page, limit: 8 } });
    setProviders(res.data.providers);
    setPages(res.data.pages);
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadProviders();
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">Total<strong>{stats.total}</strong></div>
          <div className="stat-card">Pending<strong>{stats.pending}</strong></div>
          <div className="stat-card">Approved<strong>{stats.approved}</strong></div>
          <div className="stat-card">Rejected<strong>{stats.rejected}</strong></div>
          <div className="stat-card">Incomplete<strong>{stats.incomplete}</strong></div>
        </div>
      )}

      <div className="filters">
        <form onSubmit={handleSearch}>
          <input
            placeholder="Search name, email, skill, city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>

      <table className="provider-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>City</th>
            <th>Categories</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p._id}>
              <td>{p.user.name}</td>
              <td>{p.user.email}</td>
              <td>{p.location.city || '-'}</td>
              <td>{p.categories.join(', ') || '-'}</td>
              <td>
                <span className={`badge badge-${p.status}`}>{p.status}</span>
              </td>
              <td>
                <Link to={`/admin/providers/${p._id}`}>View</Link>
              </td>
            </tr>
          ))}
          {providers.length === 0 && (
            <tr>
              <td colSpan="6">No providers found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          Page {page} of {pages || 1}
        </span>
        <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
