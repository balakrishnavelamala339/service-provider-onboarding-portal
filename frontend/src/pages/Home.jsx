import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <h1>Service Provider Onboarding Portal</h1>
      <p>Register as a service provider, complete your profile, and get verified.</p>
      {!user && (
        <div className="home-actions">
          <Link to="/register" className="btn">
            Get Started
          </Link>
          <Link to="/login" className="btn-outline">
            Login
          </Link>
        </div>
      )}
      {user && user.role === 'provider' && (
        <Link to="/dashboard" className="btn">
          Go to My Application
        </Link>
      )}
      {user && user.role === 'admin' && (
        <Link to="/admin" className="btn">
          Go to Admin Dashboard
        </Link>
      )}
    </div>
  );
}
