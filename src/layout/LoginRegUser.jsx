import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { registerUser, loginUser } from "../config/authService";

function LoginRegUser() {

  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ REGISTER USER
  const handleRegister = async () => {
    try {
      const message = await registerUser({
        fullName,
        email,
        password,
        role: "USER"
      });

      alert(message);
      setIsLogin(true);

    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ LOGIN USER
  const handleLogin = async () => {
    try {
      const response = await loginUser({
        email,
        password
      });

      alert("Login Successful!");

      // Save user data in localStorage
      // localStorage.setItem("user", JSON.stringify(response));
      localStorage.setItem("userId", response.id);
      localStorage.setItem("role", response.role);

      if(response.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <div className="relative w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">

        <button
          onClick={() => navigate("/")}
          className="absolute top-3 right-3 text-white text-2xl hover:text-red-500"
        >
          <IoClose />
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-center mb-6">
            {isLogin ? 'Login' : 'Register'}
          </h2>
        </motion.div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded"
              onChange={(e) => setFullName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded"
            onClick={isLogin ? handleLogin : handleRegister}
          >
            {isLogin ? 'Login' : 'Register'}
          </button>

        </form>

        <div className="text-center mt-4">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <span
              className="text-indigo-400 cursor-pointer hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-indigo-400 hover:underline">
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}

export default LoginRegUser;
