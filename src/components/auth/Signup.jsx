import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../../firebase';
import { FaUser, FaLock, FaEnvelope, FaUserAlt, FaKey } from 'react-icons/fa';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecretField, setShowSecretField] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();

  // The admin secret key - using environment variable
  const ADMIN_SECRET_KEY = process.env.REACT_APP_ADMIN_SECRET_KEY || "JFGR-Admin-2023-SecureKey";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Attempting signup with:', { email, password, firstName, lastName });
      setError('');
      setLoading(true);
      
      // Firebase requires passwords to be at least 6 characters
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Determine if this is an admin account based on the secret key
      const isAdmin = secretKey === ADMIN_SECRET_KEY;
      
      // Create the user with Firebase directly instead of through context
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Add display name to the user profile
      const displayName = `${firstName} ${lastName}`;
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Save user data to Firestore
      const userId = userCredential.user.uid;
      const timestamp = new Date();

      // Set user role and permissions based on whether the secret key is correct
      const role = isAdmin ? 'admin' : 'user';
      const permissions = isAdmin 
        ? [
            'read_all_data',
            'create_complaints',
            'update_complaints',
            'delete_complaints',
            'manage_users',
            'manage_volunteers',
            'assign_tasks',
            'access_admin_dashboard',
            'view_analytics',
            'manage_assignments',
            'approve_volunteers',
            'create_admins'
          ] 
        : ['read_own_data', 'create_complaints', 'update_own_complaints'];
      
      const userData = {
        firstName,
        lastName,
        username,
        email,
        displayName,
        role,
        permissions,
        photoURL: userCredential.user.photoURL || '',
        createdAt: timestamp,
        lastLogin: timestamp,
        complaints: [],
        isAdmin: isAdmin, // Explicit flag for admin status
        isActive: true,
        metadata: {
          createdAt: timestamp,
          lastLogin: timestamp,
          lastUpdated: timestamp
        }
      };

      // If admin, add additional admin-specific fields
      if (isAdmin) {
        userData.adminMetadata = {
          adminSince: timestamp,
          adminLevel: 'full',
          canAssignTasks: true,
          canManageVolunteers: true,
          canManageAdmins: true
        };
      }

      await setDoc(doc(db, "users", userId), userData);
      
      console.log('User created successfully and data saved to Firestore:', userCredential.user);
      if (isAdmin) {
        console.log('Created with ADMIN privileges');
      }
      
      // Navigate to login page after successful signup
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to create an account';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak (minimum 6 characters)';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error - please check your connection';
          break;
        default:
          errorMessage = `Failed to create an account: ${error.message}`;
      }
      
      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="card w-full max-w-md">
        <h2 className="text-center text-2xl font-bold mb-6">Sign Up</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between gap-4">
            <div className="form-group w-1/2">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">
                  {React.createElement(FaUserAlt, { size: 16 })}
                </span>
                <input
                  type="text"
                  id="firstName"
                  className="form-control pl-10"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="First Name"
                />
              </div>
            </div>
            
            <div className="form-group w-1/2">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                id="lastName"
                className="form-control"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Last Name"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">
                {React.createElement(FaUser, { size: 16 })}
              </span>
              <input
                type="text"
                id="username"
                className="form-control pl-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose a username"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Id</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">
                {React.createElement(FaEnvelope, { size: 16 })}
              </span>
              <input
                type="email"
                id="email"
                className="form-control pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">
                {React.createElement(FaLock, { size: 16 })}
              </span>
              <input
                type="password"
                id="password"
                className="form-control pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password (min 6 characters)"
              />
            </div>
          </div>
          
          <div className="form-group mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showSecret"
                className="mr-2"
                checked={showSecretField}
                onChange={() => setShowSecretField(!showSecretField)}
              />
              <label htmlFor="showSecret" className="text-sm text-gray-600 cursor-pointer">
                I have an admin access code
              </label>
            </div>
          </div>
          
          {showSecretField && (
            <div className="form-group mt-4">
              <label htmlFor="secretKey" className="form-label">Admin Secret Key</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">
                  {React.createElement(FaKey, { size: 16 })}
                </span>
                <input
                  type="password"
                  id="secretKey"
                  className="form-control pl-10"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter admin secret key"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                If you have the admin access code, enter it to create an administrator account
              </p>
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary w-full py-2 mt-4"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p>Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup; 