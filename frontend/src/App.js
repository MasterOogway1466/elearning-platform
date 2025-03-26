import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Auth context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ element, roles }) => {
  const { isLoggedIn, currentUser } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.some(role => currentUser.roles.includes(role))) {
    return <Navigate to="/" />;
  }
  
  return element;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route
                path="/student-dashboard"
                element={
                  <ProtectedRoute
                    element={<StudentDashboard />}
                    roles={['ROLE_STUDENT']}
                  />
                }
              />
              <Route
                path="/instructor-dashboard"
                element={
                  <ProtectedRoute
                    element={<InstructorDashboard />}
                    roles={['ROLE_INSTRUCTOR']}
                  />
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute
                    element={<AdminDashboard />}
                    roles={['ROLE_ADMIN']}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute
                    element={<Profile />}
                    roles={['ROLE_STUDENT', 'ROLE_INSTRUCTOR', 'ROLE_ADMIN']}
                  />
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;