import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  console.log("🔑 Attempting login with:", email, password);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log("📡 Login response:", response);

    if (!response.ok) {
      const err = await response.json();
      console.error("❌ Login failed:", err);
      setError(err.error || 'Login failed');
      return;
    }

    const { token, user } = await response.json();
    console.log("✅ Logged in:", user);

    login(token, user.role);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    if (user.role === 'vendor') navigate('/vendor/dashboard');
    else navigate('/admin/dashboard');
  } catch (err) {
    console.error("💥 Server/network error:", err);
    setError('Server error');
  }
};


  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
}

export default Login;
