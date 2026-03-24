// import React, { useState } from 'react';
// import { useEffect } from 'react';
// import { fetchUserProfile } from '../config/authService';
// import AdminReports from './AdminReports';
// import { createJob } from "../config/jobService";
// import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
// import {
//   Box,
//   Typography,
//   Slider,
//   Card,
//   CardContent,
//   Avatar,
//   Grid,
//   LinearProgress,
//   Paper,
//   Chip,
//   Container,
//   Divider,
//   Tooltip as MuiTooltip,
//   Button,
//   TextField
// } from '@mui/material';
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   LineChart,
//   Line
// } from 'recharts';
// import { Info as InfoIcon } from '@mui/icons-material';

// const ResumeDashboard = () => {
//   const [completionPercentage, setCompletionPercentage] = useState(65);

//   const [note, setNote] = useState("");


//   const [notes, setNotes] = useState([]);

//   const [userData, setUserData] = useState(null);

//   const [activeTab, setActiveTab] = useState('dashboard');

//   const [newAppOpen,setNewAppOpen] = useState(false);
//   const [jobForm,setJobForm] = useState({
//    jobTitle:"",
//    companyName:"",
//    description:"",
//    skills: "",
//    experience: "",
//    location: "",
//    salary: "",
//    deadline: ""
//   });

//   const handleCreateJob = async () => {
//     try {
//       const res = await fetch("http://localhost:8081/api/jobs/create", {
//         method: "POST",
//         headers: {
//           "content-Type": "application/json"
//         },
//         body: JSON.stringify(jobForm)
//       });
//       if(res.ok){
//         alert("Job Created successfully");
//         setNewAppOpen(false);
//       }
//     } catch(error) {
//       console.log(error);
//     }

//   //  await createJob(jobForm);

//   //  alert("Job Created Successfully");

//   //  setNewAppOpen(false);
//   };

//   useEffect(() => {
//     const userId = localStorage.getItem("userId");

//     if(userId) {
//       fetchUserProfile(userId)
//         .then((data) => {
//           setUserData({
//             name: data.fullName,
//             title: data.title,
//             email: data.email,
//             phone: data.phone,
//             location: data.location,
//             skills: data.about ? data.about.split(",") : [],
//             profileImage: data.photoUrl
//               ? `http://localhost:8081/api/auth/profile/image/${data.photoUrl}`
//               : ""
//         });
//       })
//        .catch((error) => console.error(error));
//      }
//   }, []);

//   const [editOpen, setEditOpen] = useState(false);
//   const [editForm, setEditForm] = useState(null);

//   useEffect(() => {
//     if (userData) {
//       setEditForm(userData);
//     }
//   }, [userData]);

//   const skillsData = [
//     { name: 'React', value: 85 },
//     { name: 'JavaScript', value: 90 },
//     { name: 'TypeScript', value: 75 },
//     { name: 'Node.js', value: 70 },
//     { name: 'AWS', value: 65 },
//   ];

//   const applicationData = [
//     { name: 'Applied', value: 24 },
//     { name: 'Interview', value: 12 },
//     { name: 'Offer', value: 3 },
//     { name: 'Rejected', value: 9 },
//   ];

//   const recentActivity = [
//     "Updated Work Experience section",
//     "Applied to Google",
//     "Added AWS certification",
//     "Updated profile picture",
//     "Completed Education section"
//   ];


//   const updateProfile = async () => {
//     const userId = localStorage.getItem("userId");

//     try {
//       const res = await fetch(
//         `http://localhost:8081/api/auth/profile/${userId}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             fullName: editForm.name,
//             email: editForm.email,
//             phone: editForm.phone,
//             location: editForm.location,
//             title: editForm.title,
//             about: editForm.skills.join(",")
//           }),
//         }
//       );

//       const data = await res.json();
  
//       setUserData({
//         name: data.fullName,
//         title: data.title,
//         email: data.email,
//         phone: data.phone,
//         location: data.location,
//         skills: data.about ? data.about.split(",") : [],
//         profileImage: data.photoUrl
//           ? `http://localhost:8081/api/auth/profile/image/${data.photoUrl}`
//           : ""
//       });
  
