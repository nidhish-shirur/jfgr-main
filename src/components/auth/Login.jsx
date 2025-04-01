import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc, getFirestore, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth } from '../../firebase';
import { FaUser, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Attempting login with:', { email });
      setError('');
      setLoading(true);
      
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists() && userDoc.data().permissions.includes('access_admin_dashboard')) {
        navigate('/admin'); // Redirect to admin dashboard
      } else {
        navigate('/'); // Redirect to home for regular users
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-light-gray py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img src={process.env.PUBLIC_URL + "/logo192.png"} alt="JFGR Logo" className="h-16 mx-auto mb-2" />
          </Link>
          <h2 className="text-3xl font-bold text-secondary-color">Welcome Back</h2>
          <p className="text-text-light mt-2">Login to your account to register complaints</p>
        </div>
        
        <div className="card shadow-lg border-t-4 border-primary-color">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="email" className="form-label flex items-center">
                {React.createElement(FaUser, { size: 14, className: "mr-2 text-primary-color" })}
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className="form-control pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {React.createElement(FaUser, { size: 16 })}
                </span>
              </div>
            </div>
            
            <div className="form-group">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="form-label flex items-center">
                  {React.createElement(FaLock, { size: 14, className: "mr-2 text-primary-color" })}
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-color hover:text-primary-dark">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  className="form-control pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {React.createElement(FaLock, { size: 16 })}
                </span>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full py-3 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>
          </form>
          
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <div className="flex gap-4">
            <button className="flex-1 btn flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700">
              {React.createElement(FaGoogle, { size: 16, className: "mr-2 text-red-500" })}
              Google
            </button>
            <button className="flex-1 btn flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white border border-blue-600">
              {React.createElement(FaFacebook, { size: 16, className: "mr-2" })}
              Facebook
            </button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p>Don't have an account? <Link to="/signup" className="text-primary-color font-semibold hover:text-primary-dark">Sign Up</Link></p>
        </div>
        
        <div className="mt-4 text-center">
          <Link 
            to="/admin" 
            className="inline-block px-6 py-2 bg-secondary-color text-primary-color font-semibold rounded-md hover:bg-secondary-dark transition duration-200"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 