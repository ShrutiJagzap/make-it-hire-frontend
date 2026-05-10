import API_CONFIG from '../config/apiConfig'
import React, { useRef, useState } from "react";

function Job1() {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(""); // 'success' | 'error' | ''

  const handleApplyClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      // setStatus("");

      const res = await fetch(`${API_CONFIG.backend}/api/resumes/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json(); // Assuming backend returns plain text. Use `await res.json()` if it's JSON

      if (res.ok) {
        alert("Resume uploaded successfully!");
        window.location.href = "/user-dashboard";
        if(data.parsedJson) {
          const parsed = JSON.parse(data.parsedJson);
          alert("AI Resume Score:" + parsed.resume_score + "%");
        }
      } else {
        // setStatus("error");
        alert("Upload failed: ");
      }
    } catch (err) {
      // setStatus("error");
      console.error("Upload error:", err);
      alert("An error occurred while uploading.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <section className="text-black bg-gray-400 body-font mb-10px">
        <div className="container px-5 mx-auto flex flex-col">
          <div className="lg:w-4/6 mx-auto">
            <div className="rounded-lg h-20 overflow-hidden"></div>
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-1/3 text-center sm:pr-8 sm:py-8">
                <div className="flex w-[300px] flex-col items-center text-center justify-center"></div>
              </div>
              <div className="sm:w-2/3 sm:pl-8 sm:py-8 sm:border-l border-gray-200 sm:border-t-0 
              border-t mt-4 pt-4 sm:mt-0 text-center sm:text-left">
                <h1 className="font-medium title-font text-gray-900 text-3xl">
                  Full Stack Developer
                </h1>
                <div className="w-80 h-1 bg-indigo-500 rounded mt-2 mb-4"></div>

                <p className="text-xl font-bold">Description:- </p>
                <p className="leading-relaxed text-lg font-extralight mb-4">
                  We are seeking a dynamic Full Stack Developer with strong expertise in both front-end and back-end technologies.
                  You will work on developing high-quality web applications using React.js for the user interface, Node.js 
                  (or Python with Flask/FASTAPI) for server-side logic, and MongoDB for database management.
                  Your role will involve building RESTful APIs, implementing responsive design, and ensuring seamless
                  integration between the front-end and back-end.
                </p>

                <div className='flex justify-between items-center'>
                  <p className='text-2xl'>Submit Your Resume:</p>
                  <button
                    onClick={handleApplyClick}
                    className="border-2 rounded-2xl px-4 py-2 cursor-pointer text-indigo-500 inline-flex items-center"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Apply Now"}
                    {!uploading && (
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="w-4 h-4 ml-2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                    )}
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

  );
}

export default Job1;