//       setEditOpen(false);
  
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handlePhotoUpload = async (file) => {
//     const userId = localStorage.getItem("userId");

//     const formData = new FormData();
//     formData.append("file", file);

//     const res = await fetch(
//       `http://localhost:8081/api/auth/profile/upload/${userId}`,
//       {
//         method: "POST",
//         body: formData,
//       }
//     );

//     const data = await res.json();
  
//   setUserData(prev => ({
//       ...prev,
//       profileImage: `http://localhost:8081/api/auth/profile/image/${data.photoUrl}`
//     }));
//   };


//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

//   const handleSliderChange = (event, newValue) => {
//     setCompletionPercentage(newValue);
//   };

//   const handleNoteSubmit = () => {
//     if (note.trim()) {
//       setNotes([...notes, note]);
//       setNote("");
//     }
//   };
//   if (!userData) {
//     return <div style={{ padding: "50px" }}>Loading Admin Profile...</div>;
//   }

//   return (
//     <Container maxWidth="xl" className="mt-10">
//       <Box className="p-8  bg-gray-50 min-h-screen">
//         <Box className="mb-8 flex justify-between items-center flex-wrap gap-4">
//           <Box>
//             <Typography variant="h3" className="font-bold text-gray-800 mb-2">
//               Admin Dashboard
//             </Typography>
//             <Typography variant="h6" className="text-gray-600">
//               Track resume progress and job applications
//             </Typography>
//           </Box>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => setNewAppOpen(true)}
//             sx={{ height: 'fit-content', padding: '10px 20px', fontWeight: 'bold' }}
//             className="shadow-md hover:shadow-lg transition-all"
//           >
//             + New Application
//           </Button>
//         </Box>

//         <Box className="mb-6 flex gap-4 border-b">
//           <Button 
//             onClick={() => setActiveTab('dashboard')}
//             variant={activeTab === 'dashboard' ? 'contained' : 'text'}
//           >
//             Dashboard
//           </Button>
//           <Button 
//             onClick={() => setActiveTab('reports')}
//             variant={activeTab === 'reports' ? 'contained' : 'text'}
//           >
//             AI Reports
//           </Button>
//         </Box>

//         {activeTab === 'dashboard' ? (
//         <Grid container spacing={6}>

//           <Grid item xs={12} md={8}>
//             <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
//               <CardContent className="p-8">
//                 <Typography variant="h5" className="font-bold mb-6 flex items-center gap-2">
//                   Resume Completion
//                   <MuiTooltip title="Shows how complete your resume is">
//                     <InfoIcon fontSize="small" color="action" />
//                   </MuiTooltip>
//                 </Typography>

//                 <Box className="mb-10">
//                   <Box className="flex justify-between mb-3">
//                     <Typography variant="h6">Overall Progress</Typography>
//                     <Typography variant="h6">{completionPercentage}%</Typography>
//                   </Box>
//                   <Slider
//                     value={completionPercentage}
//                     onChange={handleSliderChange}
//                     aria-labelledby="resume-completion-slider"
//                     valueLabelDisplay="auto"
//                     sx={{ height: 8 }}
//                   />
//                   <LinearProgress
//                     variant="determinate"
//                     value={completionPercentage}
//                     sx={{ height: 10, borderRadius: 5, mt: 2 }}
//                   />
//                 </Box>

//                 <Grid container spacing={4}>
//                   <Grid item xs={12} sm={6}>
//                     <Paper className="p-6 shadow-md rounded-xl">
//                       <Typography variant="h6" className="font-medium mb-4">
//                         Section Completion
//                       </Typography>
//                       <Box className="flex flex-col gap-4">
//                         {[{ section: "Personal Information", value: 100 }, { section: "Work Experience", value: 75 }, 
//                         { section: "Education", value: 100 }, { section: "Skills", value: 90 }, { section: "Projects", value: 40 }].map((item) => (
//                           <Box key={item.section}>
//                             <Box className="flex justify-between mb-1">
//                               <Typography variant="body1">{item.section}</Typography>
//                               <Typography variant="body1" className="font-medium">{item.value}%</Typography>
//                             </Box>
//                             <LinearProgress
//                               variant="determinate"
//                               value={item.value}
//                               sx={{ height: 8, borderRadius: 4 }}
//                             />
//                           </Box>
//                         ))}
//                       </Box>
//                     </Paper>
//                   </Grid>

//                   <Grid item xs={12} sm={6}>
//                     <Paper className="p-6 shadow-md h-full flex flex-col justify-center rounded-xl">
//                       <Typography variant="h6" className="font-medium mb-4 text-center">
//                         Job Application Status
//                       </Typography>
//                       <Box className="h-64">
//                         <ResponsiveContainer width="100%" height="100%">
//                           <PieChart>
//                             <Pie
//                               data={applicationData}
//                               cx="50%"
//                               cy="50%"
//                               labelLine={false}
//                               outerRadius={90}
//                               fill="#8884d8"
//                               dataKey="value"
//                               label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                             >
//                               {applicationData.map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                               ))}
//                             </Pie>
//                             <Tooltip />
//                             <Legend />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </Box>
//                     </Paper>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>
//           </Grid>

//           <Grid item xs={12} md={8}>
//             <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
//               <CardContent className="p-8">
//                 <Typography variant="h5" className="font-bold mb-6">
//                   Skills Proficiency
//                 </Typography>
//                 <Box className="h-80">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={skillsData} barCategoryGap={30} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
//                       <XAxis dataKey="name" tick={{ fontSize: 14 }} />
//                       <YAxis domain={[0, 100]} tick={{ fontSize: 14 }} />
//                       <Tooltip />
//                       <Legend />
//                       <Bar dataKey="value" name="Proficiency Level" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>

//           <Grid item xs={12} md={4}>
//             <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
//               <CardContent className="p-6">
//                 <Typography variant="h6" className="font-bold mb-4">
//                   🕒 Recent Activity
//                 </Typography>
//                 <Divider className="mb-4" />
//                 <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
//                   {recentActivity.map((item, index) => (
//                     <li key={index}>{item}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>
//           </Grid>     

//           <Grid item xs={12} md={6}>
//             <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
//               <CardContent className="p-6">
//                 <Typography variant="h6" className="font-bold mb-4">
//                   📈 Weekly Activity
//                 </Typography>
//                 <ResponsiveContainer width="100%" height={250}>
//                   <LineChart
//                     data={[
//                       { name: 'Mon', value: 3 },
//                       { name: 'Tue', value: 5 },
//                       { name: 'Wed', value: 2 },
//                       { name: 'Thu', value: 6 },
//                       { name: 'Fri', value: 4 },
//                       { name: 'Sat', value: 7 },
//                       { name: 'Sun', value: 5 },
//                     ]}
//                     margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//                   >
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
//               <CardContent className="p-6">
//                 <Typography variant="h6" className="font-bold mb-4">
//                   📝 Personal Notes
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   variant="outlined"
//                   placeholder="Write something..."
//                   value={note}
//                   onChange={(e) => setNote(e.target.value)}
//                 />
//                 <Button className="mt-4" variant="contained" onClick={handleNoteSubmit}>
//                   Add Note
//                 </Button>
//                 <Box className="mt-4 space-y-2">
//                   {notes.map((item, index) => (
//                     <Paper key={index} className="p-2 bg-gray-100 shadow-sm">
//                       {item}
//                     </Paper>
//                   ))}
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//         ) : (
//           <AdminReports />
//         )}

//         {newAppOpen && (

//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">

//         <div className="bg-white p-8 rounded-lg w-[500px]">

//         <h2 className="text-2xl mb-4">Create Job</h2>

//         <input
//         placeholder="Job Title"
//         className="border p-2 w-full mb-3"
//         onChange={(e)=>setJobForm({...jobForm,jobTitle:e.target.value})}
//         />

//         <input
//         placeholder="Company"
//         className="border p-2 w-full mb-3"
//         onChange={(e)=>setJobForm({...jobForm,companyName:e.target.value})}
//         />

//         <textarea
//         placeholder="Description"
//         className="border p-2 w-full mb-3"
//         onChange={(e)=>setJobForm({...jobForm,description:e.target.value})}
//         />

//         <input
//         placeholder="Skills (Java, React, Spring)"        
// className="border p-2 w-full mb-3 rounded"
//         onChange={(e)=>setJobForm({...jobForm,skills:e.target.value})}
//         />

//         <input
//         placeholder="Experience (2-4 Years)"        
// className="border p-2 w-full mb-3 rounded"
//         onChange={(e)=>setJobForm({...jobForm,experience:e.target.value})}
//         />

//         <input
//         placeholder="Location"        
// className="border p-2 w-full mb-3 rounded"
//         onChange={(e)=>setJobForm({...jobForm,location:e.target.value})}
//         />

//         <input
//         placeholder="Salary (10 LPA)"        
// className="border p-2 w-full mb-3 rounded"
//         onChange={(e)=>setJobForm({...jobForm,salary:e.target.value})}
//         />
        
//         <input
//         type="date"
//         className="border p-2 w-full mb-4 rounded"
//         onChange={(e)=>setJobForm({...jobForm,deadline:e.target.value})}
//         />

//         <div className="flex justify-end gap-4">

//         <button onClick={()=>setNewAppOpen(false)}>Cancel</button>

//         <button
//         onClick={handleCreateJob}
//         className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//         Create
//         </button>

//         </div>

//         </div>

//         </div>

//         )}
//       </Box>

//     </Container>
//   );
// };

// export default ResumeDashboard;




import React, { useState, useEffect } from 'react';
import { fetchUserProfile } from '../config/authService';
import { createJob, getJobs } from "../config/jobService";
import { getAllReports, getReport } from '../services/aiService';
import AdminReports from './AdminReports';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Container,
  Button,
  Chip,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Assessment,
  People,
  Work,
  TrendingUp,
  Visibility,
  Download
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalJobs: 0,
    avgScore: 0,
    hiredCount: 0
  });
  const [newAppOpen, setNewAppOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    jobTitle: "",
    companyName: "",
    description: "",
    skills: "",
    experience: "",
    location: "",
    salary: "",
    deadline: ""
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserProfile(userId)
        .then((data) => {
          setUserData({
            name: data.fullName,
            email: data.email,
            role: 'ADMIN'
          });
        })
        .catch((error) => console.error(error));
    }
    
    // Fetch jobs
    getJobs().then(setJobs);
    
    // Fetch AI reports
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getAllReports();
      setReports(data);
      
      // Calculate stats from reports
      const total = data.length;
      const avgScore = data.reduce((sum, r) => sum + (r.overall_score || 0), 0) / (total || 1);
      const hired = data.filter(r => r.verdict === 'STRONG HIRE' || r.verdict === 'HIRE').length;
      
      setStats({
        totalCandidates: total,
        totalJobs: jobs.length,
        avgScore: Math.round(avgScore),
        hiredCount: hired
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleCreateJob = async () => {
    try {
      const res = await createJob(jobForm);
      if (res) {
        alert("Job Created successfully");
        setNewAppOpen(false);
        getJobs().then(setJobs);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Prepare chart data from reports
  const verdictData = [
    { name: 'Strong Hire', value: reports.filter(r => r.verdict === 'STRONG HIRE').length },
    { name: 'Hire', value: reports.filter(r => r.verdict === 'HIRE').length },
    { name: 'Consider', value: reports.filter(r => r.verdict === 'CONSIDER').length },
    { name: 'Reject', value: reports.filter(r => r.verdict === 'REJECT').length }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const skillDemand = {};
  reports.forEach(report => {
    (report.skills_found || []).forEach(skill => {
      skillDemand[skill] = (skillDemand[skill] || 0) + 1;
    });
  });
  
  const skillData = Object.entries(skillDemand)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  if (!userData) {
    return <div className="p-20 text-center">Loading Dashboard...</div>;
  }

  return (
    <Container maxWidth="xl" className="py-8">
      <Box className="mb-8">
        <Box className="flex justify-between items-center">
          <Box>
            <Typography variant="h4" className="font-bold text-gray-800">
              Welcome back, {userData.name}
            </Typography>
            <Typography variant="body1" className="text-gray-600">
              Here's what's happening with your recruitment today
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setNewAppOpen(true)}
            startIcon={<Work />}
          >
            Post New Job
          </Button>
        </Box>
        
        {/* Tab Navigation */}
        <Box className="mt-6 flex gap-4 border-b">
          <Button
            onClick={() => setActiveTab('dashboard')}
            variant={activeTab === 'dashboard' ? 'contained' : 'text'}
            sx={{ borderRadius: '8px 8px 0 0', px: 4 }}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => setActiveTab('reports')}
            variant={activeTab === 'reports' ? 'contained' : 'text'}
            sx={{ borderRadius: '8px 8px 0 0', px: 4 }}
          >
            AI Reports
          </Button>
        </Box>
      </Box>

      {activeTab === 'dashboard' ? (
        <>
          {/* Stats Cards */}
          <Grid container spacing={4} className="mb-8">
            <Grid item xs={12} sm={6} md={3}>
              <Card className="p-6 shadow-lg hover:shadow-xl transition">
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography variant="body2" className="text-gray-500 mb-1">
                      Total Candidates
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {stats.totalCandidates}
                    </Typography>
                  </Box>
                  <Avatar className="bg-indigo-100 text-indigo-600">
                    <People />
                  </Avatar>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  className="mt-4 h-1 rounded"
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card className="p-6 shadow-lg hover:shadow-xl transition">
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography variant="body2" className="text-gray-500 mb-1">
                      Active Jobs
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {stats.totalJobs}
                    </Typography>
                  </Box>
                  <Avatar className="bg-green-100 text-green-600">
                    <Work />
                  </Avatar>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={60} 
                  className="mt-4 h-1 rounded"
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card className="p-6 shadow-lg hover:shadow-xl transition">
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography variant="body2" className="text-gray-500 mb-1">
                      Average Score
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {stats.avgScore}%
                    </Typography>
                  </Box>
                  <Avatar className="bg-purple-100 text-purple-600">
                    <Assessment />
                  </Avatar>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.avgScore} 
                  className="mt-4 h-1 rounded"
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card className="p-6 shadow-lg hover:shadow-xl transition">
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography variant="body2" className="text-gray-500 mb-1">
                      Hired
                    </Typography>
                    <Typography variant="h4" className="font-bold">
                      {stats.hiredCount}
                    </Typography>
                  </Box>
                  <Avatar className="bg-blue-100 text-blue-600">
                    <TrendingUp />
                  </Avatar>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.hiredCount / (stats.totalCandidates || 1)) * 100} 
                  className="mt-4 h-1 rounded"
                />
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={4}>
            {/* Verdict Distribution */}
            <Grid item xs={12} md={6}>
              <Card className="p-6 shadow-lg">
                <Typography variant="h6" className="font-bold mb-4">
                  Candidate Verdict Distribution
                </Typography>
                <Box className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verdictData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {verdictData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            {/* Top Skills */}
            <Grid item xs={12} md={6}>
              <Card className="p-6 shadow-lg">
                <Typography variant="h6" className="font-bold mb-4">
                  Most Common Skills
                </Typography>
                <Box className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            {/* Recent Reports Table */}
            <Grid item xs={12}>
              <Card className="p-6 shadow-lg">
                <Typography variant="h6" className="font-bold mb-4">
                  Recent AI Interview Reports
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead className="bg-gray-50">
                      <TableRow>
                        <TableCell><strong>Candidate</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Overall Score</strong></TableCell>
                        <TableCell><strong>Verdict</strong></TableCell>
                        <TableCell><strong>Skills</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.slice(0, 5).map((report) => (
                        <TableRow key={report.id} hover>
                          <TableCell>{report.candidate_name}</TableCell>
                          <TableCell>{report.date}</TableCell>
                          <TableCell>
                            <Box className="flex items-center gap-2">
                              <LinearProgress 
                                variant="determinate" 
                                value={report.overall_score} 
                                sx={{ width: 60, height: 6, borderRadius: 3 }}
                              />
                              <span>{report.overall_score}%</span>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={report.verdict}
                              size="small"
                              sx={{
                                bgcolor: 
                                  report.verdict === 'STRONG HIRE' ? '#10b98120' :
                                  report.verdict === 'HIRE' ? '#3b82f620' :
                                  report.verdict === 'CONSIDER' ? '#f59e0b20' : '#ef444420',
                                color:
                                  report.verdict === 'STRONG HIRE' ? '#10b981' :
                                  report.verdict === 'HIRE' ? '#3b82f6' :
                                  report.verdict === 'CONSIDER' ? '#f59e0b' : '#ef4444',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box className="flex gap-1">
                              {(report.skills_found || []).slice(0, 3).map((skill, i) => (
                                <Chip key={i} label={skill} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Report">
                              <IconButton 
                                size="small"
                                onClick={() => {
                                  setActiveTab('reports');
                                  // You can add logic to show specific report
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {reports.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" className="py-8">
                            No reports yet. Start by uploading resumes!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <AdminReports />
      )}

      {/* Create Job Modal */}
      {newAppOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
            <Typography variant="h5" className="mb-4 font-bold">
              Create New Job Posting
            </Typography>
            
            <input
              placeholder="Job Title"
              className="border p-2 w-full mb-3 rounded"
              onChange={(e) => setJobForm({ ...jobForm, jobTitle: e.target.value })}
            />
            <input
              placeholder="Company Name"
              className="border p-2 w-full mb-3 rounded"
              onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })}
            />
            <textarea
              placeholder="Job Description"
              className="border p-2 w-full mb-3 rounded"
              rows="4"
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
            />
            <input
              placeholder="Required Skills (comma separated)"
              className="border p-2 w-full mb-3 rounded"
              onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
            />
            <input
              placeholder="Experience Required"
              className="border p-2 w-full mb-3 rounded"
              onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
            />
            <input
              placeholder="Location"
              className="border p-2 w-full mb-3 rounded"
              onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
            />
            <input
              placeholder="Salary"
              className="border p-2 w-full mb-3 rounded"
              onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
            />
            <input
              type="date"
              className="border p-2 w-full mb-4 rounded"
              onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
            />
            
            <div className="flex justify-end gap-4">
              <Button onClick={() => setNewAppOpen(false)} color="inherit">
                Cancel
              </Button>
              <Button
                onClick={handleCreateJob}
                variant="contained"
                color="primary"
              >
                Create Job
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AdminDashboard;