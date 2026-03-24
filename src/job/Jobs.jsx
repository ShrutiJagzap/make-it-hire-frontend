
import React, { useEffect, useState } from "react";
import { getJobs } from "../config/jobService";
import { Link } from "react-router-dom";

export default function Jobs() {

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    getJobs().then(setJobs);
  }, []);

  return (
    <>
      <section className="text-gray-600 body-font overflow-hidden">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-wrap -m-12">

            {jobs.map((job, index) => (

              <div
                key={job.id}
                className={`p-12 mb-10 md:w-1/2 flex flex-col items-start 
                ${index % 2 === 0 ? "bg-gray-400 rounded-3xl" : ""}`}
              >

                {/* Company */}
                <span className={`inline-block py-1 px-2 rounded 
                ${index % 2 === 0 ? "bg-indigo-50 text-indigo-500" : "bg-gray-500 text-white"}
                text-xs font-medium tracking-widest`}>
                  {job.companyName || "COMPANY"}
                </span>

                {/* Job Title */}
                <h2 className="sm:text-3xl text-2xl title-font font-medium text-gray-900 mt-4 mb-4">
                  {job.jobTitle}
                </h2>

                {/* Description */}
                <p className="leading-relaxed mb-8">
                  {job.description?.substring(0,150)}...
                </p>

                {/* Job Info */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-6">

                  <p><span className="font-semibold">💰 Salary:</span> {job.salary || "Not mentioned"}</p>

                  <p><span className="font-semibold">📍 Location:</span> {job.location || "Not mentioned"}</p>

                  <p><span className="font-semibold">🧑‍💻 Experience:</span> {job.experience || "Not mentioned"}</p>

                  <p><span className="font-semibold">📅 Deadline:</span> {job.deadline || "Not mentioned"}</p>

                </div>

                {/* Skills */}
                   <div className="mb-6">
                     <span className="font-semibold">Skills:</span>
                     <p className="text-sm text-gray-700">
                       {job.skills || "Not mentioned"}
                     </p>
                </div>

                <div className="flex items-center flex-wrap pb-4 mb-4 border-b-2 border-gray-100 mt-auto w-full">

                  {/* Learn More */}
                  <Link
                    to={`/job/${job.id}`}
                    className="text-indigo-500 inline-flex items-center cursor-pointer border-2 p-2 rounded-4xl"
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

                  {/* Views */}
                  <span className="text-black mr-3 inline-flex items-center ml-auto leading-none text-sm pr-3 py-1 border-r-2 border-gray-200">
                    <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2"
                      fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    1.2K
                  </span>

                  {/* Comments */}
                  <span className="text-black inline-flex items-center leading-none text-sm">
                    <svg className="w-4 h-4 mr-1" stroke="currentColor" strokeWidth="2"
                      fill="none" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 
                      8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 
                      8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z">
                      </path>
                    </svg>
                    6
                  </span>

                </div>

              </div>

            ))}

          </div>
        </div>
      </section>
    </>
  );
}