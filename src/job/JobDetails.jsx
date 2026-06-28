import API_CONFIG from '../config/apiConfig';
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
    fetch(`${API_CONFIG.backend}/api/jobs/${id}`)
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

      const response = await fetch(`${API_CONFIG.backend}/api/resumes/upload`, {
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
          console.error("AI data parsing error:", e);
        }
      }

      // Robust fallback checking
      if (!aiData || typeof aiData !== 'object') {
        aiData = {
          resume_score: 55,
          skills_found: ["Resume Processed"],
          experience_years: 0.0,
          recommendations: ["AI parsing did not return details. Using default baseline analysis."],
          word_count: 0,
          score_breakdown: {
            contact_info: 5,
            education: 8,
            experience: 11,
            skills: 14,
            projects: 8,
            formatting_length: 9
          },
          warning: "Fallback: AI service result was unparseable."
        };
      }

      // Check if resume_score is missing or invalid
      if (aiData.resume_score === undefined || aiData.resume_score === null || isNaN(aiData.resume_score) || aiData.resume_score <= 0) {
        aiData.resume_score = 50;
        if (!aiData.score_breakdown) {
          aiData.score_breakdown = {
            contact_info: 5,
            education: 8,
            experience: 10,
            skills: 12,
            projects: 8,
            formatting_length: 7
          };
        }
        aiData.warning = aiData.warning || "Fallback: score was invalid or missing from analysis.";
      }

      // Ensure breakdown exists and is complete
      if (!aiData.score_breakdown) {
        const score = aiData.resume_score || 50;
        const c = Math.round(score * 0.10);
        const ed = Math.round(score * 0.15);
        const ex = Math.round(score * 0.20);
        const sk = Math.round(score * 0.25);
        const p = Math.round(score * 0.15);
        const f = score - (c + ed + ex + sk + p);
        aiData.score_breakdown = {
          contact_info: c,
          education: ed,
          experience: ex,
          skills: sk,
          projects: p,
          formatting_length: f
        };
      }

      if (aiData.session_id) {
        setSessionId(aiData.session_id);
      } else {
        setSessionId("session-" + Date.now());
      }
      
      setAiResult(aiData);
      setShowAIDetails(true);
      setStatus("success");
      // Done - UI handles success state and displays analysis modal
      
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("error");
      alert("Failed to upload resume: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const formatSkillsText = (skillsText) => {
  if (!skillsText) return "No specific skills listed";
  
  // Define categories and their patterns
  const categories = [
    { name: "Front-End", pattern: /Front-End:?\s*/i },
    { name: "Front-End Framework", pattern: /Front-End Framework:?\s*/i },
    { name: "Back-End", pattern: /Back-End:?\s*/i },
    { name: "Databases", pattern: /Databases:?\s*/i },
    { name: "APIs", pattern: /APIs:?\s*/i },
    { name: "Version Control", pattern: /Version Control:?\s*/i }
  ];
  
  let remainingText = skillsText;
  const sections = [];
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const nextCategory = categories[i + 1];
    
    const startMatch = remainingText.match(category.pattern);
    if (startMatch) {
      let content = remainingText.substring(startMatch.index + startMatch[0].length);
      
      if (nextCategory) {
        const endMatch = content.match(nextCategory.pattern);
        if (endMatch) {
          content = content.substring(0, endMatch.index);
        }
      }
      
      sections.push({
        category: category.name,
        content: content.trim()
      });
    }
  }
  
  // If no categories found, display as plain text
  if (sections.length === 0) {
    return (
      <div className="bg-white p-5 rounded-lg shadow-md">
        <p className="text-gray-700 whitespace-normal break-words">
          {skillsText}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      {sections.map((section, idx) => (
        <div key={idx} className="mb-4 last:mb-0">
          <h3 className="font-bold text-indigo-700 text-lg mb-2">
            {section.category}:
          </h3>
          <p className="text-gray-700 leading-relaxed ml-4 whitespace-normal break-words">
            {section.content}
          </p>
        </div>
      ))}
    </div>
  );
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

                {/* <div className="mb-6">
                  <span className="font-bold">Required Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.skills?.split(',').map((skill, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div> */}

                {/* <div className="mb-6">
                  <p className="text-xl font-bold mb-3">🎯 Required Skills:</p>
                  <div className="bg-white p-5 rounded-lg shadow-md max-w-full overflow-x-auto">
                    {job.skills ? (
                      <div className="text-gray-700 whitespace-normal break-words">
                        {formatSkillsText(job.skills)}
                      </div>
                    ) : (
                      <p className="text-gray-600 italic">No specific skills listed</p>
                    )}
                  </div>
                </div> */}
                
                <div className="mb-6">
                  <p className="text-xl font-bold mb-3">🎯 Required Skills:</p>
                  {formatSkillsText(job.skills)}
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
                      <div className="p-6 text-left">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-2xl font-bold">AI Resume Analysis</h2>
                          <button 
                            onClick={() => setShowAIDetails(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>

                        {aiResult.warning && (
                          <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-800 text-sm">
                            <span className="font-semibold">⚠️ Note:</span> {aiResult.warning}
                          </div>
                        )}
                        
                        <div className="mb-6 text-center">
                          <div className="text-5xl font-bold text-indigo-600 mb-2">
                            {aiResult.resume_score || 0}%
                          </div>
                          <p className="text-gray-600 font-medium">Overall Resume Score</p>
                        </div>

                        {/* Score Breakdown Section */}
                        {aiResult.score_breakdown && (
                          <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center gap-2">
                              📊 Evaluation breakdown
                            </h3>
                            <div className="space-y-3">
                              {/* Skills (out of 25) */}
                              <div>
                                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                  <span>Key Skills Match</span>
                                  <span>{aiResult.score_breakdown.skills || 0} / 25</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${((aiResult.score_breakdown.skills || 0) / 25) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Experience (out of 20) */}
                              <div>
                                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                  <span>Professional Experience</span>
                                  <span>{aiResult.score_breakdown.experience || 0} / 20</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${((aiResult.score_breakdown.experience || 0) / 20) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Education (out of 15) */}
                              <div>
                                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                  <span>Education Credentials</span>
                                  <span>{aiResult.score_breakdown.education || 0} / 15</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${((aiResult.score_breakdown.education || 0) / 15) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Projects (out of 15) */}
                              <div>
                                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                  <span>Project Quality</span>
                                  <span>{aiResult.score_breakdown.projects || 0} / 15</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-pink-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${((aiResult.score_breakdown.projects || 0) / 15) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Content Quality / Formatting Length (out of 15) */}
                              <div>
                                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                  <span>Content Quality & Formatting</span>
                                  <span>{aiResult.score_breakdown.formatting_length || 0} / 15</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${((aiResult.score_breakdown.formatting_length || 0) / 15) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Contact Info (out of 10) */}
                              <div>
                                <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                                  <span>Contact Information</span>
                                  <span>{aiResult.score_breakdown.contact_info || 0} / 10</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${((aiResult.score_breakdown.contact_info || 0) / 10) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

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