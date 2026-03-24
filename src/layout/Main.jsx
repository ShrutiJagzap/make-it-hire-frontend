import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { getJobs } from "../config/jobService";
import Job1 from '../job/Job1';

function Main() {

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getJobs().then(data => setJobs(data));
  }, []);

  return (
    <section className="text-gray-600 body-font overflow-hidden">

      <div className="container px-5 py-24 mx-auto">

        {/* Horizontal Scroll Container */}
        <div className="flex gap-8 overflow-x-auto pb-6 scroll-smooth">

          {jobs.map((job, index) => (

            <div
              key={job.id}
              className={`min-w-[500px] p-12 flex flex-col items-start transition duration-300 hover:scale-105
              ${index % 2 === 0 ? "bg-gray-400 rounded-3xl" : "bg-white rounded-3xl shadow-md"}
              `}
            >

              <span className={`inline-block py-1 px-2 rounded text-xs font-medium tracking-widest
                ${index % 2 === 0
                  ? "bg-indigo-50 text-indigo-500"
                  : "bg-gray-500 text-white"
                }`}>
                {job.companyName || "COMPANY"}
              </span>


              <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">
                {job.jobTitle}
              </h2>


              <p className="leading-relaxed mb-6">
                {job.description?.substring(0,120)}...
              </p>


              {/* Job Details */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">

                <p>💰 Salary: {job.salary || "Not mentioned"}</p>

                <p>📍 Location: {job.location || "Not mentioned"}</p>

                <p>👨‍💻 Experience: {job.experience || "Not mentioned"}</p>

                <p>📅 Deadline: {job.deadline || "Open"}</p>

              </div>


              <p className="mb-6">
                <strong>Skills:</strong> {job.skills || "Not specified"}
              </p>


              <div className="flex items-center w-full">

                <Link
                  to={`/job/${job.id}`}
                  className="text-indigo-500 inline-flex items-center border-2 p-2 rounded-3xl hover:bg-indigo-50"
                >
                  Learn More
                  <svg
                    className="w-4 h-4 ml-2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </Link>


                <span className="ml-auto flex items-center text-sm text-gray-700">
                  👁 1.2K
                </span>

                <span className="ml-4 flex items-center text-sm text-gray-700">
                  💬 6
                </span>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Main;