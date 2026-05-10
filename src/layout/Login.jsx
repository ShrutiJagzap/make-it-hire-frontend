import API_CONFIG from '../config/apiConfig';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { User, Building2, Mail, Lock, UserCircle } from 'lucide-react';
import { registerUser, loginUser } from "../config/authService";

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [selectedRole, setSelectedRole] = useState('USER'); // 'USER' | 'ADMIN'
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [idPhoto, setIdPhoto] = useState(null);
    const [idPhotoPreview, setIdPhotoPreview] = useState(null);

    const handleIdPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIdPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password || (!isLogin && !fullName)) {
            alert("Please fill all fields.");
            return;
        }

        //For registration, validate ID photo
        if(!isLogin && !idPhoto) {
            alert("Please upload an ID photo for verification");
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                const response = await loginUser({ email, password });
                localStorage.setItem("userId", response.id);
                localStorage.setItem("role", response.role);
                localStorage.setItem("userName",response.fullName);

                if (response.role === "ADMIN") {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/user-dashboard");
                }
            } else {
                const formData = new FormData();
                formData.append("fullName", fullName);
                formData.append("email", email);
                formData.append("password", password);
                formData.append("role", selectedRole);
                formData.append("idPhoto", idPhoto);

                const response = await fetch(`${API_CONFIG.backend}/api/auth/register-with-photo`, {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                if(!response.ok) {
                    throw new Error(data.message || "Registration failed");
                }
                alert(data.message || "Registration Successful!");

                //Auto login after registrattion
                const loginResponse = await loginUser({email, password});
                localStorage.setItem("userId", loginResponse.id);
                localStorage.setItem("role", loginResponse.role);
                localStorage.setItem("userName", loginResponse.fullName);

                if (loginResponse.role === "ADMIN") {
                    navigate("/admin-dashboard");
                } else {
                    navigate("/user-dashboard");
                }
            }
        } catch (error) {
            alert(error.message || "An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 transition-colors duration-300">
            <div className="relative w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">

                <button
                    onClick={() => navigate("/")}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <IoClose size={24} />
                </button>

                <div className="flex flex-col items-center mb-8">
                    <img src="/logo.jpg" alt="Logo" className="w-16 h-16 rounded-full mb-4 shadow-md object-cover" />
                    <h2 className="text-2xl font-bold text-center">
                        {isLogin ? 'Login to Make It Hire' : 'Create an Account'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                        {isLogin ? 'Welcome back! Please enter your details.' : 'Join us and find your dream job or ideal candidate.'}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>

                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select your role
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('USER')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${selectedRole === 'USER'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-500'
                                    }`}
                            >
                                <User size={24} className="mb-2" />
                                <span className="font-medium text-sm">Job Seeker</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedRole('ADMIN')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${selectedRole === 'ADMIN'
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-500'
                                    }`}
                            >
                                <Building2 size={24} className="mb-2" />
                                <span className="font-medium text-sm">HR / Recruiter</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {!isLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserCircle size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Your name"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload ID Photo for verification</label>
                                    <div className="flex item-center gap-4">
                                        <input type="file" accept="image/*" onChange={handleIdPhotoChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                                        {idPhotoPreview && (
                                            <img src={idPhotoPreview} alt="ID Preview" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"/>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Upload your passport, driver's license, Pan card, or any government ID</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? "Please wait..." : (isLogin ? "Login" : "Create Account")}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </span>{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setFullName("");
                            setEmail("");
                            setPassword("");
                        }}
                        className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none hover:underline transition-all"
                    >
                        {isLogin ? "Sign Up" : "Log In"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Login;
