import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { Link } from 'react-router-dom';
import { FaUserShield, FaEnvelope, FaLock, FaCheck, FaKey } from 'react-icons/fa';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const CreateAdminUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // The secret admin key
  const CORRECT_ADMIN_KEY = 'JFGR-ADMIN-2023';

  const createAdminUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Verify admin key
      if (adminKey !== CORRECT_ADMIN_KEY) {
        setError('Invalid admin key. Please contact the system administrator.');
        return;
      }
      
      // Verify passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      // Validate password strength
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      // Create admin user with Firebase Authentication
      console.log('Attempting to create admin user with:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set display name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Store admin data in Firestore with special permissions
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName,
        lastName,
        email,
        role: 'admin',
        permissions: [
          'manage_users',
          'manage_complaints',
          'assign_tasks',
          'view_analytics',
          'system_settings'
        ],
        createdAt: serverTimestamp(),
        isActive: true,
        photoURL: '',
        lastLogin: serverTimestamp()
      });
      
      console.log('Admin user created successfully:', userCredential.user);
      setSuccess(true);
    } catch (error) {
      console.error('Error creating admin user:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to create admin user';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error - please check your connection';
          break;
        default:
          errorMessage = `Failed to create admin user: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-light-gray py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-color rounded-full flex items-center justify-center mb-4">
              <FaUserShield className="text-secondary-color text-2xl" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-secondary-color">Admin Setup</h2>
          <p className="text-text-light mt-2">Create an administrator account with special permissions</p>
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
          
          {success ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
              <div className="flex items-start">
                <FaCheck className="text-green-600 text-xl mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Admin Account Created Successfully!</h3>
                  <p className="text-green-700 mb-4">
                    The admin account has been created with special permissions. 
                    You can now log in with your credentials and manage the platform.
                  </p>
                  
                  <div className="bg-white p-4 rounded-md border border-green-200 mb-4">
                    <h4 className="font-medium text-green-800 mb-2">Admin Permissions:</h4>
                    <ul className="list-disc list-inside text-green-700">
                      <li>Manage Users</li>
                      <li>Manage Complaints</li>
                      <li>Assign Tasks to Volunteers</li>
                      <li>View Analytics</li>
                      <li>System Settings</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <p className="text-yellow-800">Please make sure to keep your admin credentials secure.</p>
                  </div>
                  
                  <Link 
                    to="/login" 
                    className="btn btn-primary w-full py-3 font-semibold flex items-center justify-center"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={createAdminUser} className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-secondary-color">Create Admin Account</h3>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800">
                  This page is for creating an administrator account with special permissions. 
                  You will need a valid admin key to proceed.
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="form-group">
                  <label htmlFor="adminKey" className="form-label flex items-center">
                    <FaKey className="mr-2 text-secondary-color" />
                    Admin Key
                  </label>
                  <input
                    type="password"
                    id="adminKey"
                    className="form-control"
                    required
                    placeholder="Enter admin key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      className="form-control"
                      required
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      className="form-control"
                      required
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label flex items-center">
                    <FaEnvelope className="mr-2 text-secondary-color" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    required
                    placeholder="Admin email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="form-label flex items-center">
                    <FaLock className="mr-2 text-secondary-color" />
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    required
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label flex items-center">
                    <FaLock className="mr-2 text-secondary-color" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-control"
                    required
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 font-semibold"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Admin Account...
                  </span>
                ) : 'Create Admin Account'}
              </button>
              
              <div className="mt-4 text-center">
                <Link to="/login" className="text-primary-color hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAdminUser; 