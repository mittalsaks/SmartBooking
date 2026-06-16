import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://smartbooking-pmww.onrender.com/api/Auth/login', {
        email,
        password,
      });

      if (response.data.isSuccess) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        navigate('/admin');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #070D1A 0%, #0f1425 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
      }}
    >
      <style>{`
        .login-form {
          width: 100%;
          max-width: 400px;
          background: rgba(10, 20, 36, 0.7);
          border: 1px solid rgba(57, 255, 150, 0.2);
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .login-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          color: #F0FDF4;
          margin-bottom: 10px;
          text-align: center;
        }

        .login-subtitle {
          color: #b4b4b4;
          text-align: center;
          margin-bottom: 30px;
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          color: #F0FDF4;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .form-input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(20, 30, 50, 0.5);
          border: 1px solid rgba(57, 255, 150, 0.3);
          border-radius: 8px;
          color: #F0FDF4;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #39FF96;
          background: rgba(20, 30, 50, 0.8);
          box-shadow: 0 0 0 3px rgba(57, 255, 150, 0.1);
        }

        .password-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #b4b4b4;
          cursor: pointer;
          padding: 4px;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #39FF96;
        }

        .error-message {
          background: rgba(255, 82, 82, 0.1);
          border: 1px solid rgba(255, 82, 82, 0.3);
          color: #ff6b6b;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #39FF96, #00ff88);
          color: #070D1A;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(57, 255, 150, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          margin-top: 20px;
          color: #b4b4b4;
          font-size: 0.9rem;
        }

        .login-footer a {
          color: #39FF96;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .login-footer a:hover {
          color: #00ff88;
        }
      `}</style>

      <div className="login-form">
        <h1 className="login-title">Business Portal</h1>
        <p className="login-subtitle">Login to manage your offers</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          New to SmartBooking?{' '}
          <Link to="/admin/register">Register your business</Link>
        </div>
      </div>
    </div>
  );
}
