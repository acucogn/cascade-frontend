import React, { useState } from 'react';
import GoogleButton from 'react-google-button';
import './LoginPage.css'; 

const API_URL = process.env.REACT_APP_API_URL || 'https://normal-globally-gannet.ngrok-free.app';

function LoginPage({ onLoginSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  
  const handleGoogleLogin = () => {
    
    window.location.href = `${API_URL}/api/v1/auth/login`; 
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isLoginView && password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const endpoint = isLoginView ? '/api/v1/auth/token' : '/api/v1/auth/register';
    
    
    const headers = {};
    let body;

    if (isLoginView) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        body = new URLSearchParams({ username: email, password: password });
    } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ email, password });
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed.');
      }

      
      if (!isLoginView) {
        
         const loginResponse = await fetch(`${API_URL}/api/v1/auth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ username: email, password: password }),
        });
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) throw new Error(loginData.detail || 'Login after signup failed.');
        onLoginSuccess(loginData.access_token);
      } else {
        
        onLoginSuccess(data.access_token);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">CASCADE AI</h1>
        <h2>{isLoginView ? 'Sign In' : 'Create Account'}</h2>
        <form onSubmit={handleAuthSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLoginView ? "current-password" : "new-password"}
            />
          </div>
          {!isLoginView && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        <div className="divider">Or</div>
        <div className="google-login-container">
          <GoogleButton onClick={handleGoogleLogin}/>
        </div>
        <div className="toggle-view">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }}>
            {isLoginView ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;