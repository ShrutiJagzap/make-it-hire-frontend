// import React, { useState, useRef, useEffect } from 'react';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   LinearProgress,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Alert,
//   Avatar,
//   Paper,
//   CircularProgress,
//   Grid
// } from '@mui/material';
// import {
//   Videocam,
//   Mic,
//   MicOff,
//   Stop,
//   CheckCircle,
//   Cancel,
//   EmojiEmotions,
//   SentimentSatisfied,
//   SentimentDissatisfied
// } from '@mui/icons-material';
// import Webcam from 'react-webcam';


// const VideoInterview = ({ open, onClose, resumeData, sessionId, userId }) => {
//   const [step, setStep] = useState('verification'); // verification, questions, completed
//   const [verificationStatus, setVerificationStatus] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [answers, setAnswers] = useState([]);
//   const [currentAnswer, setCurrentAnswer] = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [analysisResult, setAnalysisResult] = useState(null);
//   const [behaviorData, setBehaviorData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [countdown, setCountdown] = useState(3);

//   const [uploadingId, setUploadingId] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [showFeedback, setShowFeedback] = useState(false);
//   const [currentScore, setCurrentScore] = useState(0);
//   const [error, setError] = useState(null);
  
//   const webcamRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const recognitionRef = useRef(null);
  
//   // Start identity verification
//   const startVerification = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Capture frame from webcam
//       const imageSrc = webcamRef.current.getScreenshot();

//       if(!imageSrc) {
//         throw new Error("Could not capture image from webcam");
//       }

//       //Get user ID from localStorage
//       const userId = localStorage.getItem("userId");

//     if(!userId) {
//         throw new Error("User not logged in");
//     }
      
//       // Send to backend for verification
//       const formData = new FormData();
//       formData.append('session_id', sessionId);
//       formData.append('image', imageSrc);
//       formData.append('user_id', userId);
      
//       const response = await fetch('http://localhost:8000/verify-identity', {
//         method: 'POST',
//         body: formData
//       });
      
//       const data = await response.json();
//       setVerificationStatus(data);
      
//       if (data.verified) {
//         // Start behavioral analysis
//         startBehavioralAnalysis();
        
//         // Load questions
//         await loadQuestions();
        
//         setTimeout(() => {
//           setStep('questions');
//         }, 2000);
//       }
//     } catch (error) {
//       console.error('Verification error:', error);
//       setVerificationStatus({
//         verified: false,
//         message: "Verification failed:" + error.message
//       });
//     }
//     setLoading(false);
//   };

//   //handle ID upload if missing
//   const handleIdUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       alert('Please upload an image file (JPEG, PNG, etc.)');
//       return;
//     }
  
//     // Validate file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       alert('File too large. Please upload an image less than 5MB.');
//       return;
//     }

//     setUploadingId(true);

//     const userId = localStorage.getItem("userId");

//       if (!userId) {
//         alert('Please login first');
//         setUploadingId(false);
//         return;
//       }

//     try {
//         const backendFormData = new FormData();
//         backendFormData.append('userId', userId);
//         backendFormData.append('file', file);

//         const backendResponse = await fetch('http://localhost:8081/api/auth/upload-id-photo', {
//             method: 'POST',
//             body: backendFormData
//         });

//         if(!backendResponse.ok) {
//             const errorText = await backendResponse.text();
//             throw new Error(`Backend upload failed: ${errorText}`);
//         }

//         const backendData = await backendResponse.json();
//         console.log('Backend response:', backendData);

//         const aiFormData = new FormData();
//         aiFormData.append('user_id', userId);
//         aiFormData.append('file', file);

//         const aiResponse = await fetch('http://localhost:8000/upload-id-photo', {
//             method: 'POST',
//             body: aiFormData
//         });

//         if(!aiResponse.ok) {
//             const errorText = await aiResponse.text();
//             throw new Error(`AI service upload failed: ${aiResponse.status} - ${errorText}`);
//         }

//         const aiData = await aiResponse.json();
//         console.log('AI service response:', aiData);

//         if (aiData.success) {

//             localStorage.setItem('idPhotoUploaded', 'true');
//             localStorage.setItem('idPhotoTimestamp', Date.now().toString());
//             localStorage.setItem('idPhotoName', file.name);

//             alert('ID photo uploaded successfully! Please try verification again.');
//             setVerificationStatus(null);
//         } else {
//             throw new Error(aiData.message || "AI service upload failed");
//         }
//     } catch (error) {
//         console.error('Error uploading ID:', error);
//         alert('Failed to upload ID photo: ' + error.message);
//     } finally {
//         setUploadingId(false);
//     }     
//   };
  
//   // Start behavioral analysis (runs every 5 seconds)
//   const startBehavioralAnalysis = () => {
//     const interval = setInterval(async () => {
//       if (webcamRef.current && step === 'questions') {
//         const frame = webcamRef.current.getScreenshot();
        
//         try {
//           const formData = new FormData();
//           formData.append('session_id', sessionId);
//           formData.append('frame', frame);
          
