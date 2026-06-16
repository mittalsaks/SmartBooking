import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://smartbooking-pmww.onrender.com/api/Auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 1, // BusinessOwner
      });

      if (response.data.isSuccess) {
        navigate('/admin/login');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
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
        .register-form {
          width: 100%;
          max-width: 450px;
          background: rgba(10, 20, 36, 0.7);
          border: 1px solid rgba(57, 255, 150, 0.2);
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .register-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          color: #F0FDF4;
          margin-bottom: 10px;
          text-align: center;
        }

        .register-subtitle {
          color: #b4b4b4;
          text-align: center;
          margin-bottom: 30px;
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 18px;
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
          margin-top: 10px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(57, 255, 150, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .register-footer {
          text-align: center;
          margin-top: 20px;
          color: #b4b4b4;
          font-size: 0.9rem;
        }

        .register-footer a {
          color: #39FF96;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .register-footer a:hover {
          color: #00ff88;
        }
      `}</style>

      <div className="register-form">
        <h1 className="register-title">Register Your Business</h1>
        <p className="register-subtitle">Create your SmartBooking account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Owner Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="business@email.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register Business'}
          </button>
        </form>

        <div className="register-footer">
          Already have an account?{' '}
          <Link to="/admin/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}
