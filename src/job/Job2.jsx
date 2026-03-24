import React, { useRef } from 'react';

function Job2() {
  const fileInputRef = useRef(null);

  const handleApplyClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    const res = fetch(
      "http://localhost:8081/api/resumes/upload",
      {
        method: "POST",
        body: formData
      }
    );
    const data  = res.json();
    alert("AI Resume Score:" + data.resume_score);
  }

  return (
    <div>
      <section className="text-black bg-gray-400 body-font">
        <div className="container px-5 mx-auto flex flex-col">
            
          <div className="lg:w-4/6 mx-auto">
            <div className="rounded-lg h-20 overflow-hidden"></div>
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-1/3 text-center sm:pr-8 sm:py-8">
                <div className="flex w-[300px] flex-col items-center text-center justify-center"></div>
              </div>
              <div className="sm:w-2/3 sm:pl-8 sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t mt-4 pt-4 sm:mt-0 text-center sm:text-left">
                <h1 className="font-medium title-font text-gray-900 text-3xl">
                  Mobile & Android Developer
                </h1>
                <div className="w-[350] h-1 bg-indigo-500 rounded mt-2 mb-4"></div>

                <p className="text-xl font-bold">Description:- </p>
                <p className="leading-relaxed text-lg font-extralight mb-4">
                We are looking for a passionate Mobile & Android Developer to join our team and drive the development of high-performance, scalable, 
                and user-friendly mobile applications. The ideal candidate should have strong proficiency in Java/Kotlin, experience with Android Studio, 
                and a deep understanding of mobile design principles, UI/UX standards, and best practices.You will work closely with designers and backend 
                developers to deliver seamless app experiences. Familiarity with REST APIs, Firebase, Push Notifications, and modern libraries like Jetpack is expected. 
                Experience with cross-platform frameworks like Flutter or React Native is a plus.
                </p>
                <div className='flex justify-between'>
                <p className='flex justify-between text-2xl'>Submit Your Resume:</p>
                <button
                  onClick={handleApplyClick}
                  className="border-2 rounded-2xl p-2 text-indigo-500 inline-flex cursor-pointer items-center"
                >
                  Apply Now
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
                </button>
                </div>
                

                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Job2;
