import React from "react";
import { motion } from "framer-motion";
import { Router } from "react-router-dom";
const About1 = () => {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <motion.h2
          className="text-4xl font-bold mb-4 text-center text-blue-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          About Our Platform
        </motion.h2>

        <motion.p
          className="text-lg text-center mb-10 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Revolutionizing hiring and career planning with AI-driven insights.
        </motion.p>

        <motion.div
          className="mb-12 bg-white p-6 rounded-2xl shadow-lg"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-semibold text-purple-700 mb-4">
            👥 How Does It Benefit Users (Job Seekers)?
          </h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Smart Resume Insights:</strong> View resume completion % and section-wise progress.</li>
            <li><strong>Visual Skill Assessment:</strong> Charts show proficiency and upskilling needs.</li>
            <li><strong>Application Tracker:</strong> Track job application statuses (applied, interviewed, rejected).</li>
            <li><strong>Personal Notes & Logs:</strong> Add weekly notes and updates for organized planning.</li>
            <li><strong>Friendly UI:</strong> Built with Material UI & Recharts for smooth, modern experience.</li>
          </ul>
        </motion.div>

        <motion.div
          className="mb-12 bg-white p-6 rounded-2xl shadow-lg"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-semibold text-green-700 mb-4">
            🏢 How Does It Benefit Companies (Recruiters/HR)?
          </h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Automated Resume Screening:</strong> Java/Spring Boot backend filters top candidates.</li>
            <li><strong>AI-Powered Filtering:</strong> Only qualified candidates are shortlisted.</li>
            <li><strong>Dynamic Dashboards:</strong> Track hiring metrics and candidate performance.</li>
            <li><strong>Faster Hiring:</strong> Improve quality and reduce time to hire significantly.</li>
          </ul>
        </motion.div>

        <motion.div
          className="mb-12 bg-white p-6 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-semibold text-indigo-700 mb-4">
            🔮 Future Scope
          </h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>GenAI Interview Bot:</strong> Conducts and scores interviews using behavioral/technical analysis.</li>
            <li><strong>Resume Builder & Optimizer:</strong> ATS-friendly resume recommendations based on job roles.</li>
            <li><strong>Skill Gap Analysis:</strong> Suggests upskilling paths from market demand.</li>
            <li><strong>HR Analytics:</strong> Admin portal with funnel data, team dashboards & interview tracking.</li>
            <li><strong>Mobile App:</strong> iOS/Android support for on-the-go users and companies.</li>
            <li><strong>EdTech Integration:</strong> Collaborate with LinkedIn, Coursera, Naukri & more.</li>
          </ul>
        </motion.div>
      </div>

      
    </div>
  );
};

export default About1;
