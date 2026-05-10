import API_CONFIG from './apiConfig'
const API_BASE = `${API_CONFIG.backend}/api`;
const AI_SERVICE_URL = API_CONFIG.ai;

export const analyzeResume = async (file, userId) => {
  const formData = new FormData();
  formData.append("file", file);
  
  if (userId) {
    formData.append("userId", userId);
  }

  try {
    const response = await fetch(`${API_BASE}/resumes/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Upload failed");
    }

    const data = await response.json();
    
    // Parse the AI response if it's a string
    if (data.parsedData && typeof data.parsedData === 'string') {
      try {
        data.parsedData = JSON.parse(data.parsedData);
        // Store session ID for later use
        if (data.parsedData.session_id) {
          localStorage.setItem('ai_session_id', data.parsedData.session_id);
        }
      } catch (e) {
        console.warn("Could not parse AI response as JSON", e);
      }
    }
    
    return data;
  } catch (error) {
    console.error("Resume analysis error:", error);
    throw error;
  }
};

export const matchResumeWithJob = async (resumeId, jobDescription) => {
  const formData = new FormData();
  formData.append("resumeId", resumeId);
  formData.append("jobDescription", jobDescription);

  try {
    const response = await fetch(`${API_BASE}/resumes/match-job`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Matching failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Job matching error:", error);
    throw error;
  }
};

export const verifyIdentity = async (sessionId, imageBase64) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("image", imageBase64);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/verify-identity`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Verification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Identity verification error:", error);
    throw error;
  }
};

export const analyzeVideoFrame = async (sessionId, frameBase64) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("frame", frameBase64);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/analyze-video`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Video analysis failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Video analysis error:", error);
    throw error;
  }
};

export const generateQuestions = async (sessionId) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/generate-questions`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Question generation failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Question generation error:", error);
    throw error;
  }
};

export const evaluateAnswer = async (sessionId, answer, questionIndex) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("answer", answer);
  formData.append("question_index", questionIndex);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/evaluate-answer`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Evaluation failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Answer evaluation error:", error);
    throw error;
  }
};

export const generateReport = async (sessionId, candidateName) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("candidate_name", candidateName);

  try {
    const response = await fetch(`${AI_SERVICE_URL}/generate-report`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Report generation failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Report generation error:", error);
    throw error;
  }
};

export const getUserResumes = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/resumes/user/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch resumes");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user resumes:", error);
    throw error;
  }
};

export const getResumeAnalysis = async (resumeId) => {
  try {
    const response = await fetch(`${API_BASE}/resumes/analyze/${resumeId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch analysis");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching analysis:", error);
    throw error;
  }
};

export const getAllReports = async () => {
  try {
    const response = await fetch(`${API_BASE}/resumes/reports/all`);
    if (!response.ok) {
      throw new Error("Failed to fetch reports");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

export const getReport = async (reportId) => {
  try {
    const response = await fetch(`${API_BASE}/resumes/reports/${reportId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch report");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
};

export const deleteResume = async (resumeId) => {
  try {
    const response = await fetch(`${API_BASE}/resumes/${resumeId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete resume");
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw error;
  }
};