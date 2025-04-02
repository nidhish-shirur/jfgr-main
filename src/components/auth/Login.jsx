import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
  console.log('Using src/components/auth/login.jsx');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password });
    if (!email || !password) {
      setMessage('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      setMessage('Logging in...');
      navigate('/'); // Redirect to home page after successful login
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to log in';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid credentials';
          break;
        default:
          errorMessage = `Login failed: ${error.message}`;
      }
      setMessage(errorMessage);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="card w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-6">Login</h2>
        {message && (
          <div
            className={`px-4 py-3 rounded mb-4 ${
              message.includes('Logging in')
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Email (like neha@gmail.com)"
              value={email}
              onChange={(e) => {
                console.log('Email input changed:', e.target.value);
                setEmail(e.target.value);
              }}
              required
            />
          </div>
          <br />
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                console.log('Password input changed:', e.target.value);
                setPassword(e.target.value);
              }}
              required
            />
          </div>
          <br />
          <button type="submit" className="btn btn-primary w-full py-2">
            Walk Through the Door (Log In)
          </button>
          <p className="mt-4 text-center">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;