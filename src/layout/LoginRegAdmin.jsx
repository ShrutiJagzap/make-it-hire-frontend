import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { registerUser, loginUser } from "../config/authService";

function LoginRegAdmin() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const toggleButtonStyle = (active) =>
    `px-4 py-2 rounded ${
      active ? "bg-blue-600 text-white" : "border border-gray-400 text-gray-700"
    }`;

  // ✅ REGISTER ADMIN
  const handleRegister = async () => {
    try {
      const response = await registerUser({
        fullName,
        email,
        password,
        role: "ADMIN",
      });

      alert(response);
      setIsLogin(true);

    } catch (error) {
      alert(error.message);
    }
  };

  // LOGIN ADMIN
  const handleLogin = async () => {
    try {
      const user = await loginUser({
        email,
        password,
      });

      if (user.role === "ADMIN") {
        // localStorage.setItem("admin", JSON.stringify(user));
        localStorage.setItem("userId", user.id);
        localStorage.setItem("role", user.role);
        
        alert("Admin login successful!");
        navigate("/admin-dashboard");
      } else {
        alert("Access denied: Not an admin account.");
      }

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-96 p-8 bg-white shadow-2xl rounded-2xl relative">

        <button
          onClick={() => navigate("/")}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-2xl"
        >
          <IoClose />
        </button>

        <p className="text-center text-2xl font-light mb-4">Admin</p>

        <div className="flex justify-between mb-6">
          <button
            className={toggleButtonStyle(isLogin)}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={toggleButtonStyle(!isLogin)}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >

            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />

            <button
              className={`w-full ${
                isLogin
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white py-2 px-4 rounded`}
              onClick={isLogin ? handleLogin : handleRegister}
            >
              {isLogin ? "Login" : "Register"}
            </button>

          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

export default LoginRegAdmin;



