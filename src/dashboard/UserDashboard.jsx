import API_CONFIG from '../config/apiConfig';
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
  Assessment,
  TrendingUp,
  Work
} from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const UserDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [userData, setUserData] = useState(null);
  const [resumeData, setResumeData] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch user profile and resumes in parallel
        const [userProfile, resumesRes] = await Promise.all([
          fetchUserProfile(userId),
          fetch(`${API_CONFIG.backend}/api/resumes/user/${userId}`)
        ]);

        setUserData({
          name: userProfile.fullName,
          title: userProfile.title || "Job Seeker",
          email: userProfile.email,
          phone: userProfile.phone || "",
          photo: userProfile.photoUrl
            ? `${API_CONFIG.backend}/api/auth/profile/image/${userProfile.photoUrl}`
            : null
        });

        const resumesData = await resumesRes.json();
        setResumeData(resumesData);

        // Fetch reports using user name
        if (userProfile.fullName) {
          const reportsRes = await fetch(`${API_CONFIG.ai}/reports/${encodeURIComponent(userProfile.fullName)}`);
          const reportsData = await reportsRes.json();
          setReports(reportsData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAllData();
    }
  }, [userId]);

  // Parse resume data for AI scores
  const parsedResumes = resumeData.map(r => {
    try {
      return r.parsedJson ? JSON.parse(r.parsedJson) : null;
    } catch {
      return null;
    }
  }).filter(Boolean);

  // Calculate real metrics
  const avgResumeScore = parsedResumes.length
    ? parsedResumes.reduce((sum, r) => sum + (r.resume_score || 0), 0) / parsedResumes.length
    : 0;

  const totalApplications = resumeData.length;
  
  const interviewRate = totalApplications
    ? Math.round((reports.length / totalApplications) * 100)
    : 0;

  // Aggregate skills from all resumes
  const skillCounts = {};
  parsedResumes.forEach(r => {
    (r.skills_found || []).forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  
  const topSkills = Object.entries(skillCounts)
    .map(([name, value]) => ({ name: name.length > 15 ? name.substring(0, 12) + '...' : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Application status from reports verdicts
  const verdictCounts = { 
    "Strong Hire": reports.filter(r => r.verdict === "STRONG HIRE").length,
    "Hire": reports.filter(r => r.verdict === "HIRE").length,
    "Consider": reports.filter(r => r.verdict === "CONSIDER").length,
    "Reject": reports.filter(r => r.verdict === "REJECT").length
  };
  
  const applicationStatusData = Object.entries(verdictCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  // If no reports, show empty state message
  const hasReports = applicationStatusData.length > 0;

  // Weekly activity from reports (last 7 days)
  const last7Days = [...Array(7).keys()].map(i => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reverse();
  
  const weeklyActivity = last7Days.map(date => ({
    name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    interviews: reports.filter(r => r.date && r.date.startsWith(date)).length
  }));

  // Colors for charts
  const SKILL_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const APP_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard /> },
    { text: 'My Resume', icon: <Description /> },
    { text: 'Applications', icon: <BusinessCenter /> },
    { text: 'Analytics', icon: <Assessment /> },
    { text: 'Notifications', icon: <Notifications /> },
    { text: 'Settings', icon: <Settings /> },
    { text: 'Help', icon: <Help /> },
  ];

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const sidebarWidth = 240;

  const sidebarContent = (
    <Box className="pt-0 bg-transparent flex flex-col h-full border-r border-gray-200">
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

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <Typography>Loading Dashboard...</Typography>
      </Box>
    );
  }

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

        {/* Top Navbar */}
        <Box className="bg-white px-8 py-5 flex justify-between items-center sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Box className="flex items-center gap-4">
            <IconButton onClick={toggleDrawer} className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors p-2 rounded-lg">
              {drawerOpen ? <MenuOpen /> : <Menu />}
            </IconButton>
            <div>
              <Typography variant="h5" className="font-bold text-gray-900 tracking-tight leading-tight">
                Analytics Overview
              </Typography>
              <Typography variant="body2" className="text-gray-500 font-medium">
                Track your application performance metrics
              </Typography>
            </div>
          </Box>
        </Box>

        {/* Dashboard Main Content */}
        <Box className="p-8 max-w-[1600px] w-full mx-auto">

          {/* KPI Cards Row */}
          <Grid container spacing={4} className="mb-8">
            <Grid item xs={12} md={4} sx={{display: 'flex'}}>
              <Card className="rounded-2xl border-none shadow-lg overflow-hidden w-full">
                <Box className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-blue-600" />
                <CardContent className="p-6 flex flex-col flex-grow">
                  <Box className="flex justify-between items-start mb-4">
                    <Typography variant="subtitle2" className="text-gray-500 font-semibold uppercase tracking-wider text-xs">
                      Resume Strength
                    </Typography>
                    <Box className="p-2 ml-10 rounded-lg bg-blue-50 text-blue-600">
                      <Description fontSize="small" />
                    </Box>
                  </Box>
                  <Box className="flex items-end gap-3 mb-4">
                    <Typography variant="h3" className="font-bold text-gray-900 leading-none">
                      {avgResumeScore.toFixed(1)}%
                    </Typography>
                    <Chip
                      label={avgResumeScore > 80 ? "Excellent" : avgResumeScore > 60 ? "Good" : "Needs Improvement"}
                      size="small"
                      className={`font-semibold text-xs px-1 ${
                        avgResumeScore > 80 ? "bg-green-100 text-green-700" :
                        avgResumeScore > 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={avgResumeScore}
                    className="h-2 rounded-full mt-2"
                    sx={{
                      backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: avgResumeScore > 80 ? '#3b82f6' : avgResumeScore > 60 ? '#f59e0b' : '#ef4444',
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" className="text-gray-500 mt-3 block">
                    Based on {totalApplications} uploaded resume{totalApplications !== 1 ? 's' : ''}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4} sx={{display: 'flex'}}>
              <Card className="rounded-2xl border-none shadow-lg overflow-hidden w-full">
                <Box className="h-1.5 w-full bg-gradient-to-r from-indigo-400 to-indigo-600" />
                <CardContent className="p-6">
                  <Box className="flex justify-between items-start mb-4">
                    <Typography variant="subtitle2" className="text-gray-500 font-semibold uppercase tracking-wider text-xs">
                      Total Applications
                    </Typography>
                    <Box className="p-2 ml-17 rounded-lg bg-indigo-50 text-indigo-600">
                      <BusinessCenter fontSize="small" />
                    </Box>
                  </Box>
                  <Typography variant="h3" className="font-bold text-gray-900 leading-none mb-2">
                    {totalApplications}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (totalApplications / 50) * 100)}
                    className="h-2 rounded-full mb-3"
                    sx={{
                      backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#6366f1',
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" className="text-gray-500">
                    Jobs you've applied to
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4} sx={{display: 'flex'}}>
              <Card className="rounded-2xl border-none shadow-lg overflow-hidden w-full">
                <Box className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <CardContent className="p-6">
                  <Box className="flex justify-between items-start mb-4">
                    <Typography variant="subtitle2" className="text-gray-500 font-semibold uppercase tracking-wider text-xs">
                      Interview Rate
                    </Typography>
                    <Box className="p-2 ml-25 rounded-lg bg-emerald-50 text-emerald-600">
                      <Assessment fontSize="small" />
                    </Box>
                  </Box>
                  <Typography variant="h3" className="font-bold text-gray-900 leading-none mb-2">
                    {interviewRate}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={interviewRate}
                    className="h-2 rounded-full mb-3"
                    sx={{
                      backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: interviewRate > 70 ? '#10b981' : interviewRate > 40 ? '#f59e0b' : '#ef4444',
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" className="text-gray-500">
                    {reports.length} interview{reports.length !== 1 ? 's' : ''} completed
                  </Typography>
                  <Box className="flex-grow"/>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Interview Reports Section - Only once */}
          <Box className="mb-8">
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
              My Interview Reports
            </Typography>
            <UserReports userId={userId} userName={userData?.name} />
          </Box>

          {/* Charts Section - Only if there's data */}
          {(topSkills.length > 0 || hasReports || weeklyActivity.some(w => w.interviews > 0)) && (
            <Grid container spacing={4}>
              
              {/* Weekly Activity Chart */}
              <Grid item xs={12} lg={7}>
                <Card className="rounded-2xl border-none shadow-lg h-full overflow-hidden">
                  <Box className="px-6 py-5 border-b border-gray-100 bg-white">
                    <Typography variant="h6" className="font-bold text-gray-900">
                      Interview Activity
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      Last 7 days
                    </Typography>
                  </Box>
                  <CardContent className="p-6 bg-white">
                    <Box className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyActivity} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13 }} dx={-10} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                          <Line type="monotone" dataKey="interviews" name="Interviews" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Verdict Distribution Pie Chart */}
              <Grid item xs={12} lg={5}>
                <Card className="rounded-2xl border-none shadow-lg h-full flex flex-col overflow-hidden bg-white">
                  <Box className="px-6 py-5 border-b border-gray-100">
                    <Typography variant="h6" className="font-bold text-gray-900">
                      Application Outcomes
                    </Typography>
                  </Box>
                  <CardContent className="p-6 flex-grow">
                    {hasReports ? (
                      <Box className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={applicationStatusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={4}
                              dataKey="value"
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            >
                              {applicationStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={APP_COLORS[index % APP_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} application(s)`]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    ) : (
                      <Box className="flex flex-col items-center justify-center h-full text-center">
                        <Assessment sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                        <Typography color="textSecondary">No interview data yet</Typography>
                        <Typography variant="caption" color="textSecondary">Complete an AI interview to see results</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Skills Chart */}
              {topSkills.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Card className="rounded-2xl border-none shadow-lg h-[400px] overflow-hidden bg-white">
                    <Box className="px-6 py-5 border-b border-gray-100">
                      <Typography variant="h6" className="font-bold text-gray-900">
                        Your Top Skills
                      </Typography>
                      <Typography variant="caption" className="text-gray-500">
                        Extracted from your uploaded resumes
                      </Typography>
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
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            >
                              {topSkills.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={SKILL_COLORS[index % SKILL_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} time(s)`, 'Mentions']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Resume Section Scores */}
              <Grid item xs={12} md={6}>
                <Card className="rounded-2xl border-none shadow-lg h-[400px] overflow-hidden bg-white flex flex-col">
                  <Box className="px-6 py-5 border-b border-gray-100">
                    <Typography variant="h6" className="font-bold text-gray-900">
                      Resume Section Analysis
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      Based on your uploaded resume content
                  </Typography>
                  </Box>
                  <CardContent className="p-6 flex-grow overflow-y-auto">
                    <Box className="flex flex-col gap-5">
                      {[
                        { label: "Contact Information", score: parsedResumes.some(r => r.has_email) ? 100 : 50, key: "contact" },
                        { label: "Skills Section", score: parsedResumes.some(r => r.skills_found?.length > 0) ? Math.min(100, (parsedResumes[0]?.skills_found?.length || 0) * 10) : 30, key: "skills" },
                        { label: "Work Experience", score: parsedResumes.some(r => r.experience_years > 0) ? Math.min(100, (parsedResumes[0]?.experience_years || 0) * 15) : 20, key: "experience" },
                        { label: "Education", score: parsedResumes.some(r => r.has_education) ? 100 : 40, key: "education" },
                        { label: "Projects", score: parsedResumes.some(r => r.has_project) ? 80 : 30, key: "projects" }
                      ].map((item) => (
                        <Box key={item.key} className="w-full">
                          <Box className="flex justify-between items-center mb-2">
                            <Typography variant="body2" className="text-gray-700 font-semibold">
                              {item.label}
                            </Typography>
                            <Typography variant="body2" className={`font-bold ${item.score > 80 ? 'text-emerald-600' : item.score > 60 ? 'text-amber-500' : 'text-red-500'}`}>
                              {item.score}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={item.score}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#f1f5f9',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: item.score > 80 ? '#10b981' : item.score > 60 ? '#f59e0b' : '#ef4444'
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
          )}

          {/* Empty State - No data message */}
          {parsedResumes.length === 0 && reports.length === 0 && (
            <Card className="rounded-2xl border-none shadow-lg p-12 text-center">
              <BusinessCenter sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
              <Typography variant="h6" className="font-bold text-gray-700 mb-2">
                No Data Available Yet
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                Start by uploading your resume and applying for jobs. Your analytics will appear here once you have data.
              </Typography>
            </Card>
          )}

        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;