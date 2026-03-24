import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';

const ProfileEditModal = ({ open, onClose, userData, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    title: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        title: userData.title || ''
      });
      setProfileImagePreview(userData.photo || '');
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Please upload an image less than 5MB.');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const userId = localStorage.getItem('userId');
      
      // Update profile information
      const updateResponse = await fetch(`http://localhost:8081/api/auth/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          title: formData.title
        })
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      // Upload profile image if changed
      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', profileImage);
        
        const imageResponse = await fetch(`http://localhost:8081/api/auth/profile/upload/${userId}`, {
          method: 'POST',
          body: imageFormData
        });
        
        if (!imageResponse.ok) {
          throw new Error('Failed to upload profile image');
        }
        
        const imageData = await imageResponse.json();
        setProfileImagePreview(`http://localhost:8081/api/auth/profile/image/${imageData.photoUrl}`);
      }
      
      setSuccess('Profile updated successfully!');
      
      // Notify parent component to refresh user data
      if (onUpdate) {
        onUpdate();
      }
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb',
        pb: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Edit Profile
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        {/* Profile Image Upload */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profileImagePreview}
              sx={{ 
                width: 100, 
                height: 100,
                border: '3px solid #6366f1',
                boxShadow: 2
              }}
            >
              {!profileImagePreview && formData.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <IconButton
              component="label"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#6366f1',
                color: 'white',
                '&:hover': { backgroundColor: '#4f46e5' },
                width: 32,
                height: 32
              }}
            >
              <PhotoCamera sx={{ fontSize: 18 }} />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </IconButton>
          </Box>
        </Box>
        
        {/* Form Fields */}
        <TextField
          fullWidth
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          margin="normal"
          variant="outlined"
        />
        
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          margin="normal"
          variant="outlined"
          disabled
          helperText="Email cannot be changed"
        />
        
        <TextField
          fullWidth
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          margin="normal"
          variant="outlined"
          placeholder="+91 1234567890"
        />
        
        <TextField
          fullWidth
          label="Job Title / Role"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          margin="normal"
          variant="outlined"
          placeholder="e.g., Full Stack Developer"
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ 
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileEditModal;