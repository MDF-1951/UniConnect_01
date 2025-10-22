import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  Send as SendIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { CreatePostRequest } from '../types';

interface LocationState {
  clubId?: number;
  clubName?: string;
}

const CreatePostPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const isClubPost = state?.clubId && state?.clubName;

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    const input = document.getElementById('media-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleCreatePost = async () => {
    if (!content.trim() && !mediaFile) {
      setSnackbarMessage('Please add some content or media to your post');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      setIsPosting(true);
      
      let mediaUrl = '';
      if (mediaFile) {
        const uploadResponse = await apiService.uploadMedia(mediaFile);
        mediaUrl = uploadResponse.url;
      }

      const postData: CreatePostRequest = {
        contentText: content.trim(),
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaFile ? (mediaFile.type.startsWith('image/') ? 'IMAGE' : 'VIDEO') : 'TEXT',
        // If it's a club post, we'll need to handle this differently
        // For now, we'll create it as a user post and let the backend handle club posts separately
      };

      if (isClubPost) {
        // This would need a special API endpoint for club posts
        // For now, create as regular post
        await apiService.createPost(postData);
        setSnackbarMessage(`Post created for ${state.clubName}!`);
      } else {
        await apiService.createPost(postData);
        setSnackbarMessage('Post created successfully!');
      }

      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Navigate back after a short delay
      setTimeout(() => {
        if (isClubPost) {
          navigate(`/clubs/${state.clubId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1500);

    } catch (error: any) {
      console.error('Error creating post:', error);
      setSnackbarMessage(`Failed to create post: ${error.response?.data?.error || error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsPosting(false);
    }
  };

  const handleBack = () => {
    if (isClubPost) {
      navigate(`/clubs/${state.clubId}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <StyledContainer>
      {/* Top Navbar */}
      <AppBar position="fixed" className="top-navbar">
        <Toolbar>
          <IconButton color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          
          <div className="nav-title">
            <span className="logo-text">
              {isClubPost ? `Post for ${state.clubName}` : 'Create Post'}
            </span>
          </div>

          <div style={{ flexGrow: 1 }} />

          <div className="nav-actions">
            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              <Avatar 
                src={user?.dpUrl ? (user.dpUrl.startsWith('http') ? user.dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.dpUrl}`) : undefined}
                sx={{ width: 40, height: 40 }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: '#1e1a2e',
            border: '1px solid rgba(160, 153, 216, 0.3)',
            borderRadius: '12px',
            marginTop: '8px',
          }
        }}
      >
        <MenuItem 
          onClick={() => { navigate('/dashboard'); handleMenuClose(); }}
          sx={{
            color: '#ffffff',
            fontFamily: "'Space Grotesk', sans-serif",
            '&:hover': { background: 'rgba(207, 48, 170, 0.1)' }
          }}
        >
          <HomeIcon sx={{ marginRight: '12px', color: '#a099d8' }} />
          Home
        </MenuItem>
        <MenuItem 
          onClick={handleLogout}
          sx={{
            color: '#ffffff',
            fontFamily: "'Space Grotesk', sans-serif",
            '&:hover': { background: 'rgba(207, 48, 170, 0.1)' }
          }}
        >
          <LogoutIcon sx={{ marginRight: '12px', color: '#cf30aa' }} />
          Logout
        </MenuItem>
      </Menu>

      <div className="main-container">
        <div className="create-post-card">
          <Card sx={{
            background: 'rgba(16, 15, 28, 0.8)',
            border: '1px solid rgba(160, 153, 216, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}>
            <CardContent sx={{ padding: '32px' }}>
              <div className="post-header">
                <Avatar
                  src={user?.dpUrl ? (user.dpUrl.startsWith('http') ? user.dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.dpUrl}`) : undefined}
                  sx={{ width: 56, height: 56, border: '3px solid #cf30aa' }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <div className="author-info">
                  <h3 className="author-name">{user?.name}</h3>
                  <p className="post-type">
                    {isClubPost ? `Posting as ${state.clubName}` : 'Personal Post'}
                  </p>
                </div>
              </div>

              <TextField
                fullWidth
                multiline
                rows={6}
                placeholder={isClubPost ? `What's happening at ${state.clubName}?` : "What's on your mind?"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                variant="outlined"
                sx={{
                  marginTop: '24px',
                  marginBottom: '24px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: 'rgba(160, 153, 216, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(160, 153, 216, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#cf30aa', borderWidth: '2px' },
                  },
                  '& .MuiInputBase-input': {
                    color: '#ffffff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '16px',
                    lineHeight: '1.6',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#8a8494',
                    opacity: 1,
                  },
                }}
              />

              {/* Media Preview */}
              {mediaPreview && (
                <div className="media-preview">
                  <img src={mediaPreview} alt="Preview" className="preview-image" />
                  <Button
                    onClick={handleRemoveMedia}
                    className="remove-media-btn"
                    size="small"
                  >
                    Remove
                  </Button>
                </div>
              )}

              {/* Actions */}
              <div className="post-actions">
                <input
                  id="media-input"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  style={{ display: 'none' }}
                />
                <Button
                  component="label"
                  htmlFor="media-input"
                  startIcon={<ImageIcon />}
                  sx={{
                    color: '#b6a9b7',
                    fontFamily: "'Space Grotesk', sans-serif",
                    textTransform: 'none',
                    '&:hover': {
                      color: '#cf30aa',
                      background: 'rgba(207, 48, 170, 0.1)',
                    }
                  }}
                >
                  Add Media
                </Button>

                <div style={{ flexGrow: 1 }} />

                <Button
                  onClick={handleCreatePost}
                  disabled={isPosting || (!content.trim() && !mediaFile)}
                  startIcon={isPosting ? <CircularProgress size={20} /> : <SendIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '16px',
                    boxShadow: '0 4px 12px rgba(207, 48, 170, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #cf30aa, #dfa2da)',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                      background: 'rgba(160, 153, 216, 0.3)',
                    }
                  }}
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '14px'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  min-height: 100vh;
  background: #0a0812;
  background-image: 
    radial-gradient(at 20% 30%, hsl(262, 47%, 8%) 0, transparent 50%), 
    radial-gradient(at 80% 70%, hsl(288, 39%, 10%) 0, transparent 50%);

  .top-navbar {
    background: rgba(16, 15, 28, 0.95) !important;
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(160, 153, 216, 0.1);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  }

  .nav-title {
    margin-left: 16px;
  }

  .logo-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
  }

  .main-container {
    padding: 88px 24px 24px;
    max-width: 800px;
    margin: 0 auto;
  }

  .create-post-card {
    width: 100%;
  }

  .post-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .author-info {
    .author-name {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 4px 0;
    }

    .post-type {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      color: #b6a9b7;
      margin: 0;
    }
  }

  .media-preview {
    position: relative;
    margin-bottom: 24px;
    border-radius: 12px;
    overflow: hidden;

    .preview-image {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
      display: block;
    }

    .remove-media-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.7) !important;
      color: white !important;
      border-radius: 8px !important;
      padding: 6px 12px !important;
      font-family: 'Space Grotesk', sans-serif !important;
      text-transform: none !important;
      font-size: 12px !important;

      &:hover {
        background: rgba(255, 0, 0, 0.8) !important;
      }
    }
  }

  .post-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  @media (max-width: 768px) {
    .main-container {
      padding: 88px 16px 24px;
    }
  }
`;

export default CreatePostPage;
