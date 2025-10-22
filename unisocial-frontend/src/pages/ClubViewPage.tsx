import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import apiService from '../services/api';
import { Club, Post } from '../types';
import CommentModal from '../components/CommentModal';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  Event as EventIcon,
  Groups as GroupsIcon,
  Logout as LogoutIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  Verified as VerifiedIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const ClubViewPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [club, setClub] = useState<Club | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [membershipStatus, setMembershipStatus] = useState<{ isMember: boolean; status: string; role: string } | null>(null);
  const [joiningClub, setJoiningClub] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{ id: number; author: string } | null>(null);

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

      // Load membership status
      const status = await apiService.getClubMembershipStatus(Number(clubId));
      setMembershipStatus(status);

      // Load club posts
      await loadClubPosts();
    } catch (error) {
      console.error('Error loading club data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClubPosts = async () => {
    try {
      const clubPosts = await apiService.getClubPosts(Number(clubId));

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

  const handleJoinClub = async () => {
    try {
      setJoiningClub(true);
      await apiService.joinClub(Number(clubId));
      // Reload membership status
      const status = await apiService.getClubMembershipStatus(Number(clubId));
      setMembershipStatus(status);
    } catch (error: any) {
      console.error('Error joining club:', error);
      alert(error.response?.data?.error || 'Failed to join club');
    } finally {
      setJoiningClub(false);
    }
  };

  const getJoinButtonText = () => {
    if (!membershipStatus || !membershipStatus.isMember) {
      return 'Join Club';
    }
    
    switch (membershipStatus.status) {
      case 'PENDING':
        return 'Request Sent';
      case 'APPROVED':
        return 'Member';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Join Club';
    }
  };

  const isJoinButtonDisabled = (): boolean => {
    return joiningClub || (membershipStatus?.isMember || false);
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <h1 className="club-title">{club.name}</h1>
                {club.verified && (
                  <VerifiedIcon sx={{ color: '#cf30aa', fontSize: '32px' }} />
                )}
              </div>
              <p className="club-description">{club.description || 'No description available'}</p>
              <div className="club-stats">
                <span>{club.memberCount || 0} Members</span>
                <span>•</span>
                <span>{posts.length} Posts</span>
              </div>
            </div>
            
            {/* Join Button */}
            <Button
              variant="contained"
              onClick={handleJoinClub}
              disabled={isJoinButtonDisabled()}
              sx={{
                background: isJoinButtonDisabled() 
                  ? 'rgba(160, 153, 216, 0.2)' 
                  : 'linear-gradient(135deg, #402fb5, #cf30aa)',
                color: 'white',
                borderRadius: '8px',
                padding: '12px 32px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                textTransform: 'none',
                alignSelf: 'flex-start',
                '&:hover': {
                  background: isJoinButtonDisabled()
                    ? 'rgba(160, 153, 216, 0.2)'
                    : 'linear-gradient(135deg, #cf30aa, #dfa2da)',
                },
                '&:disabled': { 
                  opacity: 0.7,
                  color: '#b6a9b7'
                }
              }}
            >
              {joiningClub ? <CircularProgress size={20} style={{ color: 'white' }} /> : getJoinButtonText()}
            </Button>
          </div>

          {/* Posts Section */}
          <div className="section-header">
            <h2 className="section-title">Club Posts</h2>
          </div>

          <div className="posts-feed">
            {posts.length === 0 ? (
              <div className="empty-state">
                <p>No posts yet from this club.</p>
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
    margin: 0;
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

export default ClubViewPage;

