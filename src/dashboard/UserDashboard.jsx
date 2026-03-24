
import React, { useState, useEffect } from 'react';
import { fetchUserProfile } from "../config/authService";
import UserReports from './UserReports';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  ListItemButton
} from '@mui/material';
import {
  Dashboard,
  Description,
  BusinessCenter,
  Notifications,
  Settings,
  Help,
  MenuOpen,
  Menu,
  ArrowUpward,
  AddCircle,
  Assessment
} from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const UserDashboard = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  const [userData, setUserData] = useState(null);
  const [resumeData, setResumeData] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [reports, setReports] = useState([]);


  const refreshUserData = async () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      try {
        const data = await fetchUserProfile(userId);
        setUserData({
          name: data.fullName,
          title: data.title || "Full Stack Developer",
          email: data.email,
           phone: data.phone || "",
          photo: data.photoUrl
            ? `http://localhost:8081/api/auth/profile/image/${data.photoUrl}`
            : "/api/placeholder/150/150",
          completionScores: {
            contactInfo: 90,
            workExperience: 75,
            education: 100,
            skills: 85,
            projects: 60,
          },
        });
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    }
  };


  useEffect(() => {
    refreshUserData();
    const userId = localStorage.getItem("userId");

    if (userId) {
      fetch(`http://localhost:8081/api/resumes/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        setResumeData(data);
      })
      .catch(err => console.error(err));
      fetchUserProfile(userId)
        .then((data) => {
          setUserData({
            name: data.fullName,
            title: "Full Stack Developer",
            email: data.email,
            photo: data.photoUrl
              ? `http://localhost:8081/api/auth/profile/image/${data.photoUrl}`
              : "/api/placeholder/150/150",

            completionScores: {
              contactInfo: resumeData.some(r => r.has_email) ? 100 : 0,
              workExperience: resumeData.some(r => r.experience_years > 0) ? 80 : 20,
              education: resumeData.some(r => has_education) ? 100 : 0,
              skills: resumeData.some(r => r.skills_found && r.skills_found.length > 0) ? 80 : 20,
              projects: resumeData.some(r => r.has_project) ? 70 : 30,
            },

            skillBreakdown: [
              { name: 'Frontend', value: 65 },
              { name: 'Backend', value: 80 },
              { name: 'DevOps', value: 45 },
              { name: 'Soft Skills', value: 70 }
            ],

            applicationStatus: [
              { name: 'Applied', value: 24 },
              { name: 'Shortlisted', value: 12 },
              { name: 'Interviewed', value: 8 },
              { name: 'Rejected', value: 3 }
            ],

            weeklyActivity: [
              { name: 'Mon', applications: 3, interviews: 0 },
              { name: 'Tue', applications: 5, interviews: 1 },
              { name: 'Wed', applications: 2, interviews: 2 },
              { name: 'Thu', applications: 4, interviews: 1 },
              { name: 'Fri', applications: 6, interviews: 0 },
              { name: 'Sat', applications: 1, interviews: 0 },
              { name: 'Sun', applications: 0, interviews: 0 }
            ]
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
    if (userData?.name) {
      fetch(`http://localhost:8000/reports/${encodeURIComponent(userData.name)}`)
        .then(res => res.json())
        .then(data => setReports(data))
        .catch(err => console.error("Error fetching reports:", err));
    }
  }, []);

  // Extract AI data
  const parsedResumes = resumeData.map(r => {
    try {
      return r.parsedJson ? JSON.parse(r.parsedJson) : null;
    } catch {
      return null;
    }
  }).filter(Boolean);

  // Resume Strength (average score)
  const avgScore = parsedResumes.length
    ? parsedResumes.reduce((sum, r) => sum + (r.resume_score || 0), 0) / parsedResumes.length
    : 0;

  // Total Applications
  const totalApplications = resumeData.length;

  // Aggregate skills from all resumes
  const skillCounts = {};
  parsedResumes.forEach(r => {
    (r.skills_found || []).forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Application status from reports
  const verdictCounts = { "Strong Hire": 0, "Hire": 0, "Consider": 0, "Reject": 0 };
  reports.forEach(r => {
    if (r.verdict === "STRONG HIRE") verdictCounts["Strong Hire"]++;
    else if (r.verdict === "HIRE") verdictCounts["Hire"]++;
    else if (r.verdict === "CONSIDER") verdictCounts["Consider"]++;
    else if (r.verdict === "REJECT") verdictCounts["Reject"]++;
  });
  const applicationStatusData = Object.entries(verdictCounts).map(([name, value]) => ({ name, value }));

  // Weekly activity (last 7 days)
  const last7Days = [...Array(7).keys()].map(i => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0,10);
  }).reverse();
  const weeklyActivity = last7Days.map(date => ({
    name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    applications: reports.filter(r => r.date && r.date.startsWith(date)).length,
    interviews: 0 // we don't have a separate interviews count; applications are interviews
  }));

  // 🎯 Selected / Interviewed logic
  const shortlisted = parsedResumes.filter(r => r.resume_score > 50).length;
  const rejected = parsedResumes.filter(r => r.resume_score <= 50).length;

  const userId = localStorage.getItem("userId");

  // interview Rate
  const interviewRate = totalApplications
    ? Math.round((reports.length / totalApplications) * 100)
    : 0;

  if (!userData) {
    return <div>Loading...</div>;
  }

  // Updated color palettes for the charts
  const SKILL_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
  const APP_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

  
  

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard /> },
    { text: 'My Resume', icon: <Description /> },
    { text: 'Applications', icon: <BusinessCenter /> },
    { text: 'Analytics', icon: <Assessment /> },
    { text: 'Notifications', icon: <Notifications /> },
    { text: 'Settings', icon: <Settings /> },
    { text: 'Help', icon: <Help /> },
  ];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const sidebarWidth = 240;


  const sidebarContent = (
    <Box className="pt-0  bg-transparent flex flex-col h-full border-r border-gray-200">
      <Box className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 flex items-center justify-center shadow-sm">
        <Typography variant="h6" className="font-bold text-white tracking-widest text-lg drop-shadow-sm">
          MAKE IT HIRE
        </Typography>
      </Box>

      <List className="py-4 flex-grow px-2">
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={item.text}
            disablePadding
            className={`mb-1 rounded-lg transition-all duration-200 ${index === 0 ? "bg-indigo-50 shadow-sm" : "hover:bg-gray-50"}`}
          >
            <ListItemButton className="rounded-lg">
              <ListItemIcon className={index === 0 ? "text-indigo-600 min-w-[40px]" : "text-gray-500 min-w-[40px]"}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  className: `${index === 0 ? "font-semibold text-indigo-700" : "font-medium text-gray-700"} text-sm tracking-wide`
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider className="mx-4 opacity-50" />

    </Box>
  );

  // AI-based application status
  const applicationStatus = [
    { name: 'Shortlisted', value: shortlisted },
    { name: 'Rejected', value: rejected },
  ];

  // AI-based skill breakdown
  const skillBreakdown = [
    { name: 'Matched Skills', value: avgScore },
    { name: 'Missing Skills', value: 100 - avgScore }
  ];

  // Weekly activity (AI based)
  // const weeklyActivity = parsedResumes.map((r, index) => ({
  //   name: `R${index + 1}`,
  //   applications: 1,
  //   interviews: r.resume_score > 60 ? 1 : 0
  // }));

  return (
    <Box className="flex font-sans bg-[#F8FAFC] min-h-screen">
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
            marginTop: "100px"
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box className="flex-grow flex flex-col min-h-screen transition-all duration-300" sx={{ marginLeft: isMobile || !drawerOpen ? 0 : `${sidebarWidth}px` }}>

        {/* Top Navbar specifically for Dashboard Actions */}
        <Box className="bg-white  px-8 py-5 flex justify-between items-center sticky top-0  z-10 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Box className="flex items-center gap-4">
            <IconButton
              onClick={toggleDrawer}
              className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-lg"
            >
              {drawerOpen ? <MenuOpen /> : <Menu />}
            </IconButton>
            <div >
              <Typography variant="h5" className="font-bold  text-gray-900 tracking-tight leading-tight">
                Analytics Overview
              </Typography>
              <Typography variant="body2" className="text-gray-500 font-medium">
                Track your application performance metrics
              </Typography>
            </div>
          </Box>
        </Box>

        {/* Dashboard Main Content Area */}
        <Box className="p-8 max-w-[1600px] w-full mx-auto">

          {/* Top 3 KPI Cards */}
          <Grid container spacing={4} className="mb-8">
            <Grid item xs={12} md={4}>
              <Card className="rounded-2xl border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                <Box className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-blue-600" />
                <CardContent className="p-6">
                  <Box className="flex justify-between items-start mb-4">
                    <Typography variant="subtitle2" className="text-gray-500 font-semibold uppercase tracking-wider text-xs">
                      Resume Strength
                    </Typography>
                    <Box className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Description fontSize="small" />
                    </Box>
                  </Box>
                  <Box className="flex items-end gap-3 mb-4">
                    <Typography variant="h3" className="font-bold text-gray-900 leading-none">
                      {avgScore.toFixed(1)}%
                    </Typography>
                    <Chip
                      label={avgScore > 80 ? "Excellent" : avgScore > 60 ? "Good" : "Needs Improvement"}
                      size="small"
                      className={`font-semibold text-xs px-1 ${avgScore > 80 ? "bg-green-100 text-green-700" :
                          avgScore > 60 ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                        }`}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={avgScore}
                    className="h-2 rounded-full mt-2"
                    sx={{
                      backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: avgScore > 80 ? '#3b82f6' : avgScore > 60 ? '#f59e0b' : '#ef4444',
                        borderRadius: 4
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="rounded-2xl border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                <Box className="h-1.5 w-full bg-gradient-to-r from-indigo-400 to-indigo-600" />
                <CardContent className="p-6">
                  <Box className="flex justify-between items-start mb-4">
                    <Typography variant="subtitle2" className="text-gray-500 font-semibold uppercase tracking-wider text-xs">
                      Total Applications
                    </Typography>
                    <Box className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <BusinessCenter fontSize="small" />
                    </Box>
                  </Box>
                  <Box className="flex items-end gap-3 mb-1">
                    <Typography variant="h3" className="font-bold text-gray-900 leading-none">
                      {totalApplications}
                    </Typography>
                    <Typography variant='caption'>
                      Based on uploaded resumes
                    </Typography>
                    <Chip
                      icon={<ArrowUpward className="text-emerald-600" style={{ fontSize: '14px' }} />}
                      label="12% vs last month"
                      size="small"
                      className="bg-emerald-50 text-emerald-700 font-semibold text-xs px-1"
                    />
                  </Box>
                  <Typography variant="caption" className="text-gray-500 font-medium mt-2 block">
                    21 active applications currently tracking
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className="rounded-2xl border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                <Box className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <CardContent className="p-6">
                  <Box className="flex justify-between items-start mb-4">
                    <Typography variant="subtitle2" className="text-gray-500 font-semibold uppercase tracking-wider text-xs">
                      interview Rate
                    </Typography>
                    <Box className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <Assessment fontSize="small" />
                    </Box>
                  </Box>
                  <Box className="flex items-end gap-3 mb-1">
                    <Typography variant="h3" className="font-bold text-gray-900 leading-none">
                      {interviewRate}%
                    </Typography>
                    <Chip
                      label={ interviewRate > 60 ? "High Change" : "Low Change"}
                    />
                  </Box>
                  <Typography variant="caption" className="text-gray-500 font-medium mt-2 block">
                    8 interviews secured from 24 attempts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, mt: 4 }}>
            My Interview Reports
          </Typography>
          <UserReports userId={userId} userName={userData?.name} />

          {/* Main Charts Area */}
          <Grid container spacing={4}>

            {/* Weekly Activity Line Chart */}
            <Grid item xs={12} lg={7}>
              <Card className="rounded-2xl border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] h-full overflow-hidden">
                <Box className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                  <Typography variant="h6" className="font-bold text-gray-900">
                    Velocity Tracker
                  </Typography>
                  <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block px-3 py-1.5 outline-none font-medium">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                  </select>
                </Box>
                <CardContent className="p-6 bg-white">
                  <Box className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={weeklyActivity}
                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                          dx={-10}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 500, padding: '12px' }}
                          cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                        />
                        <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#475569', paddingBottom: '20px' }} />
                        {/* <Line
                          type="monotone"
                          dataKey="applications"
                          name="Interview"
                          stroke="#6366f1"
                          strokeWidth={4}
                          dot={{ r: 0 }}
                          activeDot={{ r: 7, strokeWidth: 0, fill: '#6366f1' }}
                        /> */}
                        <Line
                          type="monotone"
                          dataKey="applications"
                          name="Interviews"
                          stroke="#10b981"
                          strokeWidth={4}
                          dot={{ r: 0 }}
                          activeDot={{ r: 7, strokeWidth: 0, fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Application Status Pie Chart */}
            <Grid item xs={12} lg={5}>
              <Card className="rounded-2xl border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] h-full flex flex-col overflow-hidden bg-white">
                <Box className="px-6 py-5 border-b border-gray-100">
                  <Typography variant="h6" className="font-bold text-gray-900">
                    Pipeline Health
                  </Typography>
                </Box>
                <CardContent className="p-6 flex-grow flex flex-col xl:flex-row items-center justify-center gap-6">
                  <Box className="h-[240px] w-[240px] relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={applicationStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={75}
                          outerRadius={105}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {applicationStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={APP_COLORS[index % APP_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} Apps`, name]}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 600 }}
                          itemStyle={{ color: '#1e293b' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <Typography variant="h4" className="font-bold text-gray-900 leading-none">
                        {totalApplications}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500 font-semibold tracking-wide uppercase mt-1">
                        Total
                      </Typography>
                    </Box>
                  </Box>

                  {/* Custom Legend */}
                  <Box className="flex flex-col gap-4 w-full xl:w-auto mt-4 xl:mt-0">
                    {applicationStatus.map((status, idx) => (
                      <Box key={status.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-white transition-all">
                        <Box className="flex items-center">
                          <Box className="w-3.5 h-3.5 rounded-[4px] mr-3 shadow-sm" sx={{ backgroundColor: APP_COLORS[idx % APP_COLORS.length] }} />
                          <Typography variant="body2" className="text-gray-700 font-semibold">
                            {status.name}
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2" className="font-bold text-gray-900 ml-6">
                          {status.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Skills Breakdown Pie Chart */}
            <Grid item xs={12} md={6}>
              <Card className="rounded-2xl border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] h-[400px] overflow-hidden bg-white">
                <Box className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                  <Typography variant="h6" className="font-bold text-gray-900">
                    Skill Matrix Mapping
                  </Typography>
                  <Chip label="Auto-Generated" size="small" className="bg-indigo-50 text-indigo-700 font-medium text-xs px-2" />
                </Box>
                <CardContent className="p-6 h-[calc(100%-73px)]">
                  <Box className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topSkills}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={95}
                          dataKey="value"
                          stroke="#ffffff"
                          strokeWidth={2}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                        >
                          {topSkills.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={SKILL_COLORS[index % SKILL_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} occurrences`,'Skill Frequency']}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 500 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Resume Details Progress Breakdown Component */}
            <Grid item xs={12} md={6}>
              <Card className="rounded-2xl border-none shadow-[0_4px_24px_rgba(0,0,0,0.02)] h-[400px] overflow-hidden bg-white flex flex-col">
                <Box className="px-6 py-5 border-b border-gray-100">
                  <Typography variant="h6" className="font-bold text-gray-900">
                    Document Diagnostic
                  </Typography>
                </Box>
                <CardContent className="p-8 flex-grow overflow-y-auto">
                  <Box className="flex flex-col justify-center h-full gap-5">
                    {Object.entries(userData.completionScores).map(([section, score], index) => (
                      <Box key={section} className="w-full">
                        <Box className="flex justify-between items-center mb-2.5">
                          <Typography variant="body2" className="capitalize text-gray-700 font-semibold tracking-wide">
                            {section.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                          <Typography variant="body2" className={`font-bold ${score > 80 ? 'text-emerald-600' : score > 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {score}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={score}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              backgroundColor: score > 80 ? '#10b981' : score > 60 ? '#f59e0b' : '#ef4444'
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;