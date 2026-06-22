import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Add Transaction', path: '/add-transaction' },
    { name: 'Transactions', path: '/transactions' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center gap-4">
          <div className="flex items-center min-w-0">
            <span className="text-xl font-bold text-primary-700 truncate">
              Finance Dashboard
            </span>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                      location.pathname === item.path
                        ? 'text-primary-700 bg-primary-100'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-gray-200">
                <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-700">
                  <FaUserCircle className="text-gray-400" />
                  <span className="font-medium truncate max-w-[140px]">{user?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-100"
                >
                  {isLoggingOut ? 'Logging out…' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className="md:hidden flex flex-wrap gap-1 pb-3 border-t border-gray-100 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? 'text-primary-700 bg-primary-100'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