//           const response = await fetch('http://localhost:8000/analyze-video', {
//             method: 'POST',
//             body: formData
//           });
          
//           const data = await response.json();
//           setBehaviorData(prev => [...prev.slice(-9), { ...data, timestamp: new Date() }]);
//         } catch (error) {
//           console.error('Behavior analysis error:', error);
//         }
//       }
//     }, 5000);
    
//     return () => clearInterval(interval);
//   };
  

// // const loadQuestions = async () => {
// //   try {
// //     setIsProcessing(true);
// //     setError(null);
    
// //     // Get job details from props or localStorage
// //     const jobTitle = localStorage.getItem("currentJobTitle") || "Software Developer";
// //     const jobDescription = localStorage.getItem("currentJobDescription") || "";
    
// //     // Get skills from resume
// //     const skills = resumeData?.skills_found?.join(", ") || 
// //                    (resumeData?.skills_found?.length ? resumeData.skills_found.join(", ") : "");
    
// //     console.log('Generating questions for job:', jobTitle);
// //     console.log('Candidate skills:', skills);
    
// //     const formData = new FormData();
// //     formData.append('session_id', sessionId);
// //     formData.append('job_title', jobTitle);
// //     formData.append('job_description', jobDescription);
// //     formData.append('resume_skills', skills);
    
// //     const response = await fetch('http://localhost:8000/generate-questions', {
// //       method: 'POST',
// //       body: formData
// //     });
    
// //     if (!response.ok) {
// //       const errorData = await response.json();
// //       throw new Error(errorData.detail || 'Failed to load questions');
// //     }
    
// //     const data = await response.json();
    
// //     if (!data.questions || data.questions.length === 0) {
// //       throw new Error('No questions generated');
// //     }
    
// //     console.log('✅ Questions loaded:', data.questions);
// //     setQuestions(data.questions);
    
// //     setTimeout(() => {
// //       setStep('questions');
// //     }, 1000);
    
// //   } catch (error) {
// //     console.error('Error loading questions:', error);
// //     setError(`Failed to generate interview questions: ${error.message}`);
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };

//   const loadQuestions = async () => {
//     try {
//       setIsProcessing(true);
//       setError(null);
    
//       const jobTitle = localStorage.getItem("currentJobTitle") || "Software Developer";
//       const jobDescription = localStorage.getItem("currentJobDescription") || "";
    
//       // // Ensure skills are properly formatted
//       // let skills = resumeData?.skills_found?.join(", ") || "";
//       // if (!skills && resumeData?.skills_found?.length) {
//       //   skills = resumeData.skills_found.join(", ");
//       // }
//       // if (!skills || skills.trim() === "") {
//       //   // Fallback: extract from resume text if available
//       //   skills = "Full Stack Development, Python, Java, JavaScript";
//       //   console.warn("No skills found in resume data, using default skills");
//       // }
//           // Get skills from resumeData - ensure it's properly formatted
//       let skills = "";
    
//       if (resumeData) {
//         // Check different possible locations of skills in resumeData
//         if (resumeData.skills_found && resumeData.skills_found.length > 0) {
//           skills = resumeData.skills_found.join(", ");
//         } else if (resumeData.skills && typeof resumeData.skills === 'string') {
//           skills = resumeData.skills;
//         } else if (resumeData.skills && Array.isArray(resumeData.skills)) {
//           skills = resumeData.skills.join(", ");
//         } else if (resumeData.skills_found && resumeData.skills_found.length === 0) {
//           // If no skills found, use job title derived skills
//           skills = "Full Stack Development, Python, Java, JavaScript";
//         }
//       }
    
//       // If still no skills, use default based on job title
//       if (!skills || skills.trim() === "") {
//         if (jobTitle.toLowerCase().includes("frontend")) {
//           skills = "React, JavaScript, HTML, CSS";
//         } else if (jobTitle.toLowerCase().includes("backend")) {
//           skills = "Java, Spring Boot, Python, Node.js";
//         } else if (jobTitle.toLowerCase().includes("full stack")) {
//           skills = "React, Node.js, Python, JavaScript, SQL";
//         } else if (jobTitle.toLowerCase().includes("android")) {
//           skills = "Kotlin, Java, Android SDK, Firebase";
//         } else {
//           skills = "Python, Java, JavaScript, React, SQL";
//         }
//       }
    
    
//       console.log('Generating questions for job:', jobTitle);
//       console.log('Candidate skills:', skills);
    
//       const formData = new FormData();
//       formData.append('session_id', sessionId);
//       formData.append('job_title', jobTitle);
//       formData.append('job_description', jobDescription);
//       formData.append('resume_skills', skills);
    
//       const response = await fetch('http://localhost:8000/generate-questions', {
//         method: 'POST',
//         body: formData
//       });
    
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Failed to load questions');
//       }
    
//       const data = await response.json();
    
//       if (!data.questions || data.questions.length === 0) {
//         throw new Error('No questions generated');
//     }
    
