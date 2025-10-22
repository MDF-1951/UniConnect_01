import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import apiService from '../services/api';
import {
  TextField,
  Button,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import StayHardLoader from '../components/StayHardLoader';

const ProfileCompletionPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [bio, setBio] = useState('');
  const [dpFile, setDpFile] = useState<File | null>(null);
  const [dpPreview, setDpPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleDpSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSnackbar({ open: true, message: 'Please select an image file', severity: 'error' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: 'Image size must be less than 5MB', severity: 'error' });
      return;
    }

    setDpFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setDpPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleComplete = async () => {
    if (!displayName.trim()) {
      setSnackbar({ open: true, message: 'Display name is required', severity: 'error' });
      return;
    }

    try {
      setLoading(true);

      // Upload DP if selected
      let dpUrl = user?.dpUrl || '';
      if (dpFile) {
        const uploadResponse = await apiService.uploadImage(dpFile);
        dpUrl = uploadResponse.url;
      }

      // Update profile
      await apiService.updateProfile({
        name: displayName.trim(),
        bio: bio.trim() || undefined,
        dpUrl: dpUrl || undefined,
      });

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      setSnackbar({ open: true, message: 'Profile completed successfully!', severity: 'success' });
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Error completing profile:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.error || 'Failed to update profile', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <StayHardLoader />;
  }

  return (
    <StyledWrapper>
      <div className="completion-container">
        <div className="completion-card">
          <div className="header">
            <h1 className="title">Complete Your Profile</h1>
            <p className="subtitle">Let's get you set up! Add your details to personalize your UniConnect experience.</p>
          </div>

          <div className="profile-picture-section">
            <div className="avatar-container">
              <Avatar
                src={dpPreview || user?.dpUrl}
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
                }}
              >
                {displayName.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <IconButton
                component="label"
                className="camera-button"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #cf30aa, #402fb5)',
                  },
                }}
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleDpSelect}
                />
                <PhotoCameraIcon />
              </IconButton>
            </div>
            <p className="upload-hint">Click the camera icon to upload your photo</p>
          </div>

          <div className="form-section">
            <TextField
              fullWidth
              label="Display Name"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  '& fieldset': { borderColor: 'rgba(160, 153, 216, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(160, 153, 216, 0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#cf30aa' },
                },
                '& .MuiInputLabel-root': {
                  color: '#a099d8',
                  fontFamily: "'Space Grotesk', sans-serif",
                },
                '& .MuiInputBase-input': {
                  color: '#ffffff',
                  fontFamily: "'Space Grotesk', sans-serif",
                },
              }}
            />

            <TextField
              fullWidth
              label="Bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              multiline
              rows={4}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  '& fieldset': { borderColor: 'rgba(160, 153, 216, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(160, 153, 216, 0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#cf30aa' },
                },
                '& .MuiInputLabel-root': {
                  color: '#a099d8',
                  fontFamily: "'Space Grotesk', sans-serif",
                },
                '& .MuiInputBase-input': {
                  color: '#ffffff',
                  fontFamily: "'Space Grotesk', sans-serif",
                },
              }}
            />
          </div>

          <div className="actions">
            <Button
              onClick={handleSkip}
              sx={{
                color: '#a099d8',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '16px',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(160, 153, 216, 0.1)',
                },
              }}
            >
              Skip for now
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!displayName.trim()}
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
                color: 'white',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '16px',
                fontWeight: 600,
                textTransform: 'none',
                padding: '12px 32px',
                borderRadius: '12px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #cf30aa, #402fb5)',
                },
                '&:disabled': {
                  background: 'rgba(160, 153, 216, 0.2)',
                  color: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              Complete Profile
            </Button>
          </div>

          <div className="progress-indicator">
            <div className="progress-step completed"></div>
            <div className="progress-step active"></div>
            <div className="progress-step"></div>
          </div>
          <p className="progress-text">Step 2 of 3</p>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  .completion-container {
    width: 100%;
    max-width: 600px;
  }

  .completion-card {
    background: rgba(16, 15, 28, 0.9);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 24px;
    padding: 48px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
  }

  .title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #ffffff, #dfa2da);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    color: #a099d8;
    margin: 0;
  }

  .profile-picture-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40px;
  }

  .avatar-container {
    position: relative;
    margin-bottom: 12px;
  }

  .upload-hint {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #8a8494;
    margin: 0;
  }

  .form-section {
    margin-bottom: 32px;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .progress-indicator {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .progress-step {
    width: 60px;
    height: 4px;
    background: rgba(160, 153, 216, 0.2);
    border-radius: 2px;
    transition: all 0.3s ease;

    &.completed {
      background: linear-gradient(135deg, #402fb5, #cf30aa);
    }

    &.active {
      background: linear-gradient(135deg, #cf30aa, #dfa2da);
    }
  }

  .progress-text {
    text-align: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #a099d8;
    margin: 0;
  }

  @media (max-width: 768px) {
    .completion-card {
      padding: 32px 24px;
    }

    .title {
      font-size: 24px;
    }

    .subtitle {
      font-size: 14px;
    }
  }
`;

export default ProfileCompletionPage;




