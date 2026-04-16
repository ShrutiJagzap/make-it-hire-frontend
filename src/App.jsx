import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./layout/Navbar";
import Hero from "./layout/Hero";
import Main from "./layout/Main";
import Footer from "./layout/Footer";

import Login from "./layout/Login";
import Job1 from "./job/Job1";
import Job2 from "./job/Job2";
import Jobs from "./job/Jobs";
import JobDetails from "./job/JobDetails";
import AdminDashboard from "./dashboard/AdminDashboard";
import UserDashboard from "./dashboard/UserDashboard";

import About1 from "./layout/About1";
import ScrollToTop from "./layout/ScrollToTop";

function App() {
  const location = useLocation();

  const isDashboardPage = [
    "/admin-dashboard",
    "/user-dashboard",
    "/dashboard"
  ].includes(location.pathname);

  return (
    <>
      
       <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Main />
              
              <About1/>
              <ScrollToTop/>
            </>
          }
        />


        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Login/>}/>
        <Route path="/job1" element={<Job1 />} />
        <Route path="/job2" element={<Job2 />} />
        <Route path="/jobs" element={<Jobs/>}/>
        <Route path="/job/:id" element={<JobDetails/>}/>
        <Route path="/about1" element={<About1 />} />
        <Route path="/about" element={<About1 />} />

        <Route
          path="/admin-dashboard"
          element={
            localStorage.getItem("role") === "ADMIN"
              ? <AdminDashboard />
              : <Navigate to="/" />
          } 
        />

        <Route
          path="/user-dashboard"
          element={
            localStorage.getItem("role") === "USER"
              ? <UserDashboard />
              : <Navigate to="/" />
          }
        />
      </Routes>
      

      {!isDashboardPage && <Footer />}
    </>
  );
}

export default App;
