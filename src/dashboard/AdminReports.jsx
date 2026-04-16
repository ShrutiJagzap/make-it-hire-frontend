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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { Visibility, Download, Assessment } from '@mui/icons-material';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/reports/all');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:8000/report/${reportId}`);
      const report = await response.json();
      setSelectedReport(report);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const getVerdictColor = (verdict) => {
    switch(verdict) {
      case 'STRONG HIRE': return 'success';
      case 'HIRE': return 'info';
      case 'CONSIDER': return 'warning';
      case 'REJECT': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        AI Interview Reports
      </Typography>

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f3f4f6' }}>
              <TableRow>
                <TableCell><strong>Candidate</strong></TableCell>
                <TableCell><strong>Job Position</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Score</strong></TableCell>
                <TableCell><strong>Verdict</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {report.candidate_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {report.candidate_email}
                    </Typography>
                  </TableCell>
                  <TableCell>{report.job_title}</TableCell>
                  <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={report.overall_score} 
                        sx={{ width: 80, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="body2">{report.overall_score}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.verdict} 
                      color={getVerdictColor(report.verdict)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Report">
                      <IconButton 
                        size="small"
                        onClick={() => handleViewReport(report.id)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Assessment sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                    <Typography color="textSecondary">
                      No interview reports yet. Candidates will appear here after completing interviews.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Report Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedReport && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Interview Report: {selectedReport.candidate_name}
                </Typography>
                <Chip 
                  label={selectedReport.verdict} 
                  color={getVerdictColor(selectedReport.verdict)}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <Chip label={`Job: ${selectedReport.job_title}`} variant="outlined" />
                    <Chip label={`Date: ${new Date(selectedReport.date).toLocaleString()}`} variant="outlined" />
                    <Chip label={`Questions: ${selectedReport.questions_answered}/${selectedReport.total_questions}`} variant="outlined" />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                    <Typography variant="h3" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
                      {selectedReport.overall_score}%
                    </Typography>
                    <Typography variant="body2">Overall Score</Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={6}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                    <Typography variant="h3" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                      {selectedReport.technical_score}%
                    </Typography>
                    <Typography variant="body2">Technical Score</Typography>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Overall Assessment
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
                  <Card sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Interview Q&A
                    </Typography>
                    {selectedReport.answers?.map((ans, i) => (
                      <Box key={i} sx={{ mb: 3, p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Q{i+1}: {ans.question}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: '#4b5563' }}>
                          Answer: {ans.answer}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip size="small" label={`Score: ${ans.score}%`} color="primary" />
                          <Typography variant="caption" color="textSecondary">
                            {ans.feedback}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 3 }}>
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
    </Box>
  );
};

export default AdminReports;