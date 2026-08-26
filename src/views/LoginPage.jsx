import React, { useState, useEffect } from 'react';
import { Calendar, Eye, EyeOff, LogIn } from 'lucide-react';

const BASE_URL = 'http://localhost:8085/api';

export const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);

  // Load demo users from the real API for the quick-fill buttons
  useEffect(() => {
    fetch(`${BASE_URL}/users`)
      .then(r => r.ok ? r.json() : [])
      .then(users => setDemoUsers(users.slice(0, 2)))
      .catch(() => {
        // Fallback demo accounts if backend not reachable
        setDemoUsers([
          { id: 1, name: 'Alex Morgan', email: 'alex.morgan@company.com', role: 'EMPLOYEE', avatar: 'AM' },
          { id: 2, name: 'Sarah Jenkins', email: 'sarah.jenkins@company.com', role: 'MANAGER', avatar: 'SJ' }
        ]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Invalid email or password.');
      }

      const user = await res.json();
      localStorage.setItem('elms_current_user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="login-logo">
            <Calendar size={24} />
          </div>
          <h1 className="login-title">LeaveFlow</h1>
          <p className="login-subtitle">Employee Leave Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="login-heading">Sign in to your account</h2>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="login-spinner"></span>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="login-demo">
          <p className="login-demo-title">Demo Accounts</p>
          <div className="demo-accounts">
            {demoUsers.map((user) => (
              <button
                key={user.id}
                className="demo-account-btn"
                onClick={() => {
                  setEmail(user.email);
                  setPassword('password');
                  setError('');
                }}
              >
                <div className="demo-avatar">{user.avatar}</div>
                <div>
                  <div className="demo-name">{user.name}</div>
                  <div className="demo-role">{user.role === 'MANAGER' ? 'Manager' : 'Employee'}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
