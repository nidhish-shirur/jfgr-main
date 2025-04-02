import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home'; // Fixed path
import Login from './components/auth/login';
import Signup from './components/auth/signup';
import RegisterComplaint from './components/complaints/RegisterComplaint';
import AdminDashboard from './components/dashboard/AdminDashboard';
import CreateAdminUser from './components/auth/CreateAdminUser';
import PrivateRoute from './components/auth/PrivateRoute';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
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
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getDoc(doc(db, 'users', user.uid)).then((doc) => {
          if (doc.exists()) {
            const userRole = doc.data().role;
            setRole(userRole);
            if (userRole === 'admin') {
              navigate('/admin'); // Admins go to AdminDashboard
            } else {
              navigate('/'); // Users go to Home
            }
          } else {
            setRole('user'); // Default to user if no role is found
            navigate('/');
          }
          setLoading(false);
        });
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
          
          {/* Admin Routes - Use PrivateRoute to protect admin pages */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/create"
            element={
              <PrivateRoute>
                <CreateAdminUser />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-admin"
            element={
              <PrivateRoute>
                <CreateAdminUser />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;