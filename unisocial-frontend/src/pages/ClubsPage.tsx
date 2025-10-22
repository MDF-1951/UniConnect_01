import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Event as EventIcon,
  Groups as GroupsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Verified as VerifiedIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { Club } from '../types';

const ClubsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Track membership statuses for each club
  const [membershipStatuses, setMembershipStatuses] = useState<Record<number, { isMember: boolean; status: string; role: string }>>({});
  
  // Create Club Dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [clubForm, setClubForm] = useState({
    name: '',
    description: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // State to track clubs created by current user
  const [userCreatedClubs, setUserCreatedClubs] = useState<number[]>([]);

  useEffect(() => {
    loadClubs();
    loadUserCreatedClubs();
    loadMembershipStatuses();
  }, []);

  useEffect(() => {
    // Filter clubs based on search query
    if (searchQuery.trim()) {
      const filtered = clubs.filter(club =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClubs(filtered);
    } else {
      setFilteredClubs(clubs);
    }
  }, [searchQuery, clubs]);

  const loadClubs = async () => {
    try {
      setLoading(true);
      // Only get verified clubs by default (for regular users)
      const clubsList = await apiService.getClubs(true);
      setClubs(clubsList);
      setFilteredClubs(clubsList);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadUserCreatedClubs = async () => {
    try {
      // Get user's club memberships to know which clubs they created/admin
      const memberships = await apiService.getUserClubs(user?.userId || 0);
      // Filter for clubs where user is admin
      const adminMemberships = memberships.filter(m => m.role === 'ADMIN');
      const clubIds = adminMemberships.map(m => m.clubId);
      setUserCreatedClubs(clubIds);
      
      // If user has created clubs, also load their pending clubs
      if (clubIds.length > 0) {
        const allClubs = await apiService.getClubs(undefined); // undefined means no filter (get all)
        const pendingClubs = allClubs.filter(club => 
          !club.verified && clubIds.includes(club.clubId)
        );
        
        // Add pending clubs to the list if they're not already there
        if (pendingClubs.length > 0) {
          setClubs(prevClubs => {
            const newClubs = [...prevClubs];
            pendingClubs.forEach(pendingClub => {
              if (!newClubs.some(c => c.clubId === pendingClub.clubId)) {
                newClubs.push(pendingClub);
              }
            });
            return newClubs;
          });
        }
      }
    } catch (error) {
      console.error('Error loading user club memberships:', error);
    }
  };

  const loadMembershipStatuses = async () => {
    try {
      const allClubs = await apiService.getClubs(undefined);
      const statuses: Record<number, { isMember: boolean; status: string; role: string }> = {};
      
      await Promise.all(
        allClubs.map(async (club) => {
          try {
            const status = await apiService.getClubMembershipStatus(club.clubId);
            statuses[club.clubId] = status;
          } catch (error) {
            console.error(`Error loading membership status for club ${club.clubId}:`, error);
          }
        })
      );
      
      setMembershipStatuses(statuses);
    } catch (error) {
      console.error('Error loading membership statuses:', error);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOptionsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleOptionsMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
    handleOptionsMenuClose();
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setClubForm({ name: '', description: '' });
    setLogoFile(null);
    setLogoPreview('');
    setShowSuccessMessage(false);
  };

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleCreateClub = async () => {
    if (!clubForm.name.trim()) {
      alert('Club name is required');
      return;
    }

    try {
      setCreating(true);
      let logoUrl = '';

      // Upload logo if selected
      if (logoFile) {
        const uploadResponse = await apiService.uploadImage(logoFile);
        logoUrl = uploadResponse.url;
      }

      await apiService.createClub({
        ...clubForm,
        logoUrl: logoUrl || undefined
      });
      setShowSuccessMessage(true);
      setClubForm({ name: '', description: '' });
      setLogoFile(null);
      setLogoPreview('');
      
      // Reload clubs after a delay
      setTimeout(() => {
        loadClubs();
        handleCloseCreateDialog();
      }, 3000);
    } catch (error: any) {
      console.error('Error creating club:', error);
      alert(`Failed to create club: ${error.response?.data?.error || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleClubClick = (clubId: number, event?: React.MouseEvent) => {
    // Don't navigate if clicking on a button
    if (event && (event.target as HTMLElement).closest('button')) {
      return;
    }
    
    const status = membershipStatuses[clubId];
    // If user is admin of this club, go to club profile/admin page
    if (status && status.role === 'ADMIN' && status.status === 'APPROVED') {
      navigate(`/club-profile/${clubId}`);
    } else {
      // Otherwise go to regular club view (for non-admins)
      navigate(`/club-view/${clubId}`);
    }
  };

  const handleJoinClub = async (clubId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await apiService.joinClub(clubId);
      // Reload membership status for this club
      const status = await apiService.getClubMembershipStatus(clubId);
      setMembershipStatuses(prev => ({
        ...prev,
        [clubId]: status
      }));
    } catch (error: any) {
      console.error('Error joining club:', error);
      alert(error.response?.data?.error || 'Failed to join club');
    }
  };

  const getJoinButtonText = (clubId: number) => {
    const status = membershipStatuses[clubId];
    if (!status || !status.isMember) {
      return 'Join';
    }
    
    switch (status.status) {
      case 'PENDING':
        return 'Request Sent';
      case 'APPROVED':
        return 'Member';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Join';
    }
  };

  const isJoinButtonDisabled = (clubId: number) => {
    const status = membershipStatuses[clubId];
    return status && status.isMember && (status.status === 'PENDING' || status.status === 'APPROVED' || status.status === 'REJECTED');
  };

  return (
    <StyledContainer>
      {/* Top Navbar */}
      <AppBar position="fixed" className="top-navbar">
        <Toolbar>
          <div className="nav-logo" onClick={() => navigate('/dashboard')}>
            <span className="logo-text">Uni<span className="lowercase">connect</span></span>
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
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="user-profile-card">
            <Avatar 
              className="user-avatar"
              src={user?.dpUrl ? (user.dpUrl.startsWith('http') ? user.dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.dpUrl}`) : undefined}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <h3 className="user-name">{user?.name}</h3>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate('/dashboard')}>
              <HomeIcon className="nav-item-icon" />
              <span>Home</span>
            </button>
            <button className="nav-item active">
              <GroupsIcon className="nav-item-icon" />
              <span>Clubs</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/events')}>
              <EventIcon className="nav-item-icon" />
              <span>Events</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/chat')}>
              <ChatIcon className="nav-item-icon" />
              <span>Messages</span>
            </button>
            {user?.role === 'ADMIN' && (
              <button className="nav-item" onClick={() => navigate('/admin')}>
                <DashboardIcon className="nav-item-icon" />
                <span>Overview</span>
              </button>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Clubs</h1>
              <p className="page-subtitle">Discover and join clubs</p>
            </div>
            <IconButton
              onClick={handleOptionsMenuOpen}
              sx={{
                color: '#b6a9b7',
                background: 'rgba(160, 153, 216, 0.1)',
                '&:hover': { background: 'rgba(160, 153, 216, 0.2)' }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </div>

          {/* Options Menu */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleOptionsMenuClose}
            PaperProps={{
              sx: {
                background: '#1e1a2e',
                border: '1px solid rgba(160, 153, 216, 0.3)',
                borderRadius: '8px',
              }
            }}
          >
            <MenuItem
              onClick={handleOpenCreateDialog}
              sx={{
                color: '#ffffff',
                fontFamily: "'Space Grotesk', sans-serif",
                '&:hover': { background: 'rgba(207, 48, 170, 0.1)' }
              }}
            >
              <AddIcon sx={{ marginRight: '12px', color: '#cf30aa' }} />
              Create Club
            </MenuItem>
          </Menu>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#b6a9b7' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              marginBottom: '24px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                '& fieldset': { borderColor: 'rgba(160, 153, 216, 0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(160, 153, 216, 0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#cf30aa' },
              },
              '& .MuiInputBase-input': {
                color: '#ffffff',
                fontFamily: "'Space Grotesk', sans-serif",
              },
            }}
          />

          {/* Clubs Grid */}
          {loading ? (
            <div className="loading-container">
              <CircularProgress style={{ color: '#cf30aa' }} />
              <p>Loading clubs...</p>
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="empty-state">
              <GroupsIcon sx={{ fontSize: 64, color: '#6b6878', marginBottom: '16px' }} />
              <h3>No clubs found</h3>
              <p>{searchQuery ? 'Try a different search term' : 'Be the first to create a club!'}</p>
            </div>
          ) : (
            <div className="clubs-grid">
              {filteredClubs.map((club) => (
                <Card
                  key={club.clubId}
                  onClick={(e) => handleClubClick(club.clubId, e)}
                  sx={{
                    background: 'rgba(16, 15, 28, 0.8)',
                    border: '1px solid rgba(160, 153, 216, 0.2)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#cf30aa',
                      boxShadow: '0 8px 24px rgba(207, 48, 170, 0.3)',
                    }
                  }}
                >
                  {club.logoUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={club.logoUrl.startsWith('http') ? club.logoUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${club.logoUrl}`}
                      alt={club.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h3 className="club-name">{club.name}</h3>
                      {club.verified && (
                        <VerifiedIcon sx={{ color: '#cf30aa', fontSize: '20px' }} />
                      )}
                    </div>
                    <p className="club-description">{club.description || 'No description available'}</p>
                    
                    {/* Show join button only for verified clubs or if not admin */}
                    {club.verified && membershipStatuses[club.clubId]?.role !== 'ADMIN' && (
                      <Button
                        variant="contained"
                        onClick={(e) => handleJoinClub(club.clubId, e)}
                        disabled={isJoinButtonDisabled(club.clubId)}
                        sx={{
                          marginTop: '12px',
                          width: '100%',
                          background: isJoinButtonDisabled(club.clubId) 
                            ? 'rgba(160, 153, 216, 0.2)' 
                            : 'linear-gradient(135deg, #402fb5, #cf30aa)',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            background: isJoinButtonDisabled(club.clubId)
                              ? 'rgba(160, 153, 216, 0.2)'
                              : 'linear-gradient(135deg, #cf30aa, #dfa2da)',
                          },
                          '&:disabled': { 
                            opacity: 0.7,
                            color: '#b6a9b7'
                          }
                        }}
                      >
                        {getJoinButtonText(club.clubId)}
                      </Button>
                    )}
                    
                    {/* Show admin badge for admins */}
                    {membershipStatuses[club.clubId]?.role === 'ADMIN' && (
                      <Chip
                        label="Admin"
                        sx={{
                          marginTop: '12px',
                          background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
                          color: 'white',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create Club Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: '#1e1a2e',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        <DialogTitle sx={{
          m: 0,
          p: 2.5,
          pb: 2,
          background: 'linear-gradient(135deg, rgba(160, 153, 216, 0.08) 0%, rgba(207, 48, 170, 0.08) 100%)',
          borderBottom: '1px solid rgba(160, 153, 216, 0.15)'
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: "'Playlist Script', cursive",
            fontSize: '28px',
            background: 'linear-gradient(135deg, #a099d8 0%, #cf30aa 50%, #dfa2da 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Create New Club
          </h2>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 3 }}>
          {showSuccessMessage ? (
            <Alert 
              severity="success"
              sx={{
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                color: '#4caf50',
                fontFamily: "'Space Grotesk', sans-serif",
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '8px',
                '& .MuiAlert-icon': { color: '#4caf50' }
              }}
            >
              <strong>Club created successfully!</strong>
              <br />
              Your club registration needs to be approved by an admin. Please send an email to <strong>admin1@gmail.com</strong> with your club details and contact information to get approval.
            </Alert>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Alert
                severity="info"
                sx={{
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  color: '#2196f3',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '13px',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  borderRadius: '8px',
                  '& .MuiAlert-icon': { color: '#2196f3' }
                }}
              >
                <strong>Note:</strong> Club registration requires admin approval. After submitting, please email <strong>admin1@gmail.com</strong> with your club details and POC contact information.
              </Alert>

              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '8px'
                }}>
                  Club Name *
                </label>
                <TextField
                  fullWidth
                  value={clubForm.name}
                  onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                  placeholder="Enter club name"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      '& fieldset': { borderColor: 'rgba(160, 153, 216, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(160, 153, 216, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#cf30aa', borderWidth: '2px' },
                    },
                    '& .MuiInputBase-input': {
                      color: '#ffffff',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '15px',
                      padding: '12px 14px',
                    },
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '8px'
                }}>
                  Description
                </label>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={clubForm.description}
                  onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                  placeholder="Describe your club..."
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      '& fieldset': { borderColor: 'rgba(160, 153, 216, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(160, 153, 216, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#cf30aa', borderWidth: '2px' },
                    },
                    '& .MuiInputBase-input': {
                      color: '#ffffff',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '15px',
                      padding: '12px 14px',
                    },
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '8px'
                }}>
                  Club Logo (Optional)
                </label>
                
                {logoPreview ? (
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '300px',
                    margin: '0 auto'
                  }}>
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '2px solid rgba(160, 153, 216, 0.2)'
                      }}
                    />
                    <Button
                      onClick={handleRemoveLogo}
                      sx={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        minWidth: 'auto',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(244, 67, 54, 0.9)',
                        color: 'white',
                        padding: 0,
                        '&:hover': {
                          background: 'rgba(244, 67, 54, 1)',
                        }
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    sx={{
                      border: '2px dashed rgba(160, 153, 216, 0.3)',
                      borderRadius: '10px',
                      padding: '32px 16px',
                      color: '#a099d8',
                      textTransform: 'none',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '15px',
                      fontWeight: 500,
                      '&:hover': {
                        border: '2px dashed rgba(207, 48, 170, 0.5)',
                        background: 'rgba(207, 48, 170, 0.05)',
                        color: '#cf30aa'
                      }
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoSelect}
                    />
                    📷 Click to upload club logo
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          pt: 2,
          borderTop: '1px solid rgba(160, 153, 216, 0.15)',
        }}>
          <Button
            onClick={handleCloseCreateDialog}
            disabled={creating}
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(160, 153, 216, 0.3)',
              color: '#b6a9b7',
              borderRadius: '8px',
              padding: '10px 24px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
                borderColor: '#a099d8',
              }
            }}
          >
            {showSuccessMessage ? 'Close' : 'Cancel'}
          </Button>
          {!showSuccessMessage && (
            <Button
              onClick={handleCreateClub}
              disabled={creating}
              sx={{
                background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
                color: 'white',
                borderRadius: '8px',
                padding: '10px 24px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(207, 48, 170, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #cf30aa, #dfa2da)',
                },
                '&:disabled': { opacity: 0.6 }
              }}
            >
              {creating ? <CircularProgress size={20} style={{ color: 'white' }} /> : 'Create Club'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
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

  .nav-logo {
    cursor: pointer;
    padding: 8px 16px;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .logo-text {
    font-family: 'Playlist Script', cursive;
    font-size: 32px;
    background: linear-gradient(135deg, #a099d8 0%, #cf30aa 50%, #dfa2da 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: normal;
    letter-spacing: 1px;
  }

  .lowercase {
    text-transform: lowercase;
  }

  .main-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;
    padding: 88px 24px 24px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .left-sidebar {
    background: rgba(16, 15, 28, 0.8);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 20px;
    padding: 24px;
    height: fit-content;
    position: sticky;
    top: 88px;
  }

  .user-profile-card {
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(160, 153, 216, 0.2);
  }

  .user-avatar {
    width: 80px !important;
    height: 80px !important;
    margin: 0 auto 16px;
    border: 3px solid #cf30aa;
    box-shadow: 0 4px 12px rgba(207, 48, 170, 0.3);
    font-size: 32px;
    font-weight: bold;
  }

  .user-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: transparent;
    border: none;
    border-radius: 12px;
    color: #b6a9b7;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(160, 153, 216, 0.1);
      color: #dfa2da;
    }

    &.active {
      background: linear-gradient(135deg, rgba(160, 153, 216, 0.2), rgba(207, 48, 170, 0.2));
      color: #dfa2da;
      box-shadow: 0 4px 12px rgba(207, 48, 170, 0.2);
    }
  }

  .nav-item-icon {
    font-size: 24px;
  }

  .main-content {
    background: rgba(16, 15, 28, 0.6);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 20px;
    padding: 32px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .page-title {
    font-family: 'Playlist Script', cursive;
    font-size: 42px;
    background: linear-gradient(135deg, #a099d8 0%, #cf30aa 50%, #dfa2da 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .page-subtitle {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    color: #8a8494;
    margin: 4px 0 0 0;
  }

  .clubs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .club-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  .club-description {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #b6a9b7;
    margin: 8px 0 0 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .loading-container, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;

    h3 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      color: #ffffff;
      margin: 0 0 8px 0;
    }

    p {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      color: #8a8494;
      margin: 0;
    }
  }

  @media (max-width: 968px) {
    .main-container {
      grid-template-columns: 1fr;
    }

    .left-sidebar {
      display: none;
    }
  }
`;

export default ClubsPage;

