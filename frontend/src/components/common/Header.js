import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { currentUser, isLoggedIn, logout, isInstructor, isStudent } = useAuth();

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">E-Learning Platform</Link>
      </div>
      <nav className="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {isLoggedIn ? (
            <>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              {isInstructor && (
                <li>
                  <Link to="/instructor-dashboard">Dashboard</Link>
                </li>
              )}
              {isStudent && (
                <li>
                  <Link to="/student-dashboard">Dashboard</Link>
                </li>
              )}
              <li>
                <button onClick={logout} className="btn-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header; 