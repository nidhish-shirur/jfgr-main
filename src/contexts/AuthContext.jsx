import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

// Create the auth context with default values
const AuthContext = createContext({
  currentUser: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  logout: async () => {}
});

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component to wrap our app and make auth object available throughout
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to handle user registration
  const signup = async (email, password, displayName) => {
    console.log('AuthContext: Signup function called with', { email, displayName });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: User created successfully', userCredential);
      
      // Add display name to the user profile
      if (userCredential.user) {
        console.log('AuthContext: Updating user profile with displayName:', displayName);
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        console.log('AuthContext: User profile updated successfully');
        return userCredential;
      }
    } catch (error) {
      console.error('AuthContext: Error in signup function:', error);
      throw error; // Re-throw the error to be caught in the component
    }
  };

  // Function to handle user login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Function to handle user logout
  const logout = () => {
    return signOut(auth);
  };

  // Set up an observer to watch for auth state changes
  useEffect(() => {
    console.log('AuthContext: Setting up auth state observer');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthContext: Auth state changed, user:', user);
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up the observer on unmount
    return unsubscribe;
  }, []);

  // Value object to be provided to consumers of this context
  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 