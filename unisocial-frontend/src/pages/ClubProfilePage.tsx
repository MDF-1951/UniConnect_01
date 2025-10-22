import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import apiService from '../services/api';
import { Club, ClubMembership, Post, CreatePostRequest, Event } from '../types';
import CreatePostModal from '../components/CreatePostModal';
import CommentModal from '../components/CommentModal';
import CreateEventModal from '../components/CreateEventModal';
import EventDetailModal from '../components/EventDetailModal';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Menu,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Event as EventIcon,
  Groups as GroupsIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Add as AddIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  PhotoCamera as PhotoCameraIcon,
  Cancel as CancelIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const ClubProfilePage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMembership[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showMembersTable, setShowMembersTable] = useState(false);
  const [memberFilter, setMemberFilter] = useState<'ALL' | 'ADMIN' | 'MEMBER' | 'PENDING' | 'REJECTED'>('ALL');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{ id: number; author: string } | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    logoUrl: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (clubId) {
      loadClubData();
    }
  }, [clubId]);

  const loadClubData = async () => {
    try {
      setLoading(true);
      const clubData = await apiService.getClubById(Number(clubId));
      setClub(clubData);
      setEditForm({
        name: clubData.name,
        description: clubData.description || '',
        logoUrl: clubData.logoUrl || ''
      });

      // Load members
      const membersData = await apiService.getClubMembers(Number(clubId));
      setMembers(membersData);

      // Load club posts
      await loadClubPosts();

      // Load club events
      await loadClubEvents();
    } catch (error) {
      console.error('Error loading club data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClubEvents = async () => {
    try {
      const eventsData = await apiService.getClubEvents(Number(clubId));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading club events:', error);
    }
  };

  const loadClubPosts = async () => {
    try {
      // For now, get all posts and filter by authorType and authorId
      const feedPosts = await apiService.getPostsFeed();
      const clubPosts = feedPosts.filter(
        post => post.authorType === 'CLUB' && post.authorId === Number(clubId)
      );

      // Fetch likes and comments for each post
      const postsWithStats = await Promise.all(
        clubPosts.map(async (post) => {
          try {
            const [likesData, comments] = await Promise.all([
              apiService.getPostLikes(post.postId),
              apiService.getPostComments(post.postId)
            ]);

            return {
              ...post,
              likeCount: likesData.totalLikes,
              commentCount: comments.length,
              likedByCurrentUser: likesData.likedByCurrentUser
            };
          } catch (error) {
            console.error(`Error fetching stats for post ${post.postId}:`, error);
            return {
              ...post,
              likeCount: 0,
              commentCount: 0,
              likedByCurrentUser: false
            };
          }
        })
      );

      setPosts(postsWithStats);
    } catch (error) {
      console.error('Error loading club posts:', error);
    }
  };

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

  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
    // Set current logo as preview
    if (club?.logoUrl) {
      setLogoPreview(getMediaUrl(club.logoUrl) || null);
    }
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleUpdateClub = async () => {
    if (!editForm.name.trim()) {
      alert('Club name is required');
      return;
    }

    try {
      setUploadingLogo(true);
      let logoUrl = editForm.logoUrl;

      // Upload new logo if selected
      if (logoFile) {
        const uploadResponse = await apiService.uploadImage(logoFile);
        logoUrl = uploadResponse.url;
      }

      const updatedClub = await apiService.updateClub(Number(clubId), {
        name: editForm.name,
        description: editForm.description,
        logoUrl: logoUrl
      });
      
      setClub(updatedClub);
      handleCloseEditDialog();
    } catch (error: any) {
      console.error('Error updating club:', error);
      alert(`Failed to update club: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleMemberClick = (userId: number, event?: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if (event && (event.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/profile/${userId}`);
  };

  const handleApproveMember = async (membershipId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await apiService.approveMembership(membershipId);
      // Reload members
      const membersData = await apiService.getClubMembers(Number(clubId));
      setMembers(membersData);
      // Reload club data to update member count
      await loadClubData();
    } catch (error: any) {
      console.error('Error approving member:', error);
      alert(`Failed to approve member: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleRejectMember = async (membershipId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to reject this membership request?')) {
      return;
    }
    try {
      await apiService.rejectMembership(membershipId);
      // Reload members
      const membersData = await apiService.getClubMembers(Number(clubId));
      setMembers(membersData);
    } catch (error: any) {
      console.error('Error rejecting member:', error);
      alert(`Failed to reject member: ${error.response?.data?.error || error.message}`);
    }
  };

  const handlePromoteMember = async (membershipId: number, memberName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm(`Are you sure you want to promote ${memberName} to admin?`)) {
      return;
    }
    try {
      await apiService.promoteMember(membershipId);
      // Reload members
      const membersData = await apiService.getClubMembers(Number(clubId));
      setMembers(membersData);
      // Reload club data
      await loadClubData();
    } catch (error: any) {
      console.error('Error promoting member:', error);
      alert(`Failed to promote member: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDemoteMember = async (membershipId: number, memberName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm(`Are you sure you want to demote ${memberName} to member?`)) {
      return;
    }
    try {
      await apiService.demoteMember(membershipId);
      // Reload members
      const membersData = await apiService.getClubMembers(Number(clubId));
      setMembers(membersData);
      // Reload club data
      await loadClubData();
    } catch (error: any) {
      console.error('Error demoting admin:', error);
      alert(`Failed to demote admin: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleRemoveMember = async (userId: number, memberName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the club?`)) {
      return;
    }
    try {
      await apiService.removeMember(Number(clubId), userId);
      // Reload members
      const membersData = await apiService.getClubMembers(Number(clubId));
      setMembers(membersData);
      // Reload club data to update member count
      await loadClubData();
    } catch (error: any) {
      console.error('Error removing member:', error);
      alert(`Failed to remove member: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDeleteEvent = async (eventId: number, eventTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      return;
    }
    try {
      await apiService.deleteEvent(eventId);
      await loadClubEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert(`Failed to delete event: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };

  const getFilteredMembers = () => {
    if (memberFilter === 'ALL') {
      // Sort: Admins first, then by status (APPROVED, PENDING, REJECTED)
      return [...members].sort((a, b) => {
        if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
        if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
        return 0;
      });
    }
    
    if (memberFilter === 'ADMIN') {
      return members.filter(m => m.role === 'ADMIN');
    }
    
    if (memberFilter === 'MEMBER') {
      return members.filter(m => m.role === 'MEMBER' && m.status === 'APPROVED');
    }
    
    if (memberFilter === 'PENDING') {
      return members.filter(m => m.status === 'PENDING');
    }
    
    if (memberFilter === 'REJECTED') {
      return members.filter(m => m.status === 'REJECTED');
    }
    
    return members;
  };

  const handleLikePost = async (postId: number) => {
    const post = posts.find(p => p.postId === postId);
    if (!post) return;

    try {
      if (post.likedByCurrentUser) {
        await apiService.unlikePost(postId);
      } else {
        await apiService.likePost(postId);
      }

      // Reload posts to get updated counts
      await loadClubPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentClick = (postId: number, postAuthor: string) => {
    setSelectedPost({ id: postId, author: postAuthor });
    setIsCommentModalOpen(true);
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await apiService.deletePost(postId);
      await loadClubPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handlePostCreated = async () => {
    await loadClubPosts();
    setIsCreatePostOpen(false);
  };

  const getMediaUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url}`;
  };

  if (loading) {
    return (
      <StyledContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress style={{ color: '#cf30aa' }} />
        </div>
      </StyledContainer>
    );
  }

  if (!club) {
    return (
      <StyledContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p style={{ color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>Club not found</p>
        </div>
      </StyledContainer>
    );
  }

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
            <button className="nav-item" onClick={() => navigate('/profile')}>
              <PersonIcon className="nav-item-icon" />
              <span>Profile</span>
            </button>
            <button className="nav-item active" onClick={() => navigate('/clubs')}>
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
          {/* Club Header */}
          <div className="club-header">
            {club.logoUrl && (
              <div className="club-logo-container">
                <Avatar
                  src={getMediaUrl(club.logoUrl)}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid #cf30aa',
                    fontSize: '48px',
                    fontWeight: 'bold'
                  }}
                >
                  {club.name.charAt(0).toUpperCase()}
                </Avatar>
              </div>
            )}
            <div className="club-info">
              <h1 className="club-title">{club.name}</h1>
              <p className="club-description">{club.description || 'No description available'}</p>
              <div className="club-stats">
                <span>{members.filter(m => m.status === 'APPROVED').length} Members</span>
                <span>•</span>
                <span>{posts.length} Posts</span>
              </div>
            </div>
            <IconButton
              onClick={handleOpenEditDialog}
              sx={{
                color: '#b6a9b7',
                background: 'rgba(160, 153, 216, 0.1)',
                '&:hover': { background: 'rgba(160, 153, 216, 0.2)' }
              }}
            >
              <EditIcon />
            </IconButton>
          </div>

          {/* Members Section Toggle */}
          <div className="section-header">
            <Button
              variant={showMembersTable ? 'contained' : 'outlined'}
              onClick={() => setShowMembersTable(!showMembersTable)}
              sx={{
                background: showMembersTable ? 'linear-gradient(135deg, #402fb5, #cf30aa)' : 'transparent',
                border: '1.5px solid rgba(160, 153, 216, 0.3)',
                color: showMembersTable ? 'white' : '#b6a9b7',
                borderRadius: '8px',
                padding: '10px 24px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  background: showMembersTable ? 'linear-gradient(135deg, #cf30aa, #dfa2da)' : 'rgba(160, 153, 216, 0.1)',
                  borderColor: '#a099d8',
                }
              }}
            >
              {showMembersTable ? 'Hide Members' : 'Show Members'}
            </Button>
          </div>

          {/* Member Filter Tabs */}
          {showMembersTable && (
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              {(['ALL', 'ADMIN', 'MEMBER', 'PENDING', 'REJECTED'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={memberFilter === filter ? 'contained' : 'outlined'}
                  onClick={() => setMemberFilter(filter)}
                  sx={{
                    background: memberFilter === filter 
                      ? 'linear-gradient(135deg, #402fb5, #cf30aa)' 
                      : 'transparent',
                    border: '1.5px solid rgba(160, 153, 216, 0.3)',
                    color: memberFilter === filter ? 'white' : '#b6a9b7',
                    borderRadius: '8px',
                    padding: '6px 16px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    textTransform: 'capitalize',
                    '&:hover': {
                      background: memberFilter === filter 
                        ? 'linear-gradient(135deg, #cf30aa, #dfa2da)' 
                        : 'rgba(160, 153, 216, 0.1)',
                      borderColor: '#a099d8',
                    }
                  }}
                >
                  {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          )}

          {/* Members Table */}
          {showMembersTable && (
            <TableContainer component={Paper} sx={{
              background: 'rgba(16, 15, 28, 0.8)',
              border: '1px solid rgba(160, 153, 216, 0.2)',
              borderRadius: '12px',
              marginBottom: '24px',
              '& .MuiTableCell-root': {
                color: '#ffffff',
                borderColor: 'rgba(160, 153, 216, 0.2)',
                fontFamily: "'Space Grotesk', sans-serif",
              }
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'rgba(160, 153, 216, 0.1)' }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredMembers().map((member) => (
                    <TableRow
                      key={member.membershipId}
                      onClick={(e) => handleMemberClick(member.userId, e)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'rgba(160, 153, 216, 0.1)',
                        }
                      }}
                    >
                      <TableCell>{member.userName}</TableCell>
                      <TableCell>
                        <Chip
                          label={member.role}
                          size="small"
                          sx={{
                            background: member.role === 'ADMIN' 
                              ? 'linear-gradient(135deg, #402fb5, #cf30aa)' 
                              : 'rgba(160, 153, 216, 0.2)',
                            color: 'white',
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.status}
                          size="small"
                          sx={{
                            background: member.status === 'APPROVED' 
                              ? 'rgba(76, 175, 80, 0.2)' 
                              : member.status === 'PENDING'
                              ? 'rgba(255, 193, 7, 0.2)'
                              : 'rgba(244, 67, 54, 0.2)',
                            color: member.status === 'APPROVED'
                              ? '#4caf50'
                              : member.status === 'PENDING'
                              ? '#ffc107'
                              : '#f44336',
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {/* Approve/Reject for PENDING members */}
                          {member.status === 'PENDING' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => handleApproveMember(member.membershipId, e)}
                                sx={{
                                  background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                                  color: 'white',
                                  textTransform: 'none',
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontSize: '12px',
                                  padding: '4px 12px',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #66bb6a, #81c784)',
                                  }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => handleRejectMember(member.membershipId, e)}
                                sx={{
                                  background: 'linear-gradient(135deg, #f44336, #e57373)',
                                  color: 'white',
                                  textTransform: 'none',
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontSize: '12px',
                                  padding: '4px 12px',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #e57373, #ef5350)',
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {/* Promote/Demote buttons for APPROVED members */}
                          {member.status === 'APPROVED' && (
                            <>
                              {member.role === 'MEMBER' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={(e) => handlePromoteMember(member.membershipId, member.userName, e)}
                                  sx={{
                                    background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: '12px',
                                    padding: '4px 12px',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #cf30aa, #dfa2da)',
                                    }
                                  }}
                                >
                                  Promote to Admin
                                </Button>
                              )}
                              {member.role === 'ADMIN' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => handleDemoteMember(member.membershipId, member.userName, e)}
                                  sx={{
                                    border: '1.5px solid rgba(255, 152, 0, 0.5)',
                                    color: '#ff9800',
                                    textTransform: 'none',
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: '12px',
                                    padding: '4px 12px',
                                    '&:hover': {
                                      background: 'rgba(255, 152, 0, 0.1)',
                                      borderColor: '#ff9800',
                                    }
                                  }}
                                >
                                  Demote to Member
                                </Button>
                              )}
                            </>
                          )}
                          
                          {/* Remove button for APPROVED members and admins */}
                          {member.status === 'APPROVED' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => handleRemoveMember(member.userId, member.userName, e)}
                              sx={{
                                border: '1.5px solid rgba(244, 67, 54, 0.5)',
                                color: '#f44336',
                                textTransform: 'none',
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: '12px',
                                padding: '4px 12px',
                                '&:hover': {
                                  background: 'rgba(244, 67, 54, 0.1)',
                                  borderColor: '#f44336',
                                }
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Events Section */}
          <div className="section-header" style={{ marginTop: '32px' }}>
            <h2 className="section-title">Club Events</h2>
            <Button
              variant="contained"
              onClick={() => setIsCreateEventOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
                color: 'white',
                borderRadius: '8px',
                padding: '10px 24px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #cf30aa, #dfa2da)',
                }
              }}
            >
              + Create Event
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            {events.length === 0 ? (
              <div className="empty-state">
                <p>No events yet. Create the first event!</p>
              </div>
            ) : (
              events.map((event) => (
                <Card
                  key={event.eventId}
                  sx={{
                    background: 'rgba(16, 15, 28, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid rgba(160, 153, 216, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#cf30aa',
                      boxShadow: '0 4px 12px rgba(207, 48, 170, 0.2)',
                    }
                  }}
                >
                  <CardContent onClick={() => handleEventClick(event)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#ffffff',
                          marginTop: 0,
                          marginBottom: '8px',
                        }}>
                          {event.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                          <span style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '14px',
                            color: '#a099d8',
                          }}>
                            📅 {new Date(event.startTime).toLocaleDateString()}
                          </span>
                          <span style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '14px',
                            color: '#a099d8',
                          }}>
                            📍 {event.location}
                          </span>
                          {event.odProvided && (
                            <Chip
                              label="OD Provided"
                              size="small"
                              sx={{
                                background: 'rgba(76, 175, 80, 0.2)',
                                color: '#4caf50',
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontSize: '12px',
                              }}
                            />
                          )}
                        </div>
                        <p style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: '14px',
                          color: '#b6a9b7',
                          marginTop: '8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {event.description}
                        </p>
                      </div>
                      <IconButton
                        onClick={(e) => handleDeleteEvent(event.eventId, event.title, e)}
                        sx={{
                          color: '#b6a9b7',
                          '&:hover': {
                            color: '#f44336',
                            background: 'rgba(244, 67, 54, 0.1)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Posts Section */}
          <div className="section-header" style={{ marginTop: '32px' }}>
            <h2 className="section-title">Club Posts</h2>
          </div>

          <div className="posts-feed">
            {posts.length === 0 ? (
              <div className="empty-state">
                <p>No posts yet. Create the first post!</p>
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post.postId} className="post-card">
                  <CardContent>
                    {/* Post Header */}
                    <div className="post-header">
                      <Avatar
                        src={post.authorDpUrl ? getMediaUrl(post.authorDpUrl) : undefined}
                        sx={{ width: 48, height: 48 }}
                      >
                        {post.authorName.charAt(0).toUpperCase()}
                      </Avatar>
                      <div className="post-author-info">
                        <h4 className="post-author">{post.authorName}</h4>
                        <p className="post-time">{new Date(post.createdAt).toLocaleString()}</p>
                      </div>
                      <IconButton
                        onClick={() => handleDeletePost(post.postId)}
                        sx={{ marginLeft: 'auto', color: '#b6a9b7' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>

                    {/* Post Content */}
                    <p className="post-content">{post.contentText}</p>

                    {/* Post Media */}
                    {post.mediaUrl && (
                      <div className="post-media">
                        {post.mediaType === 'IMAGE' ? (
                          <img src={getMediaUrl(post.mediaUrl)} alt="Post content" />
                        ) : post.mediaType === 'VIDEO' ? (
                          <video controls>
                            <source src={getMediaUrl(post.mediaUrl)} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : null}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="post-actions">
                      <Button
                        startIcon={post.likedByCurrentUser ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                        onClick={() => handleLikePost(post.postId)}
                        sx={{
                          color: post.likedByCurrentUser ? '#cf30aa' : '#b6a9b7',
                          textTransform: 'none',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {post.likeCount} {post.likeCount === 1 ? 'Like' : 'Likes'}
                      </Button>
                      <Button
                        startIcon={<CommentIcon />}
                        onClick={() => handleCommentClick(post.postId, post.authorName)}
                        sx={{
                          color: '#b6a9b7',
                          textTransform: 'none',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Button for Create Post */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setIsCreatePostOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
          '&:hover': {
            background: 'linear-gradient(135deg, #cf30aa, #dfa2da)',
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Edit Club Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
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
            Edit Club
          </h2>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 3 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
              
              {/* Logo Preview */}
              {logoPreview && (
                <div style={{ 
                  position: 'relative', 
                  marginBottom: '16px',
                  width: '150px',
                  height: '150px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid rgba(160, 153, 216, 0.3)'
                }}>
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }} 
                  />
                  <IconButton
                    onClick={handleRemoveLogo}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        background: 'rgba(207, 48, 170, 0.8)',
                      }
                    }}
                  >
                    <CancelIcon />
                  </IconButton>
                </div>
              )}
              
              {/* Upload Button */}
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="logo-upload-button"
                type="file"
                onChange={handleLogoSelect}
              />
              <label htmlFor="logo-upload-button">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                  sx={{
                    border: '1.5px solid rgba(160, 153, 216, 0.3)',
                    color: '#b6a9b7',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'rgba(160, 153, 216, 0.1)',
                      borderColor: '#a099d8',
                    }
                  }}
                >
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </Button>
              </label>
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          pt: 2,
          borderTop: '1px solid rgba(160, 153, 216, 0.15)',
        }}>
          <Button
            onClick={handleCloseEditDialog}
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
            Cancel
          </Button>
          <Button
            onClick={handleUpdateClub}
            disabled={uploadingLogo}
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
              '&:disabled': {
                opacity: 0.6,
                color: 'white'
              }
            }}
          >
            {uploadingLogo ? (
              <>
                <CircularProgress size={20} style={{ color: 'white', marginRight: 8 }} />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Post Modal */}
      {isCreatePostOpen && (
        <CreatePostModal
          open={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          onPostCreated={handlePostCreated}
          clubId={Number(clubId)}
        />
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        open={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        clubId={Number(clubId)}
        onEventCreated={loadClubEvents}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        open={isEventDetailOpen}
        onClose={() => setIsEventDetailOpen(false)}
        event={selectedEvent}
      />

      {/* Comment Modal */}
      {isCommentModalOpen && selectedPost && (
        <CommentModal
          open={isCommentModalOpen}
          onClose={() => {
            setIsCommentModalOpen(false);
            setSelectedPost(null);
          }}
          postId={selectedPost.id}
          postAuthor={selectedPost.author}
        />
      )}
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

  .club-header {
    display: flex;
    align-items: flex-start;
    gap: 24px;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(160, 153, 216, 0.2);
  }

  .club-logo-container {
    flex-shrink: 0;
  }

  .club-info {
    flex: 1;
  }

  .club-title {
    font-family: 'Playlist Script', cursive;
    font-size: 42px;
    background: linear-gradient(135deg, #a099d8 0%, #cf30aa 50%, #dfa2da 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 12px 0;
  }

  .club-description {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    color: #b6a9b7;
    margin: 0 0 12px 0;
  }

  .club-stats {
    display: flex;
    gap: 12px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #8a8494;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .section-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
  }

  .posts-feed {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .post-card {
    background: rgba(16, 15, 28, 0.8) !important;
    border: 1px solid rgba(160, 153, 216, 0.2) !important;
    border-radius: 16px !important;
  }

  .post-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .post-author-info {
    flex: 1;
  }

  .post-author {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }

  .post-time {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #8a8494;
    margin: 4px 0 0 0;
  }

  .post-content {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    color: #e0e0e0;
    line-height: 1.6;
    margin: 0 0 16px 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .post-media {
    margin: 16px 0;
    border-radius: 12px;
    overflow: hidden;

    img, video {
      width: 100%;
      max-height: 500px;
      object-fit: cover;
      display: block;
    }
  }

  .post-actions {
    display: flex;
    gap: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(160, 153, 216, 0.2);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;

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

export default ClubProfilePage;
