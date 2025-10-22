import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import apiService from '../services/api';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import StayHardLoader from '../components/StayHardLoader';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  Event as EventIcon,
  Chat as ChatIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  PostAdd as PostAddIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminOverviewPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTab, setCurrentTab] = useState(0);
  
  // User Management State
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Post Moderation State
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  // Club Management State
  const [clubs, setClubs] = useState<any[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<any[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [clubFilter, setClubFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [clubSearchQuery, setClubSearchQuery] = useState('');
  
  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // UI State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteClubDialogOpen, setDeleteClubDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadUsers();
    loadPosts();
    loadClubs();
    loadAnalytics();
    loadTrendingPosts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(u => 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.regNo?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  useEffect(() => {
    let filtered = clubs;
    
    // Apply status filter
    if (clubFilter === 'approved') {
      filtered = filtered.filter(c => c.verified === true);
    } else if (clubFilter === 'pending') {
      filtered = filtered.filter(c => c.verified === false);
    } else if (clubFilter === 'rejected') {
      filtered = filtered.filter(c => c.verified === null);
    }
    
    // Apply search filter
    if (clubSearchQuery.trim()) {
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(clubSearchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(clubSearchQuery.toLowerCase())
      );
    }
    
    setFilteredClubs(filtered);
  }, [clubFilter, clubSearchQuery, clubs]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiService.getAllUsers();
      setUsers(response.users || []);
      setFilteredUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showSnackbar('Failed to load users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoadingPosts(true);
      const feedPosts = await apiService.getPostsFeed();
      setPosts(feedPosts.slice(0, 50)); // Show recent 50 posts
    } catch (error) {
      console.error('Error loading posts:', error);
      showSnackbar('Failed to load posts', 'error');
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadClubs = async () => {
    try {
      setLoadingClubs(true);
      const allClubs = await apiService.getAllClubsForAdmin();
      setClubs(allClubs);
      setFilteredClubs(allClubs);
    } catch (error) {
      console.error('Error loading clubs:', error);
      showSnackbar('Failed to load clubs', 'error');
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const analyticsData = await apiService.getAdminAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadTrendingPosts = async () => {
    try {
      const trending = await apiService.getTrendingPosts(10);
      setTrendingPosts(trending.posts || []);
    } catch (error) {
      console.error('Error loading trending posts:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await apiService.deleteUser(selectedUser.userId);
      showSnackbar('User deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
      loadAnalytics();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to remove this post?')) return;
    
    try {
      await apiService.deletePost(postId);
      showSnackbar('Post removed successfully', 'success');
      loadPosts();
      loadAnalytics();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error || 'Failed to remove post', 'error');
    }
  };

  const handleApproveClub = async (clubId: number) => {
    try {
      await apiService.approveClub(clubId);
      showSnackbar('Club approved successfully', 'success');
      loadClubs();
      loadAnalytics();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error || 'Failed to approve club', 'error');
    }
  };

  const handleRejectClub = async (clubId: number) => {
    if (!window.confirm('Are you sure you want to reject this club?')) return;
    
    try {
      await apiService.rejectClub(clubId);
      showSnackbar('Club rejected', 'success');
      loadClubs();
      loadAnalytics();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error || 'Failed to reject club', 'error');
    }
  };

  const handleDeleteClub = async () => {
    if (!selectedClub) return;
    
    try {
      await apiService.deleteClub(selectedClub.clubId);
      showSnackbar('Club deleted successfully', 'success');
      setDeleteClubDialogOpen(false);
      setSelectedClub(null);
      loadClubs();
      loadAnalytics();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error || 'Failed to delete club', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <PageContainer>
      {/* Top Navbar */}
      <AppBar position="fixed" className="top-navbar">
        <Toolbar>
          <div className="nav-logo" onClick={() => navigate('/dashboard')}>
            <span className="logo-text">Uni<span className="lowercase">connect</span></span>
          </div>

          <div style={{ flexGrow: 1 }} />

          <Avatar
            onClick={handleMenuClick}
            sx={{
              width: 40,
              height: 40,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                background: '#1e1a2e',
                border: '1px solid rgba(160, 153, 216, 0.2)',
                borderRadius: '8px',
                mt: 1,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                navigate('/dashboard');
                handleMenuClose();
              }}
              sx={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: '#ffffff',
                '&:hover': { background: 'rgba(160, 153, 216, 0.1)' },
              }}
            >
              Dashboard
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: '#ffffff',
                '&:hover': { background: 'rgba(244, 67, 54, 0.1)' },
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <div className="main-container">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-section">
            <div className="admin-badge">
              <DashboardIcon sx={{ fontSize: 32, color: '#cf30aa' }} />
              <h3>Admin Panel</h3>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate('/dashboard')}>
              <HomeIcon className="nav-item-icon" />
              <span>Home</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/profile')}>
              <PersonIcon className="nav-item-icon" />
              <span>Profile</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/clubs')}>
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
            <button className="nav-item active" onClick={() => navigate('/admin')}>
              <DashboardIcon className="nav-item-icon" />
              <span>Overview</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <h1 className="page-title">Admin Overview</h1>

          {/* Analytics Summary Cards */}
          {analytics && (
            <div className="analytics-cards">
              <Card className="stat-card">
                <CardContent>
                  <div className="stat-icon">
                    <PeopleIcon sx={{ fontSize: 40, color: '#402fb5' }} />
                  </div>
                  <h3>{analytics.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </CardContent>
              </Card>
              
              <Card className="stat-card">
                <CardContent>
                  <div className="stat-icon">
                    <GroupsIcon sx={{ fontSize: 40, color: '#cf30aa' }} />
                  </div>
                  <h3>{analytics.totalClubs || 0}</h3>
                  <p>Total Clubs</p>
                  <small>{analytics.verifiedClubs || 0} verified</small>
                </CardContent>
              </Card>
              
              <Card className="stat-card">
                <CardContent>
                  <div className="stat-icon">
                    <PostAddIcon sx={{ fontSize: 40, color: '#dfa2da' }} />
                  </div>
                  <h3>{analytics.totalPosts || 0}</h3>
                  <p>Total Posts</p>
                </CardContent>
              </Card>
              
              <Card className="stat-card">
                <CardContent>
                  <div className="stat-icon">
                    <EventIcon sx={{ fontSize: 40, color: '#a099d8' }} />
                  </div>
                  <h3>{analytics.totalEvents || 0}</h3>
                  <p>Total Events</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(160, 153, 216, 0.2)', mt: 4 }}>
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: '#a099d8',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '16px',
                },
                '& .Mui-selected': {
                  color: '#cf30aa !important',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#cf30aa',
                },
              }}
            >
              <Tab label="User Management" />
              <Tab label="Club Management" />
              <Tab label="Post Moderation" />
              <Tab label="Trending Insights" />
            </Tabs>
          </Box>

          {/* Tab 1: User Management */}
          <TabPanel value={currentTab} index={0}>
            <div className="search-section">
              <TextField
                fullWidth
                placeholder="Search by name, email, or registration number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#a099d8', mr: 1 }} />,
                }}
                sx={{
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
            </div>

            {loadingUsers ? (
              <StayHardLoader />
            ) : (
              <TableContainer component={Paper} sx={{ 
                mt: 3,
                background: 'rgba(16, 15, 28, 0.8)',
                border: '1px solid rgba(160, 153, 216, 0.2)',
                borderRadius: '12px',
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Reg No</TableCell>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Joined</TableCell>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow
                        key={u.userId}
                        sx={{
                          '&:hover': { background: 'rgba(160, 153, 216, 0.05)' },
                        }}
                      >
                        <TableCell sx={{ color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>{u.name}</TableCell>
                        <TableCell sx={{ color: '#b6a9b7', fontFamily: "'Space Grotesk', sans-serif" }}>{u.email}</TableCell>
                        <TableCell sx={{ color: '#b6a9b7', fontFamily: "'Space Grotesk', sans-serif" }}>{u.regNo}</TableCell>
                        <TableCell>
                          <Chip
                            label={u.role}
                            size="small"
                            sx={{
                              background: u.role === 'ADMIN' ? 'linear-gradient(135deg, #402fb5, #cf30aa)' : 'rgba(160, 153, 216, 0.2)',
                              color: 'white',
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#b6a9b7', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {formatDate(u.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/profile/${u.userId}`)}
                              sx={{ color: '#a099d8', '&:hover': { color: '#cf30aa' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(u);
                                setDeleteDialogOpen(true);
                              }}
                              sx={{ color: '#b6a9b7', '&:hover': { color: '#f44336' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Tab 2: Club Management */}
          <TabPanel value={currentTab} index={1}>
            <div className="search-section" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search clubs by name or description..."
                value={clubSearchQuery}
                onChange={(e) => setClubSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#a099d8', mr: 1 }} />,
                }}
                sx={{
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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label="All"
                  onClick={() => setClubFilter('all')}
                  sx={{
                    background: clubFilter === 'all' ? 'linear-gradient(135deg, #402fb5, #cf30aa)' : 'rgba(160, 153, 216, 0.2)',
                    color: 'white',
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                />
                <Chip
                  label="Approved"
                  onClick={() => setClubFilter('approved')}
                  sx={{
                    background: clubFilter === 'approved' ? 'linear-gradient(135deg, #4caf50, #81c784)' : 'rgba(76, 175, 80, 0.2)',
                    color: 'white',
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                />
                <Chip
                  label="Pending"
                  onClick={() => setClubFilter('pending')}
                  sx={{
                    background: clubFilter === 'pending' ? 'linear-gradient(135deg, #ff9800, #ffb74d)' : 'rgba(255, 152, 0, 0.2)',
                    color: 'white',
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                />
                <Chip
                  label="Rejected"
                  onClick={() => setClubFilter('rejected')}
                  sx={{
                    background: clubFilter === 'rejected' ? 'linear-gradient(135deg, #f44336, #e57373)' : 'rgba(244, 67, 54, 0.2)',
                    color: 'white',
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                />
              </Box>
            </div>

            {loadingClubs ? (
              <StayHardLoader />
            ) : (
              <TableContainer component={Paper} sx={{ 
                mt: 3,
                background: 'rgba(16, 15, 28, 0.8)',
                border: '1px solid rgba(160, 153, 216, 0.2)',
                borderRadius: '12px',
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Members</TableCell>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: '#a099d8', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClubs.map((club) => (
                      <TableRow
                        key={club.clubId}
                        sx={{
                          '&:hover': { background: 'rgba(160, 153, 216, 0.05)' },
                        }}
                      >
                        <TableCell sx={{ color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>{club.name}</TableCell>
                        <TableCell sx={{ color: '#b6a9b7', fontFamily: "'Space Grotesk', sans-serif", maxWidth: 300 }}>
                          {club.description?.substring(0, 60)}{club.description?.length > 60 ? '...' : ''}
                        </TableCell>
                        <TableCell sx={{ color: '#b6a9b7', fontFamily: "'Space Grotesk', sans-serif" }}>{club.memberCount || 0}</TableCell>
                        <TableCell>
                          <Chip
                            label={club.verified === true ? 'APPROVED' : club.verified === false ? 'PENDING' : 'REJECTED'}
                            size="small"
                            sx={{
                              background: club.verified === true
                                ? 'rgba(76, 175, 80, 0.2)'
                                : club.verified === false
                                ? 'rgba(255, 152, 0, 0.2)'
                                : 'rgba(244, 67, 54, 0.2)',
                              color: club.verified === true
                                ? '#4caf50'
                                : club.verified === false
                                ? '#ff9800'
                                : '#f44336',
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {club.verified === false && (
                              <>
                                <Button
                                  size="small"
                                  onClick={() => handleApproveClub(club.clubId)}
                                  sx={{
                                    color: '#4caf50',
                                    borderColor: '#4caf50',
                                    '&:hover': {
                                      background: 'rgba(76, 175, 80, 0.1)',
                                      borderColor: '#4caf50',
                                    },
                                  }}
                                  variant="outlined"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  onClick={() => handleRejectClub(club.clubId)}
                                  sx={{
                                    color: '#f44336',
                                    borderColor: '#f44336',
                                    '&:hover': {
                                      background: 'rgba(244, 67, 54, 0.1)',
                                      borderColor: '#f44336',
                                    },
                                  }}
                                  variant="outlined"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/club-profile/${club.clubId}`)}
                              sx={{ color: '#a099d8', '&:hover': { color: '#cf30aa' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedClub(club);
                                setDeleteClubDialogOpen(true);
                              }}
                              sx={{ color: '#b6a9b7', '&:hover': { color: '#f44336' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Tab 3: Post Moderation */}
          <TabPanel value={currentTab} index={2}>
            {loadingPosts ? (
              <StayHardLoader />
            ) : (
              <div className="posts-grid">
                {posts.map((post) => (
                  <Card key={post.postId} className="post-card">
                    <CardContent>
                      <div className="post-header">
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {post.authorName?.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          <h4>{post.authorName}</h4>
                          <p>{formatDate(post.createdAt)}</p>
                        </div>
                        <IconButton
                          onClick={() => handleDeletePost(post.postId)}
                          sx={{ marginLeft: 'auto', color: '#b6a9b7', '&:hover': { color: '#f44336' } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                      <p className="post-content">{post.contentText}</p>
                      {post.mediaUrl && (
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${post.mediaUrl}`}
                          alt="Post media"
                          className="post-image"
                        />
                      )}
                      <div className="post-stats">
                        <span>❤️ {post.likeCount || 0} likes</span>
                        <span>💬 {post.commentCount || 0} comments</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabPanel>

          {/* Tab 4: Trending Insights */}
          <TabPanel value={currentTab} index={3}>
            <h2 style={{ color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '20px' }}>
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Top Trending Posts
            </h2>
            <div className="trending-list">
              {trendingPosts.map((post, index) => (
                <Card key={post.postId} className="trending-card">
                  <CardContent>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="rank-badge">#{index + 1}</div>
                      <div style={{ flex: 1 }}>
                        <h4>{post.authorName}</h4>
                        <p>{post.contentText?.substring(0, 100)}...</p>
                        <div className="engagement-stats">
                          <Chip
                            label={`${post.totalEngagement || 0} engagements`}
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
                              color: 'white',
                              mr: 1,
                            }}
                          />
                          <span>❤️ {post.likeCount || 0}</span>
                          <span>💬 {post.commentCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabPanel>
        </main>
      </div>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(160, 153, 216, 0.2)',
            borderRadius: '16px',
          },
        }}
      >
        <DialogTitle sx={{ color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
          Confirm Delete User
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All user data, posts, and associations will be permanently removed.
          </Alert>
          <p style={{ color: '#b6a9b7', fontFamily: "'Space Grotesk', sans-serif" }}>
            Are you sure you want to delete user <strong style={{ color: '#cf30aa' }}>{selectedUser?.name}</strong>?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#a099d8' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            sx={{
              background: 'linear-gradient(135deg, #f44336, #e57373)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #e57373, #ef5350)',
              },
            }}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Club Dialog */}
      <Dialog
        open={deleteClubDialogOpen}
        onClose={() => setDeleteClubDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(160, 153, 216, 0.2)',
            borderRadius: '16px',
          },
        }}
      >
        <DialogTitle sx={{ color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
          Confirm Delete Club
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All club data, posts, events, and memberships will be permanently removed.
          </Alert>
          <p style={{ color: '#b6a9b7', fontFamily: "'Space Grotesk', sans-serif" }}>
            Are you sure you want to delete club <strong style={{ color: '#cf30aa' }}>{selectedClub?.name}</strong>?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteClubDialogOpen(false)} sx={{ color: '#a099d8' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteClub}
            sx={{
              background: 'linear-gradient(135deg, #f44336, #e57373)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #e57373, #ef5350)',
              },
            }}
          >
            Delete Club
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding-top: 64px;

  .top-navbar {
    background: rgba(16, 15, 28, 0.95) !important;
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(160, 153, 216, 0.1);
  }

  .nav-logo {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-text {
    font-family: 'Playlist Script', cursive;
    font-size: 32px;
    font-weight: 400;
    color: #ffffff;
  }

  .lowercase {
    background: linear-gradient(135deg, #402fb5, #cf30aa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .main-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;
    max-width: 1600px;
    margin: 0 auto;
    padding: 24px;
  }

  .left-sidebar {
    position: sticky;
    top: 88px;
    height: fit-content;
    background: rgba(16, 15, 28, 0.8);
    border-radius: 16px;
    border: 1px solid rgba(160, 153, 216, 0.2);
    padding: 24px;
  }

  .admin-badge {
    text-align: center;
    padding: 20px;
    margin-bottom: 24px;
    background: linear-gradient(135deg, rgba(64, 47, 181, 0.1), rgba(207, 48, 170, 0.1));
    border-radius: 12px;
    border: 1px solid rgba(207, 48, 170, 0.3);

    h3 {
      font-family: 'Space Grotesk', sans-serif;
      color: #ffffff;
      margin-top: 12px;
      font-size: 18px;
      font-weight: 700;
    }
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
    padding: 14px 20px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 12px;
    color: #b6a9b7;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(207, 48, 170, 0.1);
      color: #dfa2da;
    }

    &.active {
      background: linear-gradient(135deg, rgba(64, 47, 181, 0.2), rgba(207, 48, 170, 0.2));
      color: #dfa2da;
      border-color: rgba(207, 48, 170, 0.3);
    }
  }

  .nav-item-icon {
    font-size: 24px;
  }

  .main-content {
    background: rgba(16, 15, 28, 0.6);
    border-radius: 16px;
    border: 1px solid rgba(160, 153, 216, 0.2);
    padding: 32px;
  }

  .page-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #ffffff, #dfa2da);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .analytics-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: rgba(16, 15, 28, 0.8) !important;
    border: 1px solid rgba(160, 153, 216, 0.2) !important;
    border-radius: 12px !important;

    .MuiCardContent-root {
      text-align: center;
    }

    .stat-icon {
      margin-bottom: 12px;
    }

    h3 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 36px;
      font-weight: 700;
      color: #ffffff;
      margin: 8px 0;
    }

    p {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      color: #a099d8;
      margin: 4px 0;
    }

    small {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12px;
      color: #b6a9b7;
    }
  }

  .search-section {
    margin-bottom: 24px;
  }

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }

  .post-card {
    background: rgba(16, 15, 28, 0.8) !important;
    border: 1px solid rgba(160, 153, 216, 0.2) !important;
    border-radius: 12px !important;

    .post-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      h4 {
        font-family: 'Space Grotesk', sans-serif;
        color: #ffffff;
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }

      p {
        font-family: 'Space Grotesk', sans-serif;
        color: #b6a9b7;
        margin: 0;
        font-size: 12px;
      }
    }

    .post-content {
      font-family: 'Space Grotesk', sans-serif;
      color: #ffffff;
      margin-bottom: 12px;
      font-size: 14px;
      line-height: 1.5;
    }

    .post-image {
      width: 100%;
      border-radius: 8px;
      margin-bottom: 12px;
      max-height: 200px;
      object-fit: cover;
    }

    .post-stats {
      display: flex;
      gap: 16px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      color: #a099d8;
    }
  }

  .trending-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .trending-card {
    background: rgba(16, 15, 28, 0.8) !important;
    border: 1px solid rgba(160, 153, 216, 0.2) !important;
    border-radius: 12px !important;

    h4 {
      font-family: 'Space Grotesk', sans-serif;
      color: #ffffff;
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }

    p {
      font-family: 'Space Grotesk', sans-serif;
      color: #b6a9b7;
      margin: 0 0 12px 0;
      font-size: 14px;
    }

    .rank-badge {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #402fb5, #cf30aa);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 18px;
      font-weight: 700;
    }

    .engagement-stats {
      display: flex;
      gap: 12px;
      align-items: center;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      color: #a099d8;
    }
  }

  @media (max-width: 1024px) {
    .main-container {
      grid-template-columns: 1fr;
    }

    .left-sidebar {
      position: static;
    }
  }
`;

export default AdminOverviewPage;

