
import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import VideoInterview from "../components/VideoInterview";
import { 
  Box,
  Button,
  Typography,
 } from "@mui/material";

import {
  Videocam
} from "@mui/icons-material"

function JobDetails() {
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [job, setJob] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [showAIDetails, setShowAIDetails] = useState(false);
  const [status, setStatus] = useState("");
  const [showVideoInterview, setShowVideoInterview] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8081/api/jobs/${id}`)
      .then((res) => res.json())
      .then((data) => setJob(data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleApplyClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login to apply");
      return;
    }

    try {
      setUploading(true);
      setStatus("");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const response = await fetch("http://localhost:8081/api/resumes/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }
      
      // Parse the AI data
      let aiData = data.parsedData;
      if (typeof aiData === 'string') {
        try {
          aiData = JSON.parse(aiData);
        } catch (e) {
          console.log("AI data is not JSON:", aiData);
        }
      }

      if (aiData?.session_id) {
        setSessionId(aiData.session_id);
      }
      
      setAiResult(aiData);
      setShowAIDetails(true);
      setStatus("success");
      
      const score = aiData?.resume_score || 'N/A';
      alert(`Resume uploaded successfully! Score: ${score}%`);
      
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("error");
      alert("Failed to upload resume: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!job) {
    return <div className="p-20 text-center">Loading Job...</div>;
  }

  return (
    <div>
      <section className="text-black bg-gray-400 body-font min-h-[60vh] flex items-center">
        <div className="container px-5 py-16 mx-auto flex flex-col">
          <div className="lg:w-4/6 md:w-5/6 w-full mx-auto">
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-2/3 sm:pl-8 sm:py-8 sm:border-l border-gray-200 
              sm:border-t-0 border-t mt-4 pt-4 sm:mt-0 text-center sm:text-left">
                
                <h1 className="font-medium title-font text-gray-900 text-3xl">
                  {job.jobTitle} at {job.companyName}
                </h1>

                <div className="w-80 h-1 bg-indigo-500 rounded mt-2 mb-4"></div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-lg shadow">
                    <span className="font-bold">💰 Salary:</span> {job.salary || "Not mentioned"}
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow">
                    <span className="font-bold">📍 Location:</span> {job.location || "Not mentioned"}
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow">
                    <span className="font-bold">🧑‍💻 Experience:</span> {job.experience || "Not mentioned"}
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow">
                    <span className="font-bold">📅 Deadline:</span> {job.deadline || "Not mentioned"}
                  </div>
                </div>

                <p className="text-xl font-bold">Description:</p>
                <p className="leading-relaxed text-lg font-extralight mb-4">
                  {job.description}
                </p>

                <div className="mb-6">
                  <span className="font-bold">Required Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.skills?.split(',').map((skill, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='flex justify-between items-center mt-8'>
                  <p className='text-2xl'>Submit Your Resume:</p>
                  <button
                    onClick={handleApplyClick}
                    className="border-2 rounded-2xl px-6 py-3 cursor-pointer text-indigo-500 inline-flex items-center hover:bg-indigo-50 transition"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Analyzing...
                      </>
                    ) : "Apply Now"}
                  </button>
                </div>

                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                {status === "success" && (
                  <p className="mt-3 text-green-700">✅ Resume uploaded successfully!</p>
                )}
                {status === "error" && (
                  <p className="mt-3 text-red-600">❌ Failed to upload. Try again.</p>
                )}

                {/* AI Results Modal */}
                {showAIDetails && aiResult && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-2xl font-bold">AI Resume Analysis</h2>
                          <button 
                            onClick={() => setShowAIDetails(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="mb-6 text-center">
                          <div className="text-5xl font-bold text-indigo-600 mb-2">
                            {aiResult.resume_score || 0}%
                          </div>
                          <p className="text-gray-600">Overall Resume Score</p>
                        </div>

                        {aiResult.skills_found && aiResult.skills_found.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-semibold mb-2">Skills Found:</h3>
                            <div className="flex flex-wrap gap-2">
                              {aiResult.skills_found.map((skill, i) => (
                                <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {aiResult.recommendations && aiResult.recommendations.length > 0 && (
                          <div className="mb-4">
                            <h3 className="font-semibold mb-2">Recommendations:</h3>
                            <ul className="list-disc pl-5">
                              {aiResult.recommendations.map((rec, i) => (
                                <li key={i} className="text-gray-700">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {aiResult.experience_years !== undefined && (
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="font-medium">Experience:</span> {aiResult.experience_years} years
                            </div>
                          )}
                          {aiResult.word_count && (
                            <div className="bg-gray-50 p-3 rounded">
                              <span className="font-medium">Word Count:</span> {aiResult.word_count}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => setShowAIDetails(false)}
                          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add this after the AI Results modal */}
                {aiResult && sessionId && (
                  <Box className="mt-6 text-center">
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<Videocam />}
                      onClick={() => setShowVideoInterview(true)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600"
                    >
                      Proceed to Video Interview
                    </Button>
                    <Typography variant="caption" display="block" className="mt-2 text-gray-600">
                      Complete AI-powered interview for better assessment
                                    </Typography>
                  </Box>
                )}

                {/* Video Interview Modal */}
                <VideoInterview
                  open={showVideoInterview}
                  onClose={() => setShowVideoInterview(false)}
                  resumeData={aiResult}
                  sessionId={sessionId}
                  userId={localStorage.getItem("userId")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default JobDetails;