import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import apiService from '../services/api';
import { Post, Event, Club, User } from '../types';
import CreatePostModal from '../components/CreatePostModal';
import CommentModal from '../components/CommentModal';
import EventDetailModal from '../components/EventDetailModal';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  InputBase,
  Fab,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import StayHardLoader from '../components/StayHardLoader';
import {
  Search as SearchIcon,
  Chat as ChatIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Groups as GroupsIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{ id: number; author: string } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);

  useEffect(() => {
    loadFeed();
    loadUpcomingEvents();
  }, []);

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
  }, [searchQuery]);

  const loadUpcomingEvents = async () => {
    try {
      const events = await apiService.getUpcomingEvents();
      // Get next 5 upcoming events
      const now = new Date();
      const futureEvents = events
        .filter(event => new Date(event.startTime) >= now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5);
      setUpcomingEvents(futureEvents);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
    }
  };

  const loadFeed = async () => {
    try {
      setLoading(true);
      const feedPosts = await apiService.getPostsFeed();
      console.log('Feed posts loaded:', feedPosts);
      
      // Fetch likes and comments for each post
      const postsWithStats = await Promise.all(
        feedPosts.map(async (post) => {
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
      
      console.log('Posts with stats:', postsWithStats);
      setPosts(postsWithStats);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
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

  const handleUserSelect = (userId: number) => {
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/profile/${userId}`);
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

  const handleLikePost = async (postId: number) => {
    try {
      const post = posts.find(p => p.postId === postId);
      if (!post) return;

      // Optimistically update the UI first
      setPosts(prevPosts => 
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
      setPosts(prevPosts =>
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
      loadFeed();
    }
  };

  const handleOpenCreatePost = () => {
    setIsCreatePostOpen(true);
  };

  const handleCloseCreatePost = () => {
    setIsCreatePostOpen(false);
  };

  const handlePostCreated = () => {
    loadFeed();
  };

  const handleOpenCommentModal = (postId: number, postAuthor: string) => {
    setSelectedPost({ id: postId, author: postAuthor });
    setIsCommentModalOpen(true);
  };

  const handleCloseCommentModal = () => {
    setIsCommentModalOpen(false);
    setSelectedPost(null);
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
              src={user?.dpUrl ? (user.dpUrl.startsWith('http') ? user.dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.dpUrl}`) : undefined}
            >
              {user?.name?.charAt(0).toUpperCase()}
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
                src={user?.dpUrl ? (user.dpUrl.startsWith('http') ? user.dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.dpUrl}`) : undefined}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <h3 className="user-name">{user?.name}</h3>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button className="nav-item active" onClick={() => navigate('/dashboard')}>
              <HomeIcon className="nav-item-icon" />
              <span>Home</span>
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
            {user?.role === 'ADMIN' && (
              <button className="nav-item" onClick={() => navigate('/admin')}>
                <DashboardIcon className="nav-item-icon" />
                <span>Overview</span>
              </button>
            )}
          </nav>
        </aside>

        {/* Main Feed */}
        <main className="main-feed">
          {/* Posts Feed */}
          {loading ? (
            <StayHardLoader />
          ) : posts.length === 0 ? (
            <div className="empty-feed">
              <h3>No posts yet</h3>
              <p>Start following clubs and users to see posts in your feed!</p>
            </div>
          ) : (
            <div className="posts-container">
              {posts.map((post) => (
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
                            onError={(e) => {
                              const imageUrl = post.mediaUrl ? `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${post.mediaUrl}` : post.contentImage;
                              console.error('Image failed to load:', imageUrl);
                              console.log('Post data:', post);
                            }}
                            onLoad={() => {
                              const imageUrl = post.mediaUrl ? `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${post.mediaUrl}` : post.contentImage;
                              console.log('Image loaded successfully:', imageUrl);
                            }}
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
                            autoPlay
                            onError={(e) => {
                              const videoUrl = post.mediaUrl ? `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${post.mediaUrl}` : post.mediaUrl;
                              console.error('Video failed to load:', videoUrl);
                            }}
                            onLoadedData={(e) => {
                              // Try to play the video when it's loaded
                              const video = e.target as HTMLVideoElement;
                              video.play().catch(err => {
                                console.log('Autoplay prevented by browser:', err);
                              });
                            }}
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
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          {/* Upcoming Events */}
          <div className="sidebar-card">
            <div className="card-header">
              <EventIcon className="header-icon" />
              <h3>Upcoming Events</h3>
              <IconButton
                onClick={() => navigate('/events')}
                sx={{
                  marginLeft: 'auto',
                  color: '#a099d8',
                  '&:hover': { color: '#cf30aa' }
                }}
                size="small"
              >
                →
              </IconButton>
            </div>
            <div className="events-list">
              {upcomingEvents.length === 0 ? (
                <p className="empty-text">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.eventId}
                    className="event-item"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsEventDetailOpen(true);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(160, 153, 216, 0.15)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#cf30aa';
                      e.currentTarget.style.background = 'rgba(207, 48, 170, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(160, 153, 216, 0.15)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#ffffff',
                        margin: '0 0 6px 0',
                      }}
                    >
                      {event.title}
                    </h4>
                    <p
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '12px',
                        color: '#a099d8',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {event.clubName}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '11px',
                        color: '#b6a9b7',
                      }}
                    >
                      <span>📅 {new Date(event.startTime).toLocaleDateString()}</span>
                      {event.odProvided && (
                        <span
                          style={{
                            background: 'rgba(76, 175, 80, 0.2)',
                            color: '#4caf50',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 600,
                          }}
                        >
                          OD
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Suggested Clubs */}
          <div className="sidebar-card">
            <div className="card-header">
              <GroupsIcon className="header-icon" />
              <h3>Suggested Clubs</h3>
            </div>
            <div className="clubs-list">
              <p className="empty-text">No suggestions yet</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Action Button */}
      <Fab className="fab-button" onClick={handleOpenCreatePost}>
        <AddIcon />
      </Fab>

      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreatePostOpen}
        onClose={handleCloseCreatePost}
        onPostCreated={handlePostCreated}
      />

      {/* Comment Modal */}
      {selectedPost && (
        <CommentModal
          open={isCommentModalOpen}
          onClose={handleCloseCommentModal}
          postId={selectedPost.id}
          postAuthor={selectedPost.author}
        />
      )}

      {/* Event Detail Modal */}
      <EventDetailModal
        open={isEventDetailOpen}
        onClose={() => setIsEventDetailOpen(false)}
        event={selectedEvent}
      />
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
    position: relative;
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

  .user-email {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #b6a9b7;
    margin: 0;
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

  /* Main Feed */
  .main-feed {
    max-width: 680px;
  }

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

  .empty-feed {
    background: rgba(16, 15, 28, 0.6);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 16px;
    padding: 60px 20px;
    text-align: center;
  }

  .empty-feed h3 {
    font-family: 'Space Grotesk', sans-serif;
    color: #ffffff;
    font-size: 20px;
    margin: 0 0 8px 0;
  }

  .empty-feed p {
    font-family: 'Space Grotesk', sans-serif;
    color: #b6a9b7;
    font-size: 14px;
    margin: 0;
  }

  .posts-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .post-card {
    background: rgba(16, 15, 28, 0.8);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 16px;
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

  .post-video {
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .post-video:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 20px rgba(207, 48, 170, 0.2);
  }

  .post-video::after {
    content: "🔇";
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    opacity: 0.8;
  }

  .post-stats {
    display: flex;
    gap: 16px;
    padding: 12px 0;
    border-top: 1px solid rgba(160, 153, 216, 0.1);
    border-bottom: 1px solid rgba(160, 153, 216, 0.1);
    margin-bottom: 12px;
  }

  .stat-item {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #8a8494;
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

  .empty-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #8a8494;
    text-align: center;
    margin: 20px 0;
  }

  /* Floating Action Button */
  .fab-button {
    position: fixed !important;
    bottom: 32px;
    right: 32px;
    background: linear-gradient(135deg, #402fb5, #cf30aa) !important;
    color: white !important;
    box-shadow: 0 8px 24px rgba(207, 48, 170, 0.4) !important;
    transition: all 0.3s ease !important;
  }

  .fab-button:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 32px rgba(207, 48, 170, 0.6) !important;
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

    .main-feed {
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
  }
`;

export default DashboardPage;
