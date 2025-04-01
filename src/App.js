import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './components/auth/Signup';
import RegisterComplaint from './components/complaints/RegisterComplaint';
import AdminDashboard from './components/admin/AdminDashboard';
import CreateAdminUser from './components/auth/CreateAdminUser';
import CreateAdmin from './components/admin/CreateAdmin';
import PrivateRoute from './components/auth/PrivateRoute';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { testFirebase } from './firebaseTest';
import './App.css';

// ScrollToTop component to reset scroll position on page navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  // Set up auth state listener
  useEffect(() => {
    // Test Firebase connection
    testFirebase();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/media" element={<Home />} />
          <Route path="/reach" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/complaints" element={<RegisterComplaint />} />
          
          {/* Admin Routes - Temporarily removed PrivateRoute wrapper */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/create" element={<CreateAdmin />} />
          <Route path="/create-admin" element={<CreateAdminUser />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App; 