//       console.log('✅ Questions loaded:', data.questions);
//       setQuestions(data.questions);
    
//       setTimeout(() => {
//         setStep('questions');
//       }, 1000);
    
//     } catch (error) {
//       console.error('Error loading questions:', error);
//       setError(`Failed to generate interview questions: ${error.message}`);
//       // Optional: show a retry button
//     } finally {
//       setIsProcessing(false);
//     }
//   };
  
//   // Start recording answer
//   const startRecording = () => {
//     setCountdown(3);
//     const countdownInterval = setInterval(() => {
//       setCountdown(prev => {
//         if (prev <= 1) {
//           clearInterval(countdownInterval);
//           beginRecording();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };
  
//   // const beginRecording = () => {
//   //   setIsRecording(true);
//   //   audioChunksRef.current = [];
    
//   //   navigator.mediaDevices.getUserMedia({ audio: true })
//   //     .then(stream => {
//   //       mediaRecorderRef.current = new MediaRecorder(stream);
//   //       mediaRecorderRef.current.ondataavailable = (event) => {
//   //         audioChunksRef.current.push(event.data);
//   //       };
//   //       mediaRecorderRef.current.onstop = handleAudioStop;
//   //       mediaRecorderRef.current.start();
        
//   //       // Auto-stop after 30 seconds
//   //       setTimeout(() => {
//   //         if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//   //           stopRecording();
//   //         }
//   //       }, 30000);
//   //     });
//   // };

//   const beginRecording = () => {
//     setIsRecording(true);
//     setTranscript('');
//     audioChunksRef.current = [];
  
//     // Start speech recognition for real-time transcription
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       recognitionRef.current = new SpeechRecognition();
//       recognitionRef.current.continuous = true;
//       recognitionRef.current.interimResults = true;
//       recognitionRef.current.lang = 'en-US';
      
//       recognitionRef.current.onresult = (event) => {
//         let finalTranscript = '';
//         let interimTranscript = '';
      
//         for (let i = event.resultIndex; i < event.results.length; i++) {
//           const transcript = event.results[i][0].transcript;
//           if (event.results[i].isFinal) {
//             finalTranscript += transcript + ' ';
//           } else {
//             interimTranscript += transcript;
//           }
//         }
      
//         if (finalTranscript) {
//           setTranscript(prev => prev + finalTranscript);
//         }
//       };
    
//       recognitionRef.current.onerror = (event) => {
//         console.error('Speech recognition error:', event.error);
//       };
    
//       recognitionRef.current.start();
//     }
  
