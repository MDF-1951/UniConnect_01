import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import StayHardLoader from '../components/StayHardLoader';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Home as HomeIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import { ChatRoom, Message } from '../types';

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const selectedRoomIdRef = useRef<number | null>(null);

  useEffect(() => {
    loadChatRooms();

    // Auto-refresh chat rooms list every 5 seconds to show new message previews
    const intervalId = setInterval(() => {
      loadChatRooms();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Handle navigation state (when coming from profile page)
  useEffect(() => {
    const state = location.state as { selectedChatRoomId?: number } | null;
    if (state?.selectedChatRoomId && chatRooms.length > 0) {
      const room = chatRooms.find(r => r.chatRoomId === state.selectedChatRoomId);
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [location.state, chatRooms]);

  useEffect(() => {
    if (selectedRoom) {
      selectedRoomIdRef.current = selectedRoom.chatRoomId;
      loadMessages(selectedRoom.chatRoomId);
    } else {
      selectedRoomIdRef.current = null;
    }
  }, [selectedRoom]);

  // Auto-refresh messages every 2 seconds when a room is selected
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (selectedRoomIdRef.current !== null) {
        loadMessages(selectedRoomIdRef.current);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array - only set up once

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      console.log('Loading chat rooms...');
      const rooms = await apiService.getUserChatRooms();
      console.log('Chat rooms loaded:', rooms);
      setChatRooms(rooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      } else if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Error details:', axiosError.response?.data || axiosError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId: number) => {
    try {
      const roomMessages = await apiService.getChatMessages(chatRoomId);
      setMessages(roomMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      setSending(true);
      const message = await apiService.sendMessage(selectedRoom.chatRoomId, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Re-focus the input field after sending
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
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

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.type === 'GROUP' && room.club) {
      return room.club.name;
    }
    // For private chats, find the other participant
    if (room.type === 'PRIVATE' && room.participants) {
      const otherParticipant = room.participants.find(p => p.userId !== user?.userId);
      return otherParticipant?.name || 'Unknown User';
    }
    return 'Private Chat';
  };

  const getRoomIcon = (room: ChatRoom) => {
    return room.type === 'GROUP' ? <GroupIcon /> : <PersonIcon />;
  };

  const getRoomAvatar = (room: ChatRoom) => {
    if (room.type === 'GROUP' && room.club?.logoUrl) {
      // Construct full URL for club logo
      const logoUrl = room.club.logoUrl;
      return logoUrl.startsWith('http') ? logoUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${logoUrl}`;
    }
    // For private chats, find the other participant
    if (room.type === 'PRIVATE' && room.participants) {
      const otherParticipant = room.participants.find(p => p.userId !== user?.userId);
      if (otherParticipant?.dpUrl) {
        // Construct full URL for profile picture
        const dpUrl = otherParticipant.dpUrl;
        return dpUrl.startsWith('http') ? dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${dpUrl}`;
      }
    }
    return undefined; // Return undefined to show avatar with initials
  };

  const getRoomInitials = (room: ChatRoom) => {
    if (room.type === 'GROUP' && room.club) {
      return room.club.name.charAt(0).toUpperCase();
    }
    if (room.type === 'PRIVATE' && room.participants) {
      const otherParticipant = room.participants.find(p => p.userId !== user?.userId);
      return otherParticipant?.name?.charAt(0).toUpperCase() || '?';
    }
    return '?';
  };

  const filteredRooms = chatRooms.filter(room =>
    getRoomDisplayName(room).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StyledContainer>
      {/* Header */}
      <AppBar position="fixed" className="app-bar">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" className="app-title">
            Messages
          </Typography>
          <div className="header-actions">
            <IconButton color="inherit" onClick={handleProfileMenuOpen}>
              <Avatar 
                className="user-avatar" 
                src={user?.dpUrl ? (user.dpUrl.startsWith('http') ? user.dpUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${user.dpUrl}`) : undefined}
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
            '&:hover': {
              background: 'rgba(207, 48, 170, 0.1)',
            }
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
            '&:hover': {
              background: 'rgba(207, 48, 170, 0.1)',
            }
          }}
        >
          <LogoutIcon sx={{ marginRight: '12px', color: '#cf30aa' }} />
          Logout
        </MenuItem>
      </Menu>

      <div className="chat-container">
        {/* Sidebar - Chat Rooms List */}
        <div className="sidebar">
          <div className="sidebar-header">
            <TextField
              fullWidth
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              className="search-input"
            />
          </div>

          <div className="rooms-list">
            {loading ? (
              <StayHardLoader />
            ) : filteredRooms.length === 0 ? (
              <div className="empty-state">
                <p>No conversations yet</p>
              </div>
            ) : (
              <List>
                {filteredRooms.map((room) => (
                  <React.Fragment key={room.chatRoomId}>
                    <ListItem
                      onClick={() => setSelectedRoom(room)}
                      className={`room-item ${selectedRoom?.chatRoomId === room.chatRoomId ? 'selected' : ''}`}
                    >
                      <ListItemAvatar>
                        <Avatar className="room-avatar" src={getRoomAvatar(room)}>
                          {getRoomInitials(room)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={getRoomDisplayName(room)}
                        secondary={room.lastMessage?.content || 'No messages yet'}
                        className="room-text"
                      />
                      {room.lastMessage && (
                        <Typography variant="caption" className="message-time">
                          {formatTime(room.lastMessage.timestamp)}
                        </Typography>
                      )}
                    </ListItem>
                    <Divider className="room-divider" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <Avatar className="chat-avatar" src={getRoomAvatar(selectedRoom)}>
                  {getRoomInitials(selectedRoom)}
                </Avatar>
                <div className="chat-info">
                  <Typography variant="h6" className="chat-title">
                    {getRoomDisplayName(selectedRoom)}
                  </Typography>
                  <Typography variant="body2" className="chat-subtitle">
                    {selectedRoom.type === 'GROUP' ? 'Group Chat' : 'Private Chat'}
                  </Typography>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((message) => (
                      <div
                        key={message.messageId}
                        className={`message-item ${message.senderId === user?.userId ? 'own-message' : 'other-message'}`}
                      >
                        <div className="message-content">
                          <div className="message-header">
                            <span className="sender-name">{message.senderName}</span>
                            <span className="message-time">{formatTime(message.timestamp)}</span>
                          </div>
                          <p className="message-text">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="message-input-container">
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                  inputRef={messageInputRef}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                          className="send-button"
                        >
                          {sending ? (
                            <span style={{ fontSize: '10px', color: '#cf30aa' }}>...</span>
                          ) : (
                            <SendIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  className="message-input"
                />
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <Typography variant="h5" className="no-selection-title">
                  Select a conversation
                </Typography>
                <Typography variant="body1" className="no-selection-subtitle">
                  Choose a conversation from the sidebar to start messaging
                </Typography>
              </div>
            </div>
          )}
        </div>
      </div>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  height: 100vh;
  background: linear-gradient(135deg, #0f0d1a 0%, #1a1825 100%);
  display: flex;
  flex-direction: column;

  .app-bar {
    background: rgba(16, 15, 28, 0.95) !important;
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(160, 153, 216, 0.2);
  }

  .app-title {
    font-family: 'Playlist Script', 'Pacifico', 'Brush Script MT', cursive !important;
    font-size: 24px !important;
    font-weight: 400 !important;
    color: #ffffff !important;
    margin-left: 16px !important;
  }

  .header-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-avatar {
    width: 32px !important;
    height: 32px !important;
    border: 2px solid #cf30aa;
  }

  .chat-container {
    display: flex;
    height: calc(100vh - 64px);
    margin-top: 64px;
  }

  .sidebar {
    width: 350px;
    background: rgba(16, 15, 28, 0.8);
    border-right: 1px solid rgba(160, 153, 216, 0.2);
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid rgba(160, 153, 216, 0.1);
  }

  .search-input {
    .MuiOutlinedInput-root {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      
      fieldset {
        border-color: rgba(160, 153, 216, 0.2);
      }
      
      &:hover fieldset {
        border-color: rgba(160, 153, 216, 0.3);
      }
      
      &.Mui-focused fieldset {
        border-color: #cf30aa;
      }
    }
    
    .MuiInputBase-input {
      color: #ffffff;
      font-family: 'Space Grotesk', sans-serif;
      
      &::placeholder {
        color: #8a8494;
        opacity: 1;
      }
    }
  }

  .rooms-list {
    flex: 1;
    overflow-y: auto;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 16px;
  }

  .loading-container p {
    font-family: 'Space Grotesk', sans-serif;
    color: #b6a9b7;
    font-size: 14px;
    margin: 0;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    
    p {
      font-family: 'Space Grotesk', sans-serif;
      color: #8a8494;
      font-size: 14px;
      margin: 0;
    }
  }

  .room-item {
    padding: 16px !important;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(207, 48, 170, 0.1) !important;
    }
    
    &.selected {
      background: rgba(207, 48, 170, 0.15) !important;
      border-right: 3px solid #cf30aa;
    }
  }

  .room-avatar {
    background: linear-gradient(135deg, #402fb5, #cf30aa) !important;
    color: #ffffff !important;
  }

  .room-text {
    .MuiListItemText-primary {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
    }
    
    .MuiListItemText-secondary {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 12px;
      color: #8a8494;
    }
  }

  .message-time {
    font-family: 'Space Grotesk', sans-serif;
    color: #8a8494;
    font-size: 11px;
  }

  .room-divider {
    background: rgba(160, 153, 216, 0.1);
  }

  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(16, 15, 28, 0.6);
  }

  .chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    border-bottom: 1px solid rgba(160, 153, 216, 0.1);
    background: rgba(16, 15, 28, 0.8);
  }

  .chat-avatar {
    background: linear-gradient(135deg, #402fb5, #cf30aa) !important;
    color: #ffffff !important;
  }

  .chat-info {
    flex: 1;
  }

  .chat-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
  }

  .chat-subtitle {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    color: #8a8494;
    margin: 0;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .empty-messages {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    
    p {
      font-family: 'Space Grotesk', sans-serif;
      color: #8a8494;
      font-size: 14px;
      margin: 0;
    }
  }

  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .message-item {
    display: flex;
    margin-bottom: 8px;
    
    &.own-message {
      justify-content: flex-end;
      
      .message-content {
        background: linear-gradient(135deg, #cf30aa, #402fb5);
        color: #ffffff;
        max-width: 70%;
      }
    }
    
    &.other-message {
      justify-content: flex-start;
      
      .message-content {
        background: rgba(255, 255, 255, 0.1);
        color: #d4d0d6;
        max-width: 70%;
      }
    }
  }

  .message-content {
    padding: 12px 16px;
    border-radius: 18px;
    word-wrap: break-word;
  }

  .message-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .sender-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    font-weight: 600;
    opacity: 0.8;
  }

  .message-time {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10px;
    opacity: 0.7;
  }

  .message-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    line-height: 1.4;
    margin: 0;
  }

  .message-input-container {
    padding: 16px 24px;
    border-top: 1px solid rgba(160, 153, 216, 0.1);
    background: rgba(16, 15, 28, 0.8);
  }

  .message-input {
    .MuiOutlinedInput-root {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      
      fieldset {
        border-color: rgba(160, 153, 216, 0.2);
      }
      
      &:hover fieldset {
        border-color: rgba(160, 153, 216, 0.3);
      }
      
      &.Mui-focused fieldset {
        border-color: #cf30aa;
      }
    }
    
    .MuiInputBase-input {
      color: #ffffff;
      font-family: 'Space Grotesk', sans-serif;
      
      &::placeholder {
        color: #8a8494;
        opacity: 1;
      }
    }
  }

  .send-button {
    color: #cf30aa !important;
    background: rgba(207, 48, 170, 0.1) !important;
    transition: all 0.3s ease !important;
    
    &:hover:not(:disabled) {
      background: rgba(207, 48, 170, 0.2) !important;
      transform: scale(1.05);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .no-selection {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .no-selection-content {
    text-align: center;
    padding: 40px;
  }

  .no-selection-title {
    font-family: 'Space Grotesk', sans-serif;
    color: #ffffff;
    margin-bottom: 16px !important;
  }

  .no-selection-subtitle {
    font-family: 'Space Grotesk', sans-serif;
    color: #8a8494;
    margin: 0 !important;
  }

  @media (max-width: 768px) {
    .sidebar {
      width: 100%;
    }
    
    .chat-main {
      display: ${props => props.className?.includes('mobile-chat') ? 'flex' : 'none'};
    }
  }
`;

export default ChatPage;
