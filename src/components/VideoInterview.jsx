import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
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
  Grid,
  TextField,
  IconButton
} from '@mui/material';
import {
  Videocam,
  Mic,
  Stop,
  Keyboard,
  Refresh,
  VolumeUp
} from '@mui/icons-material';
import Webcam from 'react-webcam';

const VideoInterview = ({ open, onClose, resumeData, sessionId, userId }) => {
  const [step, setStep] = useState('verification');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [uploadingId, setUploadingId] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAnswer, setManualAnswer] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const synthRef = useRef(window.speechSynthesis);
  
  // Text-to-Speech function
  const speakQuestion = (questionText, index) => {
    return new Promise((resolve) => {
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(
        `Question ${index + 1}: ${questionText}`
      );
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      // utterance.lang = 'en-US';
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      setTimeout(() => {
        synthRef.current.speak(utterance);
      }, 200);
      
    });
  };

  // Start identity verification
  const startVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error("Could not capture image from webcam");
      
      const userId_local = localStorage.getItem("userId");
      if (!userId_local) throw new Error("User not logged in");
      
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('image', imageSrc);
      formData.append('user_id', userId_local);
      
      const response = await fetch('http://localhost:8000/verify-identity', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setVerificationStatus(data);
      
      if (data.verified) {
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
    const userId_local = localStorage.getItem("userId");
    
    try {
      const backendFormData = new FormData();
      backendFormData.append('userId', userId_local);
      backendFormData.append('file', file);
      
      const backendResponse = await fetch('http://localhost:8081/api/auth/upload-id-photo', {
        method: 'POST',
        body: backendFormData
      });
      
      if (!backendResponse.ok) throw new Error('Backend upload failed');
      
      const aiFormData = new FormData();
      aiFormData.append('user_id', userId_local);
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
  
  const loadQuestions = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const jobTitle = localStorage.getItem("currentJobTitle") || 
                       (resumeData?.job_title) || 
                       "Software Developer";
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
        else if (jobTitle.toLowerCase().includes("data")) skills = "Python, pandas, scikit-learn, SQL, Statistics";
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
      
      // Automatically ask first question after a short delay
      setTimeout(() => {
        // askCurrentQuestion();
        askQuestionByIndex(0);
      }, 1500);
      
    } catch (error) {
      console.error('Error loading questions:', error);
      setError(`Failed to generate questions: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const askCurrentQuestion = async () => {
    if (questions.length > 0 && currentQuestion < questions.length) {
      console.log(`🔊 Asking question ${currentQuestion + 1}: ${questions[currentQuestion]}`);
      setIsProcessing(true);
      await speakQuestion(questions[currentQuestion], currentQuestion);
      setIsProcessing(false);
      // Don't auto-start recording - let user click button
    }
  };

  const startRecording = () => {
    beginRecording();
  }
  
 
  const beginRecording = async () => {
    setIsRecording(true);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("🎤 Audio chunks:", audioChunksRef.current.length);
        await processAudioToText();
      };

      mediaRecorder.start(); // collect chunks every 1 sec

      setTimeout(() => {
        if(mediaRecorder.state === 'recording'){
                  stopRecording();
        }
      }, 15000); // reduce to 10 sec for testing

    } catch (err) {
      console.error('Microphone error:', err);
      alert('Could not access microphone. Please check permissions.');
      setIsRecording(false)
      setShowManualInput(true);
    }
  };
  
  const processAudioToText = async () => {
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('session_id', sessionId);
      
      const response = await fetch('http://localhost:8000/speech-to-text', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        const transcript = data.text || '';
        
        if (transcript && transcript.trim().length > 2) {
          await evaluateAnswer(transcript);
        } else {
          alert('No speech detected. Please type your answer.');
          setShowManualInput(true);
          setIsProcessing(false);
        }
      } else {
        alert('Speech recognition failed. Please type your answer.');
        setShowManualInput(true);
        setIsProcessing(false);
      }
      
    } catch (error) {
      console.error('Audio conversion error:', error);
      alert('Could not process audio. Please type your answer.');
      setShowManualInput(true);
      setIsProcessing(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };
  
  const handleManualSubmit = async () => {
    if (!manualAnswer.trim()) {
      alert('Please enter your answer before submitting.');
      return;
    }
    
    setShowManualInput(false);
    await evaluateAnswer(manualAnswer);
    setManualAnswer('');
  };


  const askQuestionByIndex = async (index) => {
    if (questions.length > 0 && index < questions.length) {
      console.log(`🔊 Asking question ${index + 1}: ${questions[index]}`);
  
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }

      setIsProcessing(true);
      await speakQuestion(questions[index], index);
      setIsProcessing(false);
    }
  };

  const evaluateAnswer = async (answerText) => {
    try {
      console.log(`📝 Evaluating answer for question ${currentQuestion + 1}:`, answerText);
    
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('answer', answerText);
      formData.append('question_index', currentQuestion);
    
      const response = await fetch('http://localhost:8000/evaluate-answer', {
        method: 'POST',
        body: formData
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Evaluation error response:', errorText);
        throw new Error(`Evaluation failed: ${response.status}`);
      }
    
      const data = await response.json();
      console.log('Evaluation result:', data);
    
      setCurrentScore(data.score);
      setFeedbackMessage(data.feedback || "Answer recorded successfully!");
      setShowFeedback(true);
    
      const newAnswer = {
        question: questions[currentQuestion],
        answer: answerText,
        score: data.score,
        feedback: data.feedback,
        timestamp: new Date().toISOString()
      };
    
      setAnswers(prev => [...prev, newAnswer]);
    
      // Show feedback for 2 seconds then move to next question
      setTimeout(() => {
        setShowFeedback(false);
      
        if (data.is_complete || currentQuestion + 1 >= questions.length) {
          console.log('Interview complete! Generating report...');
          generateReport();
        } else {
          console.log(`Moving to next question ${currentQuestion + 2}...`);
          const nextIndex = currentQuestion + 1;
          setCurrentQuestion(nextIndex);
          setIsProcessing(false);
          setManualAnswer('');
          audioChunksRef.current = [];
        
          // Ask the next question after a short delay
          setTimeout(() => {
            // askCurrentQuestion();
            askQuestionByIndex(nextIndex);
          }, 1500);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Error processing your answer. Moving to next question.');
      setIsProcessing(false);
    
      // Still move to next question even if evaluation fails
      if (currentQuestion + 1 < questions.length) {

        const nextIndex = currentQuestion + 1;

        setCurrentQuestion(nextIndex);
        setIsProcessing(false);
        setManualAnswer('');
        audioChunksRef.current = [];

        // 👇 PASS INDEX DIRECTLY (IMPORTANT FIX)
        setTimeout(() => {
          askQuestionByIndex(nextIndex);
        }, 1000);
      } else {
        generateReport();
      }
    }
  };
  
  const generateReport = async () => {
    setLoading(true);
    try {
      const candidateName = localStorage.getItem('userName') || 'Candidate';
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('candidate_name', candidateName);
      
      const response = await fetch('http://localhost:8000/generate-report', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setAnalysisResult(data);
      setStep('completed');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Interview completed but report generation failed.');
    }
    setLoading(false);
  };
  
  const progressPercentage = questions.length > 0 ? ((currentQuestion) / questions.length) * 100 : 0;
  
  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);
  
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
          
          {isSpeaking && (
            <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#6366f1', color: 'white', px: 2, py: 1, borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <VolumeUp sx={{ fontSize: 16 }} />
              <Typography variant="caption">AI Speaking...</Typography>
            </Box>
          )}
          
          {isRecording && (
            <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#ef4444', color: 'white', px: 2, py: 1, borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white', animation: 'pulse 1s infinite' }} />
              <Typography variant="caption">Recording...</Typography>
            </Box>
          )}
          
          {countdown > 0 && countdown < 4 && step === 'questions' && !isRecording && !isProcessing && !showFeedback && !showManualInput && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '12px' }}>
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
              <IconButton 
                size="small" 
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => speakQuestion(questions[currentQuestion], currentQuestion)}
                disabled={isSpeaking}
              >
                <VolumeUp fontSize="small" />
              </IconButton>
            </Paper>
            
            {/* Feedback Display */}
            {showFeedback && (
              <Alert severity={currentScore >= 60 ? "success" : currentScore >= 40 ? "warning" : "info"} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Score: {currentScore}%
                </Typography>
                <Typography variant="body2">
                  {feedbackMessage}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  Moving to next question...
                </Typography>
              </Alert>
            )}
            
            {/* Manual Input Mode */}
            {showManualInput && !showFeedback && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Keyboard /> Type your answer:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Type your answer here..."
                  value={manualAnswer}
                  onChange={(e) => setManualAnswer(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={() => setShowManualInput(false)}>
                    Back to Recording
                  </Button>
                  <Button variant="contained" onClick={handleManualSubmit}>
                    Submit Answer
                  </Button>
                </Box>
              </Paper>
            )}
            
            {/* Processing State */}
            {isProcessing && !showFeedback && !showManualInput && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 2 }}>Processing your answer...</Typography>
              </Box>
            )}
            
            {/* Recording Controls */}
            {!isRecording && !isProcessing && !showFeedback && !showManualInput && !isSpeaking && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<Mic />} 
                  onClick={startRecording} 
                  size="large"
                  sx={{ px: 4, py: 1.5 }}
                >
                  Record Answer
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Keyboard />} 
                  onClick={() => setShowManualInput(true)} 
                  size="large"
                >
                  Type Answer
                </Button>
              </Box>
            )}
            
            {isRecording && (
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                  <Button 
                    variant="contained" 
                    color="error" 
                    startIcon={<Stop />} 
                    onClick={stopRecording} 
                    size="large"
                  >
                    Stop Recording
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Speak clearly into your microphone. Maximum 30 seconds.
                </Typography>
              </Box>
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
                    {analysisResult.overall_score || 0}%
                  </Typography>
                  <Typography variant="body2">Overall Score</Typography>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                    {answers.length}/{questions.length}
                  </Typography>
                  <Typography variant="body2">Questions Answered</Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Verdict: 
                    <Chip 
                      label={analysisResult.verdict || "PENDING"} 
                      color={analysisResult.verdict === 'STRONG HIRE' ? 'success' : 
                             analysisResult.verdict === 'HIRE' ? 'info' : 
                             analysisResult.verdict === 'CONSIDER' ? 'warning' : 'error'}
                      sx={{ ml: 1 }} 
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {analysisResult.recommendation}
                  </Typography>
                </Card>
              </Grid>
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

