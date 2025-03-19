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

// App routing with AuthProvider
const AppRoutes = () => {
  const { isLoggedIn, isInstructor, isStudent } = useAuth();
  
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={isLoggedIn ? <Navigate to="/profile" /> : <Login />} />
          <Route path="/register" element={isLoggedIn ? <Navigate to="/profile" /> : <Register />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route 
            path="/dashboard" 
            element={
              isInstructor ? <Navigate to="/instructor-dashboard" /> : 
              isStudent ? <Navigate to="/student-dashboard" /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/student-dashboard" 
            element={<ProtectedRoute element={<StudentDashboard />} roles={['ROLE_STUDENT']} />} 
          />
          <Route 
            path="/instructor-dashboard" 
            element={<ProtectedRoute element={<InstructorDashboard />} roles={['ROLE_INSTRUCTOR']} />} 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;