import API_CONFIG from  "../config/apiConfig";
import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Bell, LogOut, ChevronDown, User as UserIcon, Settings, Edit3, FileText, Briefcase, Clock, MessageSquare, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserProfile } from "../config/authService";
import ProfileEditModal from '../components/ProfileEditModel';

function Navbar() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsDropdownRef = useRef(null);

  // Profile image error states (for fallback initials display)
  const [imageError, setImageError] = useState(false);
  const [dropdownImageError, setDropdownImageError] = useState(false);

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
    setImageError(false);
    setDropdownImageError(false);
  }, [userData.photoUrl]);

  // Notifications fetching
  const fetchNotifications = async () => {
    if (isLoggedIn && userId) {
      try {
        const res = await fetch(`${API_CONFIG.backend}/api/notifications/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.filter(n => !n.read).length);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [isLoggedIn, userId]);

  const handleMarkAsRead = async (notif) => {
    if (!notif.read) {
      try {
        const res = await fetch(`${API_CONFIG.backend}/api/notifications/${notif.id}/read`, {
          method: 'PUT'
        });
        if (res.ok) {
          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
          setUnreadCount(c => Math.max(0, c - 1));
        }
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
    setIsNotificationsOpen(false);
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch(`${API_CONFIG.backend}/api/notifications/user/${userId}/read-all`, {
        method: 'PUT'
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-8 h-8 rounded-full flex items-center justify-center";
    switch (type) {
      case 'APPLICATION':
        return (
          <div className={`${iconClass} bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-450`}>
            <Briefcase size={14} />
          </div>
        );
      case 'INTERVIEW':
        return (
          <div className={`${iconClass} bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-450`}>
            <Clock size={14} />
          </div>
        );
      case 'FEEDBACK':
        return (
          <div className={`${iconClass} bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-450`}>
            <MessageSquare size={14} />
          </div>
        );
      case 'SYSTEM':
      default:
        return (
          <div className={`${iconClass} bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-450`}>
            <Sparkles size={14} />
          </div>
        );
    }
  };

  const formatNotifTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Close dropdowns when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
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
                <div className="relative" ref={notificationsDropdownRef}>
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`relative transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer focus:outline-none ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-gray-950">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-105 dark:border-gray-700 animate-fade-in-down origin-top-right z-50">
                      {/* Header */}
                      <div className="px-5 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-950 dark:text-white tracking-tight">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllAsRead}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-transparent border-none"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Notification List */}
                      <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              onClick={() => handleMarkAsRead(notif)}
                              className={`flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${!notif.read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
                            >
                              <div className="flex-shrink-0">
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                  <h4 className={`text-xs font-bold truncate ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {notif.title}
                                  </h4>
                                  <span className="text-[10px] text-gray-405 whitespace-nowrap">
                                    {formatNotifTime(notif.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>
                              {!notif.read && (
                                <div className="flex-shrink-0 self-center w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                            <Bell className="w-10 h-10 text-gray-400 mb-3 stroke-[1.5]" />
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">All caught up!</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No new notifications at this time.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center focus:outline-none p-1 rounded-full border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer"
                  >
                    {userData.photoUrl && !imageError ? (
                      <img 
                        src={userData.photoUrl} 
                        alt="Profile" 
                        className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
                        onError={() => setImageError(true)}
                      />
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
                        {userData.photoUrl && !dropdownImageError ? (
                          <img 
                            src={userData.photoUrl} 
                            alt="Profile" 
                            className="w-20 h-20 rounded-full object-cover shadow-md mb-3 border-4 border-white dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity" 
                            onClick={handleEditProfile}
                            onError={() => setDropdownImageError(true)}
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