//     // Also record audio for backup
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then(stream => {
//         mediaRecorderRef.current = new MediaRecorder(stream);
//         mediaRecorderRef.current.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunksRef.current.push(event.data);
//           }
//         };
//         mediaRecorderRef.current.start();
        
//         // Auto-stop after 30 seconds
//         setTimeout(() => {
//           if (isRecording) {
//             stopRecording();
//           }
//         }, 30000);
//       })
//       .catch(err => {
//         console.error('Error accessing microphone:', err);
//         alert('Please allow microphone access to record your answer');
//         setIsRecording(false);
//         });
//   };
  
//   // const stopRecording = () => {
//   //   if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//   //     mediaRecorderRef.current.stop();
//   //     mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//   //   }
//   //   setIsRecording(false);
//   // };

//   const stopRecording = () => {
//     setIsRecording(false);
//     setIsProcessing(true);
  
//     // Stop speech recognition
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//     }
  
//     // Stop media recorder
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//       mediaRecorderRef.current.onstop = async () => {
//         const finalAnswer = transcript.trim();
      
//         if (!finalAnswer) {
//           alert('No speech detected. Please try again.');
//           setIsProcessing(false);
//           return;
//         }
        
//         setCurrentAnswer(finalAnswer);
//         await evaluateAnswer(finalAnswer);
//       };
//       mediaRecorderRef.current.stop();
//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//     } else {
//       // If no recording, use transcript from recognition
//       const finalAnswer = transcript.trim();
//       if (finalAnswer) {
//         setCurrentAnswer(finalAnswer);
//         evaluateAnswer(finalAnswer);
//       } else {
//         setIsProcessing(false);
//         alert('No speech detected. Please try again.');
//       }
//     }
//   };
  
//   const handleAudioStop = async () => {
//     const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
//     // Convert to text using speech recognition
//     const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//     recognition.lang = 'en-US';
    
//     recognition.onresult = async (event) => {
//       const transcript = event.results[0][0].transcript;
//       setCurrentAnswer(transcript);
      
//       // Evaluate answer
//       await evaluateAnswer(transcript);
//     };
    
//     recognition.start();
//   };
  
//   // const evaluateAnswer = async (answerText) => {
//   //   try {
//   //      setIsProcessing(true);

//   //     const formData = new FormData();
//   //     formData.append('session_id', sessionId);
//   //     formData.append('answer', answerText);
//   //     formData.append('question_index', currentQuestion);
      
//   //     const response = await fetch('http://localhost:8000/evaluate-answer', {
//   //       method: 'POST',
//   //       body: formData
//   //     });
//   //     if (!response.ok) {
//   //       const errorText = await response.text();
//   //       console.error('Evaluation error response:', errorText);
//   //       throw new Error(`Evaluation failed: ${response.status}`);
//   //     }
      
//   //     const data = await response.json();

//   //     setCurrentScore(data.score);
//   //     setShowFeedback(true);
      
//   //     setAnswers(prev => [...prev, {
//   //       question: questions[currentQuestion],
//   //       answer: answerText,
//   //       score: data.score,
//   //       keyword_match: data.keyword_match,
//   //       depth_score: data.depth_score,
//   //       feedback: data.feedback,
//   //       matched_keywords: data.matched_keywords
//   //     }]);
      
//   //     if (data.is_complete) {
//   //       // Interview complete, generate report
//   //       await generateReport();
//   //     } else {
//   //       // Move to next question
//   //       setCurrentQuestion(prev => prev + 1);
//   //       setCurrentAnswer('');
//   //     }
//   //   } catch (error) {
//   //     console.error('Error evaluating answer:', error);
//   //   }
//   // };

//   const evaluateAnswer = async (answerText) => {
//     try {
//       setIsProcessing(true);
    
//       console.log(`Evaluating answer for question ${currentQuestion + 1}:`, answerText);
    
//       const formData = new FormData();
//       formData.append('session_id', sessionId);
//       formData.append('answer', answerText);
//       formData.append('question_index', currentQuestion);
    
//       const response = await fetch('http://localhost:8000/evaluate-answer', {
//         method: 'POST',
//         body: formData
//       });
    
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Evaluation error response:', errorText);
//         throw new Error(`Evaluation failed: ${response.status}`);
//       }
    
//       const data = await response.json();
//       console.log('Evaluation result:', data);
    
//       setCurrentScore(data.score);
//       setShowFeedback(true);
    
//       const newAnswer = {
//         question: questions[currentQuestion],
//         answer: answerText,
//         score: data.score,
//         feedback: data.feedback,
//         timestamp: new Date().toISOString()
//       };
    
//       setAnswers(prev => [...prev, newAnswer]);
    
//       // Show feedback briefly then move on
//       setTimeout(() => {
//         setShowFeedback(false);
      
//         if (data.is_complete) {
//           console.log('Interview complete! Generating report...');
//           generateReport();
//         } else {
//           console.log('Moving to next question...');
//           setCurrentQuestion(prev => prev + 1);
//           setCurrentAnswer('');
//           setTranscript('');
//           setIsProcessing(false);
//         }
//       }, 2000);
    
//     } catch (error) {
//       console.error('Error evaluating answer:', error);
//       alert('Error evaluating answer: ' + error.message);
//       setIsProcessing(false);
//     }
//   };
  
//   const generateReport = async () => {
//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('session_id', sessionId);
//       formData.append('candidate_name', localStorage.getItem('userName') || 'Candidate');
      
//       const response = await fetch('http://localhost:8000/generate-report', {
//         method: 'POST',
//         body: formData
//       });
      
//       const data = await response.json();
//       setAnalysisResult(data);
//       setStep('completed');
//     } catch (error) {
//       console.error('Error generating report:', error);
//     }
//     setLoading(false);
//   };
  
//   // Get emotion icon
//   const getEmotionIcon = (emotion) => {
//     switch(emotion) {
//       case 'happy': return <EmojiEmotions className="text-green-500" />;
//       case 'neutral': return <SentimentSatisfied className="text-blue-500" />;
//       case 'sad': return <SentimentDissatisfied className="text-gray-500" />;
//       default: return <SentimentSatisfied className="text-gray-400" />;
//     }
//   };
  
//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//       <DialogTitle className="border-b">
//         <Box className="flex justify-between items-center">
//           <Typography variant="h6">AI-Powered Video Interview</Typography>
//           {step === 'questions' && (
//             <Chip 
//               label={`Question ${currentQuestion + 1}/${questions.length}`}
//               color="primary"
//             />
//           )}
//         </Box>
//       </DialogTitle>
      
//       <DialogContent className="p-6">
//         {/* Webcam Feed */}
//         <Box className="mb-6 relative">
//           <Webcam
//             ref={webcamRef}
//             audio={false}
//             screenshotFormat="image/jpeg"
//             className="w-full rounded-lg shadow-lg"
//             videoConstraints={{
//               width: 640,
//               height: 480,
//               facingMode: "user"
//             }}
//           />
          
//           {/* Behavioral Analysis Overlay */}
//           {behaviorData.length > 0 && (
//             <Box className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
//               <Typography variant="caption" className="block font-bold">Live Analysis</Typography>
//               <Box className="flex items-center gap-2 mt-1">
//                 {getEmotionIcon(behaviorData[behaviorData.length-1]?.emotion)}
//                 <span className="text-sm capitalize">
//                   {behaviorData[behaviorData.length-1]?.emotion}
//                 </span>
//               </Box>
//               <Typography variant="caption" className="block mt-1">
//                 Engagement: {behaviorData[behaviorData.length-1]?.engagement_score}%
//               </Typography>
//             </Box>
//           )}
          
//           {countdown > 0 && countdown < 4 && step === 'questions' && !isRecording && (
//             <Box className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
//               <Typography variant="h1" className="text-white font-bold">
//                 {countdown}
//               </Typography>
//             </Box>
//           )}
//         </Box>
        
//         {/* Step: Verification */}
//         {step === 'verification' && (
//           <Box className="text-center py-8">
//             <Videocam className="text-6xl text-indigo-600 mb-4 mx-auto" />
//             <Typography variant="h6" className="mb-4">
//               Identity Verification Required
//             </Typography>
//             <Typography variant="body2" className="text-gray-600 mb-6">
//               Please look at the camera for biometric verification
//             </Typography>
            
//             {verificationStatus && (
//               <Alert 
//                 severity={verificationStatus.verified ? "success" : "error"}
//                 className="mb-4"
//                 action={
//                     verificationStatus.requiresUpload || (!verificationStatus.verified && !verificationStatus.requiresUpload) ? (
//                         <Button color="inherit" size="small" component="label" disabled={uploadingId}> {uploadingId ? 'Uploading...' : 'Upload ID Photo'}
//                             <input type="file" hidden accept="image/*" onChange={handleIdUpload} />
//                         </Button>
//                     ) : null
//                 }
//               >
//                 {verificationStatus.message || (verificationStatus.verified ? `Identity verified with ${verificationStatus.confidence}% confidence` : "Identity verification failed. Please try again.")}
//               </Alert>
//             )}

//             {/* Instructions for better verification */}
//             <Paper className="p-4 mb-6 bg-blue-50 text-left">
//                 <Typography variant="subtitle2" className="font-bold mb-2">Tips for successful verification:</Typography>
//                 <ul className="list-disc pl-5 text-sm text-gray-700">
//                     <li>Ensure good lighting on your face</li>
//                     <li>Remove glasses or sunglasses</li>
//                     <li>Look directly at the camera</li>
//                     <li>Make sure your entire face is visible</li>
//                     <li>Hold still for 2-3 second</li>
//                     <li>Your uploaded ID photo should be clear and recent</li>
//                 </ul>
//             </Paper>
            
//             <Box className="mb-4 p-3 bg-gray-100 rounded-lg">
//               <Box className="flex items-center gap-2">
//                 <Typography variant="body2" className="font-medium">
//                   ID Photo Status:
//                 </Typography>
//                 {localStorage.getItem('idPhotoUploaded') ? 
//                   <Chip label="Uploaded" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534' }} /> : 
//                   <Chip label="Not Uploaded" size="small" sx={{ bgcolor: '#fef9c3', color: '#854d0e' }} />
//                 }
//               </Box>
//               {localStorage.getItem('idPhotoUploaded') && (
//                 <Typography variant="caption" className="text-gray-500 block mt-2">
//                   Uploaded: {new Date(parseInt(localStorage.getItem('idPhotoTimestamp'))).toLocaleString()}
//                 </Typography>
//               )}
//             </Box>

//             <Button
//               variant="contained"
//               color="primary"
//               onClick={startVerification}
//               disabled={loading}
//               className="px-8"
//               startIcon={loading ? <CircularProgress size={20} /> : null}
//             >
//               {loading ? 'Verifying...' : 'Start Verification'}
//             </Button>
//           </Box>
//         )}
        
//         {/* Step: Questions */}
//         {step === 'questions' && questions.length > 0 && (
//           <Box>
//             <Paper className="p-6 mb-4 bg-indigo-50">
//               <Typography variant="body1" className="font-medium">
//                 {questions[currentQuestion]}
//               </Typography>
//             </Paper>
            
//             {currentAnswer && (
//               <Alert severity="info" className="mb-4">
//                 <Typography variant="body2">
//                   Your answer: {currentAnswer}
//                 </Typography>
//               </Alert>
//             )}
            
//             <Box className="flex justify-center gap-4">
//               {!isRecording ? (
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   startIcon={<Mic />}
//                   onClick={startRecording}
//                   disabled={loading}
//                 >
//                   Record Answer
//                 </Button>
//               ) : (
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={stopRecording}
//                 >
//                   Stop Recording
//                 </Button>
//               )}
//             </Box>
//           </Box>
//         )}
        
//         {/* Step: Completed */}
//         {step === 'completed' && analysisResult && (
//           <Box className="py-4">
//             <Alert severity="success" className="mb-6">
//               Interview completed successfully! Your report has been generated.
//             </Alert>
            
//             <Grid container spacing={3}>
//               <Grid item xs={6}>
//                 <Card className="p-4 text-center">
//                   <Typography variant="h4" className="text-indigo-600 font-bold">
//                     {analysisResult.overall_score}%
//                   </Typography>
//                   <Typography variant="body2">Overall Score</Typography>
//                 </Card>
//               </Grid>
              
//               <Grid item xs={6}>
//                 <Card className="p-4 text-center">
//                   <Typography variant="h4" className="text-green-600 font-bold">
//                     {analysisResult.interview_score}%
//                   </Typography>
//                   <Typography variant="body2">Interview Score</Typography>
//                 </Card>
//               </Grid>
              
//               <Grid item xs={12}>
//                 <Typography variant="subtitle1" className="font-bold mb-2">
//                   Verdict: 
//                   <Chip 
//                     label={analysisResult.verdict}
//                     color={
//                       analysisResult.verdict === 'STRONG HIRE' ? 'success' :
//                       analysisResult.verdict === 'HIRE' ? 'info' :
//                       analysisResult.verdict === 'CONSIDER' ? 'warning' : 'error'
//                     }
//                     className="ml-2"
//                   />
//                 </Typography>
//               </Grid>
              
//               <Grid item xs={12}>
//                 <Typography variant="subtitle2" className="font-bold mb-2">
//                   Recommendations:
//                 </Typography>
//                 <ul className="list-disc pl-5">
//                   {analysisResult.recommendations?.map((rec, i) => (
//                     <li key={i} className="text-sm text-gray-700">{rec}</li>
//                   ))}
//                 </ul>
//               </Grid>
//             </Grid>
//           </Box>
//         )}
//       </DialogContent>
      
//       <DialogActions className="border-t p-4">
//         <Button onClick={onClose} color="inherit">
//           Close
//         </Button>
//         {step === 'completed' && (
//           <Button 
//             variant="contained" 
//             color="primary"
//             onClick={() => {
//               onClose();
//               window.location.reload();
//             }}
//           >
//             View Dashboard
//           </Button>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default VideoInterview;




import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Paper,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Videocam,
  Mic,
  Stop,
  EmojiEmotions,
  SentimentSatisfied,
  SentimentDissatisfied
} from '@mui/icons-material';
import Webcam from 'react-webcam';

const VideoInterview = ({ open, onClose, resumeData, sessionId, userId }) => {
  const [step, setStep] = useState('verification');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [behaviorData, setBehaviorData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [uploadingId, setUploadingId] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [error, setError] = useState(null);
  
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  
  // Start identity verification
  const startVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error("Could not capture image from webcam");
      
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User not logged in");
      
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('image', imageSrc);
      formData.append('user_id', userId);
      
      const response = await fetch('http://localhost:8000/verify-identity', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setVerificationStatus(data);
      
      if (data.verified) {
        startBehavioralAnalysis();
        await loadQuestions();
        setTimeout(() => setStep('questions'), 2000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus({ verified: false, message: "Verification failed: " + error.message });
    }
    setLoading(false);
  };

  const handleIdUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploadingId(true);
    const userId = localStorage.getItem("userId");
    
    try {
      const backendFormData = new FormData();
      backendFormData.append('userId', userId);
      backendFormData.append('file', file);
      
      const backendResponse = await fetch('http://localhost:8081/api/auth/upload-id-photo', {
        method: 'POST',
        body: backendFormData
      });
      
      if (!backendResponse.ok) throw new Error('Backend upload failed');
      
      const aiFormData = new FormData();
      aiFormData.append('user_id', userId);
      aiFormData.append('file', file);
      
      const aiResponse = await fetch('http://localhost:8000/upload-id-photo', {
        method: 'POST',
        body: aiFormData
      });
      
      const aiData = await aiResponse.json();
      
      if (aiData.success) {
        localStorage.setItem('idPhotoUploaded', 'true');
        localStorage.setItem('idPhotoTimestamp', Date.now().toString());
        alert('✅ ID photo uploaded successfully!');
        setVerificationStatus(null);
      } else {
        throw new Error(aiData.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload ID photo: ' + error.message);
    } finally {
      setUploadingId(false);
    }
  };
  
  const startBehavioralAnalysis = () => {
    const interval = setInterval(async () => {
      if (webcamRef.current && step === 'questions') {
        const frame = webcamRef.current.getScreenshot();
        // Analysis code here
      }
    }, 5000);
    return () => clearInterval(interval);
  };
  
  const loadQuestions = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const jobTitle = localStorage.getItem("currentJobTitle") || "Software Developer";
      const jobDescription = localStorage.getItem("currentJobDescription") || "";
      
      let skills = "";
      if (resumeData) {
        if (resumeData.skills_found && resumeData.skills_found.length > 0) {
          skills = resumeData.skills_found.join(", ");
        } else if (resumeData.skills && typeof resumeData.skills === 'string') {
          skills = resumeData.skills;
        }
      }
      
      if (!skills || skills.trim() === "") {
        if (jobTitle.toLowerCase().includes("frontend")) skills = "React, JavaScript, HTML, CSS";
        else if (jobTitle.toLowerCase().includes("backend")) skills = "Java, Spring Boot, Python, Node.js";
        else if (jobTitle.toLowerCase().includes("full stack")) skills = "React, Node.js, Python, JavaScript, SQL";
        else skills = "Python, Java, JavaScript, React, SQL";
      }
      
      console.log('Generating questions for job:', jobTitle);
      console.log('Candidate skills:', skills);
      
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('job_title', jobTitle);
      formData.append('job_description', jobDescription);
      formData.append('resume_skills', skills);
      
      const response = await fetch('http://localhost:8000/generate-questions', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to load questions');
      
      const data = await response.json();
      if (!data.questions || data.questions.length === 0) throw new Error('No questions generated');
      
      console.log('✅ Questions loaded:', data.questions);
      setQuestions(data.questions);
      setTimeout(() => setStep('questions'), 1000);
      
    } catch (error) {
      console.error('Error loading questions:', error);
      setError(`Failed to generate questions: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const startRecording = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          beginRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const beginRecording = () => {
    setIsRecording(true);
    setTranscript('');
    audioChunksRef.current = [];
    
    // Speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };
      
      recognitionRef.current.start();
    }
    
    // Audio recording
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.start();
        setTimeout(() => { if (isRecording) stopRecording(); }, 30000);
      })
      .catch(err => {
        console.error('Microphone error:', err);
        alert('Please allow microphone access');
        setIsRecording(false);
      });
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    if (recognitionRef.current) recognitionRef.current.stop();
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = async () => {
        const finalAnswer = transcript.trim();
        if (!finalAnswer) {
          alert('No speech detected. Please try again.');
          setIsProcessing(false);
          return;
        }
        setCurrentAnswer(finalAnswer);
        await evaluateAnswer(finalAnswer);
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    } else {
      const finalAnswer = transcript.trim();
      if (finalAnswer) {
        setCurrentAnswer(finalAnswer);
        evaluateAnswer(finalAnswer);
      } else {
        setIsProcessing(false);
        alert('No speech detected. Please try again.');
      }
    }
  };
  
  const evaluateAnswer = async (answerText) => {
    try {
      console.log(`Evaluating answer for question ${currentQuestion + 1}:`, answerText);
      
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('answer', answerText);
      formData.append('question_index', currentQuestion);
      
      const response = await fetch('http://localhost:8000/evaluate-answer', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error(`Evaluation failed: ${response.status}`);
      
      const data = await response.json();
      console.log('Evaluation result:', data);
      
      setCurrentScore(data.score);
      setShowFeedback(true);
      
      const newAnswer = {
        question: questions[currentQuestion],
        answer: answerText,
        score: data.score,
        feedback: data.feedback,
        timestamp: new Date().toISOString()
      };
      
      setAnswers(prev => [...prev, newAnswer]);
      
      // Show feedback for 2 seconds then move on
      setTimeout(() => {
        setShowFeedback(false);
        
        if (data.is_complete || currentQuestion + 1 >= questions.length) {
          console.log('Interview complete! Generating report...');
          generateReport();
        } else {
          console.log('Moving to next question...');
          setCurrentQuestion(prev => prev + 1);
          setCurrentAnswer('');
          setTranscript('');
          setIsProcessing(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Error evaluating answer: ' + error.message);
      setIsProcessing(false);
    }
  };
  
  const generateReport = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('candidate_name', localStorage.getItem('userName') || 'Candidate');
      
      const response = await fetch('http://localhost:8000/generate-report', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setAnalysisResult(data);
      setStep('completed');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
    setLoading(false);
  };
  
  const getEmotionIcon = (emotion) => {
    switch(emotion) {
      case 'happy': return <EmojiEmotions sx={{ color: '#22c55e' }} />;
      case 'neutral': return <SentimentSatisfied sx={{ color: '#3b82f6' }} />;
      default: return <SentimentSatisfied sx={{ color: '#9ca3af' }} />;
    }
  };
  
  const progressPercentage = questions.length > 0 ? (currentQuestion / questions.length) * 100 : 0;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">AI-Powered Video Interview</Typography>
          {step === 'questions' && questions.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label={`Question ${currentQuestion + 1}/${questions.length}`} color="primary" size="small" />
              <Typography variant="caption" color="textSecondary">{Math.round(progressPercentage)}% Complete</Typography>
            </Box>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {/* Progress Bar */}
        {step === 'questions' && questions.length > 0 && (
          <LinearProgress variant="determinate" value={progressPercentage} sx={{ mb: 3, height: 8, borderRadius: 4 }} />
        )}
        
        {/* Webcam Feed */}
        <Box sx={{ mb: 3, position: 'relative' }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
          />
          
          {isRecording && (
            <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#ef4444', color: 'white', px: 2, py: 1, borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white', animation: 'pulse 1s infinite' }} />
              <Typography variant="caption">Recording...</Typography>
            </Box>
          )}
          
          {countdown > 0 && countdown < 4 && step === 'questions' && !isRecording && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.5)' }}>
              <Typography variant="h1" sx={{ color: 'white', fontWeight: 'bold' }}>{countdown}</Typography>
            </Box>
          )}
        </Box>
        
        {/* Step: Verification */}
        {step === 'verification' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Videocam sx={{ fontSize: 64, color: '#6366f1', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Identity Verification Required</Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 4 }}>Please look at the camera for biometric verification</Typography>
            
            {verificationStatus && (
              <Alert severity={verificationStatus.verified ? "success" : "error"} sx={{ mb: 3 }}>
                {verificationStatus.message}
                {verificationStatus.requiresUpload && (
                  <Button size="small" component="label" sx={{ ml: 2 }}>
                    Upload ID Photo
                    <input type="file" hidden accept="image/*" onChange={handleIdUpload} />
                  </Button>
                )}
              </Alert>
            )}
            
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#eff6ff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>Tips for successful verification:</Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {["Ensure good lighting on your face", "Remove glasses or sunglasses", "Look directly at the camera", "Make sure your entire face is visible", "Hold still for 2-3 seconds"].map((tip, i) => (
                  <Typography component="li" key={i} variant="body2" sx={{ mb: 0.5 }}>{tip}</Typography>
                ))}
              </Box>
            </Paper>
            
            <Button variant="contained" onClick={startVerification} disabled={loading} sx={{ px: 4 }}>
              {loading ? <CircularProgress size={24} /> : 'Start Verification'}
            </Button>
          </Box>
        )}
        
        {/* Step: Questions */}
        {step === 'questions' && questions.length > 0 && (
          <Box>
            <Paper sx={{ p: 4, mb: 3, bgcolor: '#f5f3ff' }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>{questions[currentQuestion]}</Typography>
            </Paper>
            
            {/* Feedback Display */}
            {showFeedback && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Score: {currentScore}%
                </Typography>
                <Typography variant="body2">
                  {answers[answers.length - 1]?.feedback || "Good answer!"}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  Moving to next question...
                </Typography>
              </Alert>
            )}
            
            {/* Processing State */}
            {isProcessing && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 2 }}>Analyzing your answer...</Typography>
              </Box>
            )}
            
            {/* Transcript Display */}
            {transcript && !isRecording && !isProcessing && !showFeedback && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Your answer:</Typography>
                <Typography variant="body2">{transcript}</Typography>
              </Alert>
            )}
            
            {/* Recording Controls */}
            {!isRecording && !isProcessing && !showFeedback && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" startIcon={<Mic />} onClick={startRecording} size="large">
                  Record Answer
                </Button>
              </Box>
            )}
            
            {isRecording && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" color="error" startIcon={<Stop />} onClick={stopRecording} size="large">
                  Stop Recording
                </Button>
              </Box>
            )}
            
            {/* Re-record Option */}
            {currentAnswer && !isRecording && !isProcessing && !showFeedback && (
              <Button variant="outlined" onClick={() => { setCurrentAnswer(''); setTranscript(''); startRecording(); }} sx={{ mt: 2, width: '100%' }}>
                Re-record Answer
              </Button>
            )}
          </Box>
        )}
        
        {/* Step: Completed */}
        {step === 'completed' && analysisResult && (
          <Box sx={{ py: 2 }}>
            <Alert severity="success" sx={{ mb: 4 }}>
              Interview completed successfully! Your report has been generated.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
                    {analysisResult.overall_score || analysisResult.technical_score || 0}%
                  </Typography>
                  <Typography variant="body2">Overall Score</Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                    {analysisResult.questions_answered || answers.length}/{analysisResult.total_questions || questions.length}
                  </Typography>
                  <Typography variant="body2">Questions Answered</Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Verdict: 
                    <Chip label={analysisResult.verdict || analysisResult.recommendation || "PENDING"} 
                      color={analysisResult.verdict === 'STRONG HIRE' ? 'success' : analysisResult.verdict === 'HIRE' ? 'info' : analysisResult.verdict === 'CONSIDER' ? 'warning' : 'error'}
                      sx={{ ml: 1 }} />
                  </Typography>
                </Card>
              </Grid>
              
              {analysisResult.strengths && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>AI-Identified Strengths:</Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {analysisResult.strengths.map((strength, i) => (
                        <Typography component="li" key={i} variant="body2" sx={{ mb: 1 }}>{strength}</Typography>
                      ))}
                    </Box>
                  </Card>
                </Grid>
              )}
              
              {analysisResult.areas_for_improvement && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Areas for Improvement:</Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {analysisResult.areas_for_improvement.map((area, i) => (
                        <Typography component="li" key={i} variant="body2" sx={{ mb: 1 }}>{area}</Typography>
                      ))}
                    </Box>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ borderTop: '1px solid #e5e7eb', p: 2 }}>
        <Button onClick={onClose} color="inherit">Close</Button>
        {step === 'completed' && (
          <Button variant="contained" onClick={() => { onClose(); window.location.reload(); }}>
            View Dashboard
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default VideoInterview;