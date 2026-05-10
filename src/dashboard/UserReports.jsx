import API_CONFIG from '../config/apiConfig';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { ExpandMore, Assessment, CheckCircle, Warning } from '@mui/icons-material';
import API_CONFIG from '../config/apiConfig';

const UserReports = ({ userId, userName }) => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserReports();
  }, [userId]);

  const fetchUserReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.ai}/reports/${encodeURIComponent(userName || 'Candidate')}`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const getVerdictIcon = (verdict) => {
    switch(verdict) {
      case 'STRONG HIRE':
      case 'HIRE':
        return <CheckCircle sx={{ color: '#22c55e' }} />;
      case 'CONSIDER':
        return <Warning sx={{ color: '#eab308' }} />;
      default:
        return <Assessment sx={{ color: '#9ca3af' }} />;
    }
  };
  if (loading) {
    return <LinearProgress />;
  }

  if (reports.length === 0) {
    return (
      <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
        <Assessment sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
        <Typography variant="h6" color="textSecondary">
          No Interview Reports Yet
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Complete a video interview to see your AI-generated report here.
        </Typography>
      </Card>
    );
  }

   return (
    <Grid container spacing={3}>
      {reports.map((report, index) => (
        <Grid item xs={12} key={index}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: 2,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {report.job_title || 'Technical Interview'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(report.date).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getVerdictIcon(report.verdict)}
                  <Chip 
                    label={report.verdict} 
                    color={report.verdict === 'STRONG HIRE' ? 'success' : 
                           report.verdict === 'HIRE' ? 'info' : 
                           report.verdict === 'CONSIDER' ? 'warning' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
                    {report.overall_score}%
                  </Typography>
                  <Typography variant="caption">Overall Score</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                    {report.technical_score}%
                  </Typography>
                  <Typography variant="caption">Technical Score</Typography>
                </Box>
              </Box>

              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle2">View Detailed Analysis</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {report.overall_assessment}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#22c55e' }}>
                    Strengths
                  </Typography>
                  <ul style={{ margin: '0 0 16px 0', paddingLeft: 20 }}>
                    {report.strengths?.slice(0, 3).map((s, i) => (
                      <li key={i}>
                        <Typography variant="body2">{s}</Typography>
                      </li>
                    ))}
                  </ul>
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#ef4444' }}>
                    Areas to Improve
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {report.areas_for_improvement?.slice(0, 3).map((a, i) => (
                      <li key={i}>
                        <Typography variant="body2">{a}</Typography>
                      </li>
                    ))}
                  </ul>
                </AccordionDetails>
              </Accordion>

              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => handleViewReport(report)}
                sx={{ borderRadius: 2 }}
              >
                View Full Report
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Full Report Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedReport && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Interview Report: {selectedReport.job_title}
                </Typography>
                <Chip 
                  label={selectedReport.verdict} 
                  color={selectedReport.verdict === 'STRONG HIRE' ? 'success' : 
                         selectedReport.verdict === 'HIRE' ? 'info' : 
                         selectedReport.verdict === 'CONSIDER' ? 'warning' : 'error'}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <Chip label={`Date: ${new Date(selectedReport.date).toLocaleString()}`} variant="outlined" />
                    <Chip label={`Questions: ${selectedReport.questions_answered}/${selectedReport.total_questions}`} variant="outlined" />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3, bgcolor: '#f8fafc' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      AI Assessment
                    </Typography>
                    <Typography variant="body2">
                      {selectedReport.overall_assessment}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#22c55e' }}>
                      Strengths
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {selectedReport.strengths?.map((s, i) => (
                        <li key={i}>
                          <Typography variant="body2">{s}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#ef4444' }}>
                      Areas for Improvement
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {selectedReport.areas_for_improvement?.map((a, i) => (
                        <li key={i}>
                          <Typography variant="body2">{a}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Question & Answer Review
                  </Typography>
                  {selectedReport.answers?.map((ans, i) => (
                    <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: '#f9fafb' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Q{i+1}: {ans.question}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Your Answer: {ans.answer}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip size="small" label={`Score: ${ans.score}%`} color="primary" />
                        <Typography variant="caption" color="textSecondary">
                          {ans.feedback}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3, bgcolor: '#eff6ff' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Next Steps
                    </Typography>
                    <Typography variant="body2">
                      {selectedReport.next_steps}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Grid>
  );
};

export default UserReports;