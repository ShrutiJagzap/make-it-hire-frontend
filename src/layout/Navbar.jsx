import API_CONFIG from  "../config/apiConfig";
import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Bell, LogOut, ChevronDown, User as UserIcon, Settings, Edit3, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserProfile } from "../config/authService";
import ProfileEditModal from '../components/ProfileEditModel';

function Navbar() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");
  const isLoggedIn = !!role;

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    photoUrl: null
  });

  const fetchUserData = async () => {
    if (isLoggedIn && userId) {
      try {
        const data = await fetchUserProfile(userId);
        setUserData({
          name: data.fullName || 'User',
          email: data.email || '',
          phone: data.phone || '',
          photoUrl: data.photoUrl ? `${API_CONFIG.backend}/api/auth/profile/image/${data.photoUrl}` : null
        });
      } catch (err) {
        console.error("Error fetching navbar profile:", err);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [isLoggedIn, userId]);


  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchUserProfile(userId).then(data => {
        setUserData({
          name: data.fullName || 'User',
          email: data.email || '',
          photoUrl: data.photoUrl ? `${API_CONFIG.backend}/api/auth/profile/image/${data.photoUrl}` : null
        });
      }).catch(err => console.error("Error fetching navbar profile:", err));
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEditProfile = () => {
    setIsProfileOpen(false);
    setIsEditProfileOpen(true);
  };

  const handleProfileUpdate = () => {
    // Refresh user data after update
    fetchUserData();
  };

  return (
    <div>
      <header className={`body-font ${darkMode ? 'bg-gray-950 text-gray-400' : 'bg-white text-gray-800'} shadow-[0_1px_3px_rgba(0,0,0,08)] relative z-50 transition-colors`}>
        <div className="container mx-auto flex flex-wrap px-6 py-4 flex-col md:flex-row items-center justify-between">

          {/* Left: Logo */}
          <Link to="/" className="flex title-font font-medium items-center md:mb-0 mb-4 cursor-pointer gap-3">
            <div className="bg-indigo-600 text-white m-1.5 p-2  rounded-xl shadow-sm">
              <img src="/logo.jpg" alt="Make It Hire" className='w-9 h-9 rounded-lg object-cover' />
            </div>
            <span className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Make It Hire</span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center text-sm justify-center gap-8 font-semibold">
            <Link to="/" className={`transition-colors ${darkMode ? 'hover:text-white text-lg' : 'text-gray-900 text-lg hover:text-indigo-600'}`}>Home</Link>
            <Link to="/jobs" className={`transition-colors ${darkMode ? 'hover:text-white text-lg' : 'text-gray-900 text-lg hover:text-indigo-600'}`}>Jobs</Link>
            <Link to="/about1" className={`transition-colors ${darkMode ? 'hover:text-white text-lg' : 'text-gray-900 text-lg hover:text-indigo-600'}`}>About</Link>
          </nav>

          {/* Right: Auth / Profile */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {isLoggedIn ? (
              <div className="flex items-center gap-5">
                {/* Notification Icon */}
                <button className={`relative transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                  <Bell size={22} />
                  <span className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 border-2 border-white dark:border-gray-950 bg-red-500"></span>
                  </span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center focus:outline-none p-1 rounded-full border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer"
                  >
                    {userData.photoUrl ? (
                      <img src={userData.photoUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm border border-transparent">
                        {userData.name ? userData.name.charAt(0).toUpperCase() : (role === "ADMIN" ? 'H' : 'U')}
                      </div>
                    )}
                  </button>

                  {/* Google-Style Popup Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in-down origin-top-right">

                      {/* Top Section */}
                      <div className="px-6 py-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        {userData.photoUrl ? (
                          <img 
                            src={userData.photoUrl} 
                            alt="Profile" 
                            className="w-20 h-20 rounded-full object-cover shadow-md mb-3 border-4 border-white dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity" 
                            onClick={handleEditProfile}
                          />
                        ) : (
                          <div 
                            className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-md mb-3 border-4 border-white dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={handleEditProfile}
                          >
                            {userData.name ? userData.name.charAt(0).toUpperCase() : (role === "ADMIN" ? 'H' : 'U')}
                          </div>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{userData.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{userData.email}</p>
                        <span className="mt-3 inline-flex px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full font-semibold shadow-sm">
                          {role === "ADMIN" ? "HR / Recruiter" : "Job Seeker"}
                        </span>
                      </div>

                      {/* Middle Section (Actions) */}
                      <div className="py-2 px-3">
                        <button
                          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => {
                            setIsProfileOpen(false);
                            // This would navigate to the real profile page in the future
                            if (role === "ADMIN") navigate("/admin-dashboard");
                            else navigate("/user-dashboard");
                          }}
                        >
                          <UserIcon size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          View Profile
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={
                            handleEditProfile
                          }
                        >
                          <Edit3 size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Edit Profile
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate("/jobs");
                          }}
                        >
                          <FileText size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Resume Upload
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => {
                            setIsProfileOpen(false);
                          }}
                        >
                          <Settings size={18} className="mr-3 text-gray-500 dark:text-gray-400" />
                          Settings
                        </button>
                      </div>

                      {/* Bottom Section (Sign Out) */}
                      <div className="py-2 px-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <button
                          className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm transition-all cursor-pointer"
                          onClick={() => {
                            localStorage.clear();
                            window.location.href = "/";
                          }}
                        >
                          <LogOut size={16} className="mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-[0_2px_10px_rgba(79,70,229,0.2)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              className={`ml-4 w-9 h-9 flex items-center justify-center rounded-full transition-all focus:outline-none cursor-pointer ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
      <ProfileEditModal
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        userData={userData}
        onUpdate={handleProfileUpdate}
      />

    </div>
  );
}

export default Navbar;
