import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import apiService from '../services/api';
import { User, Post, ClubMembership } from '../types';
import CommentModal from '../components/CommentModal';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  InputBase,
  Menu,
  MenuItem,
  Badge,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import StayHardLoader from '../components/StayHardLoader';
import {
  Search as SearchIcon,
  Chat as ChatIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Groups as GroupsIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Image as ImageIcon,
  Message as MessageIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userClubs, setUserClubs] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{ id: number; author: string } | null>(null);
  const [editForm, setEditForm] = useState({ name: '', bio: '', dpUrl: '' });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [postMenuAnchor, setPostMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});

  const isOwnProfile = !userId || userId === currentUser?.userId?.toString();
  const targetUserId = userId ? parseInt(userId) : currentUser?.userId;

  useEffect(() => {
    if (targetUserId) {
      loadProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const userData = isOwnProfile 
        ? await apiService.getCurrentUser()
        : await apiService.getUserById(targetUserId!);
      setProfileUser(userData);

      // Set edit form with current data
      setEditForm({
        name: userData.name || '',
        bio: userData.bio || '',
        dpUrl: userData.dpUrl || ''
      });

      // Load user posts and clubs in parallel
      await Promise.all([
        loadUserPosts(),
        loadUserClubs()
      ]);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    if (!targetUserId) return;
    
    try {
      setPostsLoading(true);
      const posts = await apiService.getUserPosts(targetUserId);
      
      // Fetch likes and comments for each post
      const postsWithStats = await Promise.all(
        posts.map(async (post) => {
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
      
      // Sort posts by createdAt descending (newest first)
      const sortedPosts = postsWithStats.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setUserPosts(sortedPosts);
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadUserClubs = async () => {
    if (!targetUserId) return;
    
    try {
      setClubsLoading(true);
      // Load ALL memberships (including PENDING and REJECTED) to show full club history
      const clubs = await apiService.getAllUserMemberships(targetUserId);
      // Sort: APPROVED first, then PENDING, then REJECTED
      const sortedClubs = clubs.sort((a, b) => {
        const statusOrder = { 'APPROVED': 0, 'PENDING': 1, 'REJECTED': 2 };
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      });
      setUserClubs(sortedClubs);
    } catch (error) {
      console.error('Error loading user clubs:', error);
    } finally {
      setClubsLoading(false);
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

  const handlePostMenuOpen = (postId: number, event: React.MouseEvent<HTMLElement>) => {
    setPostMenuAnchor({ ...postMenuAnchor, [postId]: event.currentTarget });
  };

  const handlePostMenuClose = (postId: number) => {
    setPostMenuAnchor({ ...postMenuAnchor, [postId]: null });
  };

  const handleDeletePost = async (postId: number) => {
    try {
      handlePostMenuClose(postId);
      
      // Delete the post
      await apiService.deletePost(postId);
      
      // Update local state
      setUserPosts(prevPosts => prevPosts.filter(p => p.postId !== postId));
      
      // Show success message
      setSnackbarMessage('Post deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      setSnackbarMessage(`Failed to delete post: ${error.response?.data?.error || error.message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      const post = userPosts.find(p => p.postId === postId);
      if (!post) return;

      // Optimistically update the UI first
      setUserPosts(prevPosts => 
        prevPosts.map(p => 
          p.postId === postId 
            ? { 
                ...p, 
                likedByCurrentUser: !p.likedByCurrentUser,
                likeCount: p.likedByCurrentUser ? p.likeCount - 1 : p.likeCount + 1
              }
            : p
        )
      );

      // Then make the API call
      const response = post.likedByCurrentUser 
        ? await apiService.unlikePost(postId)
        : await apiService.likePost(postId);

      // Update with actual response
      setUserPosts(prevPosts =>
        prevPosts.map(p =>
          p.postId === postId
            ? {
                ...p,
                likedByCurrentUser: response.likedByCurrentUser,
                likeCount: response.totalLikes
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert the optimistic update on error
      loadUserPosts();
    }
  };

  const handleOpenCommentModal = (postId: number, postAuthor: string) => {
    setSelectedPost({ id: postId, author: postAuthor });
    setIsCommentModalOpen(true);
  };

  const handleCloseCommentModal = () => {
    setIsCommentModalOpen(false);
    setSelectedPost(null);
  };

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const handleSearch = async (query: string) => {
    try {
      setIsSearching(true);
      const results = await apiService.searchUsers(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (selectedUserId: number) => {
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/profile/${selectedUserId}`);
  };

  const handleMessageUser = async () => {
    if (!profileUser || !currentUser) return;
    
    try {
      // Create or get existing private chat
      const chatRoom = await apiService.startPrivateChat(profileUser.userId);
      
      // Navigate to chat page with the chat room
      navigate('/chat', { state: { selectedChatRoomId: chatRoom.chatRoomId } });
    } catch (error: any) {
      console.error('Error starting chat:', error);
      setSnackbarMessage(`Failed to start chat: ${error.response?.data?.error || error.message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsUploadingProfilePicture(true);
      let finalDpUrl = profileUser?.dpUrl || '';
      
      // Upload profile picture if a new file is selected
      if (profilePictureFile) {
        try {
          console.log('Uploading profile picture...');
          const uploadResponse = await apiService.uploadProfilePicture(profilePictureFile);
          console.log('Upload response:', uploadResponse);
          finalDpUrl = uploadResponse.url;
        } catch (error: any) {
          console.error('Error uploading profile picture:', error);
          alert(`Failed to upload profile picture: ${error.response?.data?.error || error.message || 'Unknown error'}`);
          setIsUploadingProfilePicture(false);
          return;
        }
      }
      
      const updateData = {
        name: editForm.name,
        bio: editForm.bio,
        dpUrl: finalDpUrl
      };
      
      console.log('Updating profile with data:', updateData);
      console.log('Current auth token:', localStorage.getItem('token'));
      
      const updatedUser = await apiService.updateCurrentUser(updateData);
      console.log('Updated user:', updatedUser);
      
      setProfileUser(updatedUser);
      setIsEditDialogOpen(false);
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      setIsUploadingProfilePicture(false);
      
      // Show success message
      setSnackbarMessage('Profile updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.response);
      setSnackbarMessage(`Failed to update profile: ${error.response?.data?.error || error.message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsUploadingProfilePicture(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: profileUser?.name || '',
      bio: profileUser?.bio || '',
      dpUrl: profileUser?.dpUrl || ''
    });
    setIsEditDialogOpen(false);
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
  };

  const handleProfilePictureSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
    if (document.getElementById('profile-picture-input')) {
      (document.getElementById('profile-picture-input') as HTMLInputElement).value = '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <StyledWrapper>
        <StayHardLoader />
      </StyledWrapper>
    );
  }

  if (!profileUser) {
    return (
      <StyledWrapper>
        <div className="error-container">
          <h3>User not found</h3>
          <p>The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')} variant="contained">
            Go to Dashboard
          </Button>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      {/* Top Navigation Bar */}
      <AppBar position="fixed" className="top-navbar">
        <Toolbar className="toolbar">
          {/* Logo */}
          <div className="nav-logo" onClick={() => navigate('/dashboard')}>
            <span className="logo-text">Uni<span className="lowercase">connect</span></span>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <SearchIcon className="search-icon" />
              <InputBase
                placeholder="Search users by name or reg number..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              />
              {isSearching && (
                <span style={{ color: '#cf30aa', marginRight: '12px', fontSize: '12px' }}>Searching...</span>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <>
                <div className="search-backdrop" onClick={() => setShowSearchResults(false)} />
                <div className="search-results">
                  {searchResults.map((result) => (
                    <div
                      key={result.userId}
                      className="search-result-item"
                      onClick={() => handleUserSelect(result.userId)}
                    >
                      <Avatar
                        src={result.dpUrl ? (result.dpUrl.startsWith('http') ? result.dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${result.dpUrl}`) : undefined}
                        sx={{ width: 40, height: 40, marginRight: '12px' }}
                      >
                        {result.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <div className="search-result-info">
                        <div className="search-result-name">{result.name}</div>
                        <div className="search-result-regno">{result.regNo}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {showSearchResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
              <>
                <div className="search-backdrop" onClick={() => setShowSearchResults(false)} />
                <div className="search-results">
                  <div className="search-no-results">
                    No users found for "{searchQuery}"
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="nav-actions">
            <IconButton className="nav-icon-btn" onClick={() => navigate('/dashboard')}>
              <HomeIcon />
            </IconButton>
            <IconButton className="nav-icon-btn" onClick={() => navigate('/chat')}>
              <Badge badgeContent={0} color="error">
                <ChatIcon />
              </Badge>
            </IconButton>
            <IconButton className="nav-icon-btn">
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Avatar
              className="profile-avatar"
              onClick={handleProfileMenuOpen}
              src={currentUser?.dpUrl ? (currentUser.dpUrl.startsWith('http') ? currentUser.dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${currentUser.dpUrl}`) : undefined}
            >
              {currentUser?.name?.charAt(0).toUpperCase()}
            </Avatar>
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
            border: '1px solid rgba(160, 153, 216, 0.2)',
            borderRadius: '8px',
            mt: 1,
          },
        }}
      >
        <MenuItem 
          onClick={() => { navigate('/profile'); handleMenuClose(); }}
          sx={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#ffffff',
            '&:hover': { background: 'rgba(160, 153, 216, 0.1)' },
          }}
        >
          <PersonIcon style={{ marginRight: 12 }} /> My Profile
        </MenuItem>
        <MenuItem 
          onClick={() => { handleMenuClose(); }}
          sx={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#ffffff',
            '&:hover': { background: 'rgba(160, 153, 216, 0.1)' },
          }}
        >
          <SettingsIcon style={{ marginRight: 12 }} /> Settings
        </MenuItem>
        <MenuItem 
          onClick={handleLogout}
          sx={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: '#ffffff',
            '&:hover': { background: 'rgba(244, 67, 54, 0.1)' },
          }}
        >
          <LogoutIcon style={{ marginRight: 12 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Main Container */}
      <div className="main-container">
        
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-section">
            <div className="user-profile-card">
              <Avatar 
                className="user-avatar" 
                src={currentUser?.dpUrl ? (currentUser.dpUrl.startsWith('http') ? currentUser.dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${currentUser.dpUrl}`) : undefined}
              >
                {currentUser?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <h3 className="user-name">{currentUser?.name}</h3>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => navigate('/dashboard')}>
              <HomeIcon className="nav-item-icon" />
              <span>Home</span>
            </button>
            <button className="nav-item active" onClick={() => navigate('/profile')}>
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
            {currentUser?.role === 'ADMIN' && (
              <button className="nav-item" onClick={() => navigate('/admin')}>
                <DashboardIcon className="nav-item-icon" />
                <span>Overview</span>
              </button>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-cover">
              <div className="cover-gradient"></div>
            </div>
            <div className="profile-info">
              <div className="profile-avatar-section">
                <Avatar 
                  className="profile-main-avatar" 
                  src={profileUser.dpUrl ? (profileUser.dpUrl.startsWith('http') ? profileUser.dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${profileUser.dpUrl}`) : undefined}
                >
                  {profileUser.name?.charAt(0).toUpperCase()}
                </Avatar>
                {isOwnProfile ? (
                  <Button
                    className="edit-profile-btn"
                    startIcon={<EditIcon />}
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    className="message-user-btn"
                    startIcon={<MessageIcon />}
                    onClick={handleMessageUser}
                  >
                    Message
                  </Button>
                )}
              </div>
              <div className="profile-details">
                <h1 className="profile-name">{profileUser.name}</h1>
                <p className="profile-regno">{profileUser.regNo}</p>
                <p className="profile-bio">{profileUser.bio || 'No bio available'}</p>
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-number">{userPosts.length}</span>
                    <span className="stat-label">Posts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{userClubs.length}</span>
                    <span className="stat-label">Clubs</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Following</span>
                  </div>
                </div>
                <p className="join-date">Joined {formatJoinDate(profileUser.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="content-tabs">
            <div className="tab-content">
              {/* Posts Section */}
              <div className="posts-section">
                <h2 className="section-title">Posts</h2>
                {postsLoading ? (
                  <StayHardLoader />
                ) : userPosts.length === 0 ? (
                  <div className="empty-section">
                    <h3>No posts yet</h3>
                    <p>{isOwnProfile ? "You haven't posted anything yet." : `${profileUser.name} hasn't posted anything yet.`}</p>
                  </div>
                ) : (
                  <div className="posts-container">
                    {userPosts.map((post) => (
                      <div key={post.postId} className="post-card">
                        <div className="post-header">
                          <Avatar 
                            className="post-avatar"
                            src={post.authorDpUrl ? (post.authorDpUrl.startsWith('http') ? post.authorDpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${post.authorDpUrl}`) : undefined}
                          >
                            {post.authorName?.charAt(0).toUpperCase()}
                          </Avatar>
                          <div className="post-info">
                            <h4 className="post-author">{post.authorName}</h4>
                            <p className="post-time">{formatDate(post.createdAt)}</p>
                          </div>
                          {isOwnProfile && (
                            <>
                              <IconButton
                                onClick={(e) => handlePostMenuOpen(post.postId, e)}
                                size="small"
                                sx={{ marginLeft: 'auto', color: '#b6a9b7' }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                              <Menu
                                anchorEl={postMenuAnchor[post.postId]}
                                open={Boolean(postMenuAnchor[post.postId])}
                                onClose={() => handlePostMenuClose(post.postId)}
                                PaperProps={{
                                  sx: {
                                    background: '#1e1a2e',
                                    border: '1px solid rgba(160, 153, 216, 0.3)',
                                    borderRadius: '8px',
                                  }
                                }}
                              >
                                <MenuItem
                                  onClick={() => handleDeletePost(post.postId)}
                                  sx={{
                                    color: '#ff6b6b',
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    '&:hover': {
                                      background: 'rgba(255, 107, 107, 0.1)',
                                    }
                                  }}
                                >
                                  <DeleteIcon sx={{ marginRight: '12px', fontSize: '20px' }} />
                                  Delete Post
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </div>

                        <div className="post-content">
                          {/* Display media first */}
                          {(post.mediaUrl || post.contentImage) && (
                            <>
                              {(post.mediaType === 'IMAGE' || (!post.mediaType && post.contentImage)) && (
                                <img 
                                  src={post.mediaUrl ? `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${post.mediaUrl}` : post.contentImage} 
                                  alt="Post" 
                                  className="post-image"
                                />
                              )}
                              {(post.mediaType === 'VIDEO' || post.mediaType === 'REEL') && (
                                <video 
                                  src={post.mediaUrl ? `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${post.mediaUrl}` : post.mediaUrl} 
                                  controls 
                                  className="post-video"
                                  playsInline
                                  loop
                                  muted
                                />
                              )}
                            </>
                          )}
                          
                          {/* Display description after media */}
                          {post.contentText && post.contentText.trim() && (
                            <p className="post-text">{post.contentText}</p>
                          )}
                        </div>

                        <div className="post-stats">
                          <span className="stat-item">{post.likeCount} likes</span>
                          <span className="stat-item">{post.commentCount} comments</span>
                        </div>

                        <div className="post-actions">
                          <button 
                            className={`action-btn like-btn ${post.likedByCurrentUser ? 'liked' : ''}`}
                            onClick={() => handleLikePost(post.postId)}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Like</span>
                          </button>
                          <button 
                            className="action-btn"
                            onClick={() => handleOpenCommentModal(post.postId, post.authorName)}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Comment</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clubs Section */}
              <div className="clubs-section">
                <h2 className="section-title">Clubs</h2>
                {clubsLoading ? (
                  <StayHardLoader />
                ) : userClubs.length === 0 ? (
                  <div className="empty-section">
                    <h3>No clubs yet</h3>
                    <p>{isOwnProfile ? "You haven't joined any clubs yet." : `${profileUser.name} hasn't joined any clubs yet.`}</p>
                  </div>
                ) : (
                  <div className="clubs-container">
                    {userClubs.map((membership) => (
                      <div 
                        key={membership.membershipId} 
                        className="club-card"
                        onClick={() => {
                          // Navigate based on role and status
                          if (membership.role === 'ADMIN' && membership.status === 'APPROVED') {
                            navigate(`/club-profile/${membership.clubId}`);
                          } else if (membership.status === 'APPROVED') {
                            navigate(`/club-view/${membership.clubId}`);
                          }
                          // Don't navigate if pending or rejected
                        }}
                        style={{
                          cursor: membership.status === 'APPROVED' ? 'pointer' : 'default',
                          opacity: membership.status === 'APPROVED' ? 1 : 0.7
                        }}
                      >
                        <div className="club-info">
                          <h3 className="club-name">{membership.clubName}</h3>
                          <div className="club-meta">
                            <Chip 
                              label={membership.role} 
                              size="small" 
                              className={`role-chip ${membership.role.toLowerCase()}`}
                            />
                            <Chip 
                              label={membership.clubVerified ? 'VERIFIED' : 'PENDING APPROVAL'} 
                              size="small" 
                              sx={{
                                marginLeft: '8px',
                                background: membership.clubVerified 
                                  ? 'rgba(76, 175, 80, 0.2)' 
                                  : 'rgba(255, 193, 7, 0.2)',
                                color: membership.clubVerified
                                  ? '#4caf50'
                                  : '#ffc107',
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontWeight: 500,
                              }}
                            />
                            {membership.status !== 'APPROVED' && (
                              <Chip 
                                label={`Membership: ${membership.status}`} 
                                size="small" 
                                sx={{
                                  marginLeft: '8px',
                                  background: membership.status === 'PENDING'
                                    ? 'rgba(255, 193, 7, 0.2)'
                                    : 'rgba(244, 67, 54, 0.2)',
                                  color: membership.status === 'PENDING'
                                    ? '#ffc107'
                                    : '#f44336',
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontWeight: 500,
                                }}
                              />
                            )}
                            <span className="join-date">Joined {formatJoinDate(membership.joinedAt)}</span>
                          </div>
                        </div>
                        {membership.status === 'APPROVED' && (
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (membership.role === 'ADMIN') {
                                navigate(`/club-profile/${membership.clubId}`);
                              } else {
                                navigate(`/club-view/${membership.clubId}`);
                              }
                            }}
                          >
                            {membership.role === 'ADMIN' ? 'Manage Club' : 'View Club'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          {/* Quick Actions */}
          {isOwnProfile && (
            <div className="sidebar-card">
              <div className="card-header">
                <SettingsIcon className="header-icon" />
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<EditIcon />}
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<GroupsIcon />}
                  onClick={() => navigate('/clubs')}
                >
                  Browse Clubs
                </Button>
              </div>
            </div>
          )}

          {/* Profile Stats */}
          <div className="sidebar-card">
            <div className="card-header">
              <PersonIcon className="header-icon" />
              <h3>Profile Stats</h3>
            </div>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Posts</span>
                <span className="stat-value">{userPosts.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Clubs</span>
                <span className="stat-value">{userClubs.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">{new Date(profileUser.createdAt).getFullYear()}</span>
              </div>
            </div>
          </div>

          {/* User's Clubs */}
          {userClubs.length > 0 && (
            <div className="sidebar-card">
              <div className="card-header">
                <GroupsIcon className="header-icon" />
                <h3>{isOwnProfile ? 'My Clubs' : 'Clubs'}</h3>
              </div>
              <div className="clubs-list">
                {userClubs.slice(0, 5).map((membership) => (
                  <div 
                    key={membership.membershipId} 
                    className="club-item"
                    onClick={() => {
                      // Navigate based on role and status
                      if (membership.role === 'ADMIN' && membership.status === 'APPROVED') {
                        navigate(`/club-profile/${membership.clubId}`);
                      } else if (membership.status === 'APPROVED') {
                        navigate(`/club-view/${membership.clubId}`);
                      }
                      // Don't navigate if pending or rejected
                    }}
                    style={{
                      cursor: membership.status === 'APPROVED' ? 'pointer' : 'default',
                      opacity: membership.status === 'APPROVED' ? 1 : 0.6
                    }}
                  >
                    <div className="club-item-content">
                      <div className="club-name">{membership.clubName}</div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <Chip 
                          label={membership.role}
                          size="small"
                          sx={{
                            backgroundColor: membership.role === 'ADMIN' ? 'rgba(207, 48, 170, 0.2)' : 'rgba(160, 153, 216, 0.2)',
                            color: membership.role === 'ADMIN' ? '#dfa2da' : '#a099d8',
                            fontSize: '11px',
                            height: '20px',
                            fontWeight: 600
                          }}
                        />
                        <Chip 
                          label={membership.clubVerified ? '✓' : '⏳'}
                          size="small"
                          title={membership.clubVerified ? 'Club Verified' : 'Club Pending Approval'}
                          sx={{
                            backgroundColor: membership.clubVerified 
                              ? 'rgba(76, 175, 80, 0.2)' 
                              : 'rgba(255, 193, 7, 0.2)',
                            color: membership.clubVerified
                              ? '#4caf50'
                              : '#ffc107',
                            fontSize: '10px',
                            height: '18px',
                            fontWeight: 600,
                            minWidth: '24px'
                          }}
                        />
                        {membership.status !== 'APPROVED' && (
                          <Chip 
                            label={membership.status === 'PENDING' ? 'Pending' : 'Rejected'}
                            size="small"
                            sx={{
                              backgroundColor: membership.status === 'PENDING'
                                ? 'rgba(255, 193, 7, 0.2)'
                                : 'rgba(244, 67, 54, 0.2)',
                              color: membership.status === 'PENDING'
                                ? '#ffc107'
                                : '#f44336',
                              fontSize: '10px',
                              height: '18px',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {userClubs.length > 5 && (
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => {
                      const clubsSection = document.querySelector('.clubs-section');
                      clubsSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    sx={{
                      marginTop: '8px',
                      color: '#cf30aa',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(207, 48, 170, 0.1)'
                      }
                    }}
                  >
                    View all {userClubs.length} clubs
                  </Button>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={handleCancelEdit}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{
                margin: 0,
                fontFamily: "'Playlist Script', cursive",
                fontSize: '28px',
                background: 'linear-gradient(135deg, #a099d8 0%, #cf30aa 50%, #dfa2da 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Edit Profile
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '13px',
                color: '#8a8494'
              }}>
                Update your profile information
              </p>
            </div>
            <IconButton
              onClick={handleCancelEdit}
              sx={{
                color: '#b6a9b7',
                '&:hover': {
                  color: '#cf30aa',
                  background: 'rgba(207, 48, 170, 0.1)',
                }
              }}
            >
              <CancelIcon />
            </IconButton>
          </div>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, pt: 3 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Name Field */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '8px'
              }}>
                Display Name
              </label>
              <TextField
                fullWidth
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter your display name"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    '& fieldset': {
                      borderColor: 'rgba(160, 153, 216, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(160, 153, 216, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#cf30aa',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#ffffff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '15px',
                    padding: '12px 14px',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#6b6878',
                    opacity: 1,
                  },
                }}
              />
            </div>

            {/* Bio Field */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '8px'
              }}>
                Bio
              </label>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    '& fieldset': {
                      borderColor: 'rgba(160, 153, 216, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(160, 153, 216, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#cf30aa',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: '#ffffff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '15px',
                    padding: '12px 14px',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#6b6878',
                    opacity: 1,
                  },
                }}
              />
            </div>

            {/* Profile Picture Field */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '12px'
              }}>
                Profile Picture
              </label>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(160, 153, 216, 0.15)',
                borderRadius: '10px',
                padding: '20px',
              }}>
                {/* Current Picture */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                }}>
                  <Avatar 
                    src={profilePicturePreview || profileUser?.dpUrl} 
                    sx={{ 
                      width: 70, 
                      height: 70, 
                      border: '3px solid #cf30aa',
                      fontSize: '28px',
                      fontWeight: 'bold'
                    }}
                  >
                    {profileUser?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <div style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '14px',
                      color: '#b6a9b7',
                      marginBottom: '4px'
                    }}>
                      Current Picture
                    </div>
                    {profilePicturePreview && (
                      <div style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '12px',
                        color: '#cf30aa',
                        fontWeight: 600,
                        background: 'rgba(207, 48, 170, 0.15)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        display: 'inline-block',
                      }}>
                        ✓ New Picture Selected
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px'
                }}>
                  <input
                    id="profile-picture-input"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureSelect}
                    style={{ display: 'none' }}
                  />
                  <Button
                    component="label"
                    htmlFor="profile-picture-input"
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    sx={{
                      flex: 1,
                      background: 'rgba(160, 153, 216, 0.1)',
                      border: '1.5px solid rgba(160, 153, 216, 0.3)',
                      color: '#b6a9b7',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 500,
                      textTransform: 'none',
                      fontSize: '14px',
                      '&:hover': {
                        background: 'rgba(207, 48, 170, 0.15)',
                        borderColor: '#cf30aa',
                        color: '#dfa2da',
                      }
                    }}
                  >
                    Choose Picture
                  </Button>
                  
                  {profilePicturePreview && (
                    <Button
                      onClick={handleRemoveProfilePicture}
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      sx={{
                        background: 'rgba(255, 0, 0, 0.08)',
                        border: '1.5px solid rgba(255, 0, 0, 0.3)',
                        color: '#ff6b6b',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 500,
                        textTransform: 'none',
                        fontSize: '14px',
                        '&:hover': {
                          background: 'rgba(255, 0, 0, 0.15)',
                          borderColor: '#ff6b6b',
                        }
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          borderTop: '1px solid rgba(160, 153, 216, 0.15)',
          background: 'linear-gradient(135deg, rgba(160, 153, 216, 0.03) 0%, rgba(207, 48, 170, 0.03) 100%)',
        }}>
          <Button 
            onClick={handleCancelEdit}
            disabled={isUploadingProfilePicture}
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(160, 153, 216, 0.3)',
              color: '#b6a9b7',
              borderRadius: '8px',
              padding: '10px 24px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '14px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
                borderColor: '#a099d8',
                color: '#ffffff',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile}
            disabled={isUploadingProfilePicture}
            sx={{
              background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
              color: 'white',
              borderRadius: '8px',
              padding: '10px 24px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(207, 48, 170, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #cf30aa, #dfa2da)',
                boxShadow: '0 6px 16px rgba(207, 48, 170, 0.4)',
              },
              '&:disabled': {
                opacity: 0.6,
              }
            }}
          >
            {isUploadingProfilePicture ? (
              <>
                <span style={{ fontSize: '12px', marginRight: 8 }}>⏳</span>
                Uploading...
              </>
            ) : (
              <>
                <SaveIcon style={{ marginRight: 8, fontSize: '18px' }} />
                Save Changes
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Modal */}
      {selectedPost && (
        <CommentModal
          open={isCommentModalOpen}
          onClose={handleCloseCommentModal}
          postId={selectedPost.id}
          postAuthor={selectedPost.author}
        />
      )}

      {/* Success/Error Snackbar */}
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
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  background: #0a0812;
  background-image: 
    radial-gradient(at 20% 30%, hsl(262, 47%, 8%) 0, transparent 50%), 
    radial-gradient(at 80% 70%, hsl(288, 39%, 10%) 0, transparent 50%);

  /* Top Navigation Bar */
  .top-navbar {
    background: rgba(16, 15, 28, 0.95) !important;
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(160, 153, 216, 0.1);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    padding: 8px 24px !important;
  }

  .nav-logo {
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .logo-text {
    font-size: 32px;
    font-weight: 400;
    font-family: 'Playlist Script', 'Pacifico', 'Brush Script MT', cursive !important;
    background: linear-gradient(135deg, #a099d8 0%, #cf30aa 50%, #dfa2da 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .logo-text .lowercase {
    text-transform: lowercase;
  }

  .search-container {
    flex: 1;
    max-width: 600px;
    margin: 0 40px;
  }

  .search-box {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 24px;
    padding: 8px 20px;
    transition: all 0.3s ease;
  }

  .search-box:focus-within {
    background: rgba(255, 255, 255, 0.08);
    border-color: #cf30aa;
    box-shadow: 0 0 20px rgba(207, 48, 170, 0.2);
  }

  .search-icon {
    color: #b6a9b7;
    margin-right: 12px;
  }

  .search-input {
    flex: 1;
    color: #ffffff !important;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
  }

  .search-input::placeholder {
    color: #8a8494;
    opacity: 1;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-icon-btn {
    color: #b6a9b7 !important;
    transition: all 0.3s ease;
  }

  .nav-icon-btn:hover {
    color: #dfa2da !important;
    background: rgba(207, 48, 170, 0.1) !important;
  }

  .profile-avatar {
    width: 40px !important;
    height: 40px !important;
    cursor: pointer;
    border: 2px solid #cf30aa;
    transition: all 0.3s ease;
  }

  .profile-avatar:hover {
    border-color: #dfa2da;
    transform: scale(1.05);
  }

  /* Main Container */
  .main-container {
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
    padding: 88px 24px 24px;
  }

  /* Left Sidebar */
  .left-sidebar {
    position: sticky;
    top: 88px;
    height: fit-content;
  }

  .sidebar-section {
    margin-bottom: 16px;
  }

  .user-profile-card {
    background: rgba(16, 15, 28, 0.8);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
  }

  .user-avatar {
    width: 80px !important;
    height: 80px !important;
    margin: 0 auto 16px;
    border: 3px solid #cf30aa;
  }

  .user-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    background: transparent;
    border: none;
    border-radius: 12px;
    color: #b6a9b7;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .nav-item:hover {
    background: rgba(207, 48, 170, 0.1);
    color: #dfa2da;
  }

  .nav-item.active {
    background: linear-gradient(135deg, rgba(64, 47, 181, 0.2), rgba(207, 48, 170, 0.2));
    color: #dfa2da;
    border: 1px solid rgba(207, 48, 170, 0.3);
  }

  .nav-item-icon {
    font-size: 22px !important;
  }

  /* Main Content */
  .main-content {
    max-width: 800px;
  }

  /* Profile Header */
  .profile-header {
    background: rgba(16, 15, 28, 0.8);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 16px;
    margin-bottom: 24px;
    overflow: hidden;
  }

  .profile-cover {
    height: 200px;
    background: linear-gradient(135deg, #402fb5, #cf30aa);
    position: relative;
  }

  .cover-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(64, 47, 181, 0.8), rgba(207, 48, 170, 0.8));
  }

  .profile-info {
    padding: 24px;
    position: relative;
  }

  .profile-avatar-section {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    margin-bottom: 16px;
  }

  .profile-main-avatar {
    width: 120px !important;
    height: 120px !important;
    border: 4px solid #cf30aa;
    margin-top: -60px;
    background: rgba(16, 15, 28, 0.9);
  }

  .edit-profile-btn,
  .message-user-btn {
    background: linear-gradient(135deg, #402fb5, #cf30aa) !important;
    color: white !important;
    border-radius: 8px !important;
    text-transform: none !important;
    font-family: 'Space Grotesk', sans-serif !important;
    font-weight: 500 !important;
    box-shadow: 0 4px 12px rgba(207, 48, 170, 0.3) !important;
    transition: all 0.3s ease !important;
    
    &:hover {
      background: linear-gradient(135deg, #cf30aa, #dfa2da) !important;
      box-shadow: 0 6px 16px rgba(207, 48, 170, 0.5) !important;
      transform: translateY(-2px);
    }
  }

  .profile-details {
    flex: 1;
  }

  .profile-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 8px 0;
  }

  .profile-regno {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    color: #b6a9b7;
    margin: 0 0 12px 0;
  }

  .profile-bio {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    color: #d4d0d6;
    line-height: 1.6;
    margin: 0 0 20px 0;
  }

  .profile-stats {
    display: flex;
    gap: 32px;
    margin-bottom: 16px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #cf30aa;
  }

  .stat-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #8a8494;
  }

  .join-date {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #8a8494;
    margin: 0;
  }

  /* Content Tabs */
  .content-tabs {
    margin-bottom: 24px;
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .section-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 16px 0;
  }

  /* Posts Section */
  .posts-section {
    background: rgba(16, 15, 28, 0.8);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 16px;
    padding: 24px;
  }

  .posts-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .post-card {
    background: rgba(16, 15, 28, 0.6);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
  }

  .post-card:hover {
    border-color: rgba(207, 48, 170, 0.4);
    box-shadow: 0 4px 20px rgba(207, 48, 170, 0.1);
  }

  .post-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .post-avatar {
    width: 48px !important;
    height: 48px !important;
    border: 2px solid #402fb5;
  }

  .post-info {
    flex: 1;
  }

  .post-author {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 4px 0;
  }

  .post-time {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #8a8494;
    margin: 0;
  }

  .post-content {
    margin-bottom: 16px;
  }

  .post-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    color: #d4d0d6;
    line-height: 1.6;
    margin: 12px 0 0 0;
    white-space: pre-wrap;
  }

  .post-image,
  .post-video {
    width: 100%;
    max-height: 500px;
    object-fit: contain;
    border-radius: 12px;
    margin: 0 0 0 0;
    background: rgba(0, 0, 0, 0.2);
  }

  .post-stats {
    display: flex;
    gap: 16px;
    padding: 12px 0;
    border-top: 1px solid rgba(160, 153, 216, 0.1);
    border-bottom: 1px solid rgba(160, 153, 216, 0.1);
    margin-bottom: 12px;
    
    .stat-item {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 13px;
      color: #b6a9b7;
      font-weight: 500;
    }
  }

  .post-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    color: #b6a9b7;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .action-btn:hover {
    background: rgba(207, 48, 170, 0.1);
    color: #dfa2da;
  }

  .action-btn.like-btn.liked {
    color: #cf30aa;
  }

  .action-btn.like-btn.liked svg {
    fill: #cf30aa;
    stroke: #cf30aa;
  }

  /* Clubs Section */
  .clubs-section {
    background: rgba(16, 15, 28, 0.8);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 16px;
    padding: 24px;
  }

  .clubs-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .club-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(16, 15, 28, 0.6);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s ease;
  }

  .club-card:hover {
    border-color: rgba(207, 48, 170, 0.4);
    box-shadow: 0 4px 20px rgba(207, 48, 170, 0.1);
  }

  .club-info {
    flex: 1;
  }

  .club-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 8px 0;
  }

  .club-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .role-chip {
    font-family: 'Space Grotesk', sans-serif !important;
    font-size: 11px !important;
    font-weight: 500 !important;
  }

  .role-chip.admin {
    background: linear-gradient(135deg, #cf30aa, #dfa2da) !important;
    color: white !important;
  }

  .role-chip.member {
    background: rgba(160, 153, 216, 0.2) !important;
    color: #b6a9b7 !important;
  }

  .join-date {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    color: #8a8494;
  }

  /* Right Sidebar */
  .right-sidebar {
    position: sticky;
    top: 88px;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sidebar-card {
    background: rgba(16, 15, 28, 0.8);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 16px;
    padding: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .header-icon {
    color: #cf30aa;
    font-size: 24px !important;
  }

  .card-header h3 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stats-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .clubs-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .club-item {
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(160, 153, 216, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(160, 153, 216, 0.1);
      border-color: rgba(160, 153, 216, 0.3);
      transform: translateX(4px);
    }
  }

  .club-item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .club-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stat-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #8a8494;
  }

  .stat-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #cf30aa;
  }

  /* Loading and Empty States */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 16px;
  }

  .loading-container p {
    font-family: 'Space Grotesk', sans-serif;
    color: #b6a9b7;
    font-size: 14px;
  }

  .empty-section {
    text-align: center;
    padding: 40px 20px;
  }

  .empty-section h3 {
    font-family: 'Space Grotesk', sans-serif;
    color: #ffffff;
    font-size: 18px;
    margin: 0 0 8px 0;
  }

  .empty-section p {
    font-family: 'Space Grotesk', sans-serif;
    color: #b6a9b7;
    font-size: 14px;
    margin: 0;
  }

  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 16px;
    text-align: center;
  }

  .error-container h3 {
    font-family: 'Space Grotesk', sans-serif;
    color: #ffffff;
    font-size: 20px;
    margin: 0;
  }

  .error-container p {
    font-family: 'Space Grotesk', sans-serif;
    color: #b6a9b7;
    font-size: 14px;
    margin: 0;
  }

  /* Edit Dialog */
  .edit-dialog {
    .MuiDialog-paper {
      background: rgba(16, 15, 28, 0.95) !important;
      border: 1px solid rgba(160, 153, 216, 0.2) !important;
      color: #ffffff !important;
    }

    .MuiDialogTitle-root {
      color: #ffffff !important;
      font-family: 'Space Grotesk', sans-serif !important;
    }

    .MuiTextField-root {
      .MuiOutlinedInput-root {
        color: #ffffff !important;
        .MuiOutlinedInput-notchedOutline {
          border-color: rgba(160, 153, 216, 0.3) !important;
        }
        &:hover .MuiOutlinedInput-notchedOutline {
          border-color: #cf30aa !important;
        }
        &.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #cf30aa !important;
        }
      }
      .MuiInputLabel-root {
        color: #b6a9b7 !important;
        &.Mui-focused {
          color: #cf30aa !important;
        }
      }
    }

    .MuiButton-root {
      font-family: 'Space Grotesk', sans-serif !important;
    }
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .main-container {
      grid-template-columns: 80px 1fr;
    }

    .right-sidebar {
      display: none;
    }

    .left-sidebar {
      width: 80px;
    }

    .user-profile-card {
      padding: 16px 8px;
    }

    .user-avatar {
      width: 48px !important;
      height: 48px !important;
      margin-bottom: 0 !important;
    }

    .user-name {
      display: none;
    }

    .sidebar-nav {
      margin-top: 16px;
    }

    .nav-item {
      padding: 14px;
      justify-content: center;
    }

    .nav-item span {
      display: none;
    }

    .nav-item-icon {
      margin: 0;
    }

    .main-content {
      max-width: 100%;
    }
  }

  @media (max-width: 768px) {
    .search-container {
      display: none;
    }

    .main-container {
      padding: 76px 12px 12px;
      grid-template-columns: 1fr;
    }

    .left-sidebar {
      display: none;
    }

    .profile-avatar-section {
      flex-direction: column;
      align-items: flex-start;
    }

    .profile-main-avatar {
      width: 100px !important;
      height: 100px !important;
      margin-top: -50px;
    }

    .profile-stats {
      gap: 20px;
    }

    .stat-number {
      font-size: 18px;
    }
  }

  /* Search Results Styles */
  .search-container {
    position: relative;
  }

  .search-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent;
    z-index: 999;
  }

  .search-results {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: #1e1a2e;
    border: 1px solid rgba(160, 153, 216, 0.3);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(160, 153, 216, 0.3);
      border-radius: 3px;

      &:hover {
        background: rgba(160, 153, 216, 0.5);
      }
    }
  }

  .search-result-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(160, 153, 216, 0.1);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgba(207, 48, 170, 0.1);
    }
  }

  .search-result-info {
    flex: 1;
  }

  .search-result-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 2px;
  }

  .search-result-regno {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #8a8494;
  }

  .search-no-results {
    padding: 24px;
    text-align: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #8a8494;
  }

`;

export default ProfilePage;
