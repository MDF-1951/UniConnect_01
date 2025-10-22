import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import {
  Dialog,
  DialogContent,
  IconButton,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  clubId?: number; // Optional: if provided, post as club instead of user
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ open, onClose, onPostCreated, clubId }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      setMediaType(fileType);

      // Create preview URL
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
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePost = async () => {
    if (!description.trim() && !mediaFile) {
      alert('Please add some content or media to your post');
      return;
    }

    setIsUploading(true);
    try {
      // Import apiService dynamically to avoid circular dependency
      const apiService = (await import('../services/api')).default;

      let mediaUrl: string | undefined = undefined;
      let finalMediaType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'REEL' = 'TEXT';

      // Upload file to server if present
      if (mediaFile) {
        console.log('Uploading file to server...', mediaFile.name);
        const uploadResponse = await apiService.uploadMedia(mediaFile);
        console.log('Upload response:', uploadResponse);
        
        // Use the relative URL from backend (e.g., /uploads/filename.jpg)
        mediaUrl = uploadResponse.url;
        finalMediaType = uploadResponse.type as 'TEXT' | 'IMAGE' | 'VIDEO' | 'REEL';
        
        console.log('Media URL to save:', mediaUrl);
        console.log('Media type:', finalMediaType);
      }

      const postData = {
        contentText: description || ' ', // Backend requires contentText
        mediaUrl: mediaUrl,
        mediaType: finalMediaType,
      };

      console.log('Creating post with data:', postData);
      
      // Create post as club or user depending on clubId
      if (clubId) {
        await apiService.createClubPost(clubId, postData);
      } else {
        await apiService.createPost(postData);
      }

      // Reset form
      setDescription('');
      handleRemoveMedia();
      
      // Notify parent to refresh feed
      onPostCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating post:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to create post. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setDescription('');
      handleRemoveMedia();
      onClose();
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent className="dialog-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Share Your Story</h2>
          <IconButton className="close-btn" onClick={handleClose} disabled={isUploading}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* User Info */}
        <div className="user-info">
          <Avatar className="user-avatar" src={user?.dpUrl}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div className="user-details">
            <h3 className="user-name">{user?.name}</h3>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>

        {/* Description Input */}
        <div className="content-section">
          <textarea
            className="description-input"
            placeholder="What's on your mind? Share your thoughts, achievements, or campus moments..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            rows={5}
          />

          {/* Media Preview */}
          {mediaPreview && (
            <div className="media-preview-container">
              <IconButton 
                className="remove-media-btn" 
                onClick={handleRemoveMedia}
                disabled={isUploading}
              >
                <CancelIcon />
              </IconButton>
              
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="Preview" className="media-preview-image" />
              ) : (
                <video src={mediaPreview} controls className="media-preview-video" loop muted playsInline autoPlay />
              )}
            </div>
          )}
        </div>

        {/* Media Upload Options */}
        {!mediaPreview && (
          <div className="media-options">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={isUploading}
            />
            <button 
              className="media-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <ImageIcon className="media-icon" />
              <span>Add Photo</span>
            </button>
            <button 
              className="media-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <VideoIcon className="media-icon" />
              <span>Add Video</span>
            </button>
          </div>
        )}

        {/* Post Button */}
        <button 
          className="post-btn"
          onClick={handlePost}
          disabled={isUploading || (!description.trim() && !mediaFile)}
        >
          {isUploading ? (
            <>
              <CircularProgress size={20} style={{ color: 'white', marginRight: 8 }} />
              Sharing...
            </>
          ) : (
            'Share Post'
          )}
        </button>
      </DialogContent>
    </StyledDialog>
  );
};

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    background: linear-gradient(145deg, #1a1825 0%, #0f0d1a 100%);
    border: 1px solid rgba(160, 153, 216, 0.3);
    border-radius: 20px !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    overflow: visible;
  }

  .dialog-content {
    padding: 0 !important;
    overflow-x: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 16px;
    border-bottom: 1px solid rgba(160, 153, 216, 0.1);
  }

  .modal-title {
    font-family: 'Playlist Script', cursive;
    font-size: 32px;
    font-weight: 400;
    background: linear-gradient(135deg, #a099d8 0%, #cf30aa 50%, #dfa2da 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }

  .close-btn {
    color: #b6a9b7 !important;
    transition: all 0.3s ease;
  }

  .close-btn:hover {
    color: #cf30aa !important;
    background: rgba(207, 48, 170, 0.1) !important;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
  }

  .user-avatar {
    width: 52px !important;
    height: 52px !important;
    border: 2px solid #cf30aa;
  }

  .user-details {
    flex: 1;
  }

  .user-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 4px 0;
  }

  .user-email {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #8a8494;
    margin: 0;
  }

  .content-section {
    padding: 0 24px 20px;
  }

  .description-input {
    width: 100%;
    min-height: 120px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 12px;
    padding: 16px;
    color: #ffffff;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    line-height: 1.6;
    resize: vertical;
    transition: all 0.3s ease;
  }

  .description-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: #cf30aa;
    box-shadow: 0 0 20px rgba(207, 48, 170, 0.2);
  }

  .description-input::placeholder {
    color: #8a8494;
    opacity: 1;
  }

  .description-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .media-preview-container {
    position: relative;
    margin-top: 16px;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
  }

  .remove-media-btn {
    position: absolute !important;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.6) !important;
    color: white !important;
    z-index: 10;
    transition: all 0.3s ease;
  }

  .remove-media-btn:hover {
    background: rgba(207, 48, 170, 0.8) !important;
    transform: scale(1.1);
  }

  .media-preview-image,
  .media-preview-video {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 12px;
  }

  .media-options {
    display: flex;
    gap: 12px;
    padding: 0 24px 20px;
  }

  .media-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(160, 153, 216, 0.1);
    border: 1px solid rgba(160, 153, 216, 0.3);
    border-radius: 12px;
    padding: 14px 20px;
    color: #b6a9b7;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .media-btn:hover:not(:disabled) {
    background: rgba(207, 48, 170, 0.2);
    border-color: #cf30aa;
    color: #dfa2da;
    transform: translateY(-2px);
  }

  .media-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .media-icon {
    font-size: 22px !important;
  }

  .post-btn {
    width: calc(100% - 48px);
    margin: 0 24px 24px;
    padding: 16px 32px;
    background: linear-gradient(135deg, #402fb5, #cf30aa);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .post-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    padding: 2px;
    background: linear-gradient(135deg, #a099d8, #cf30aa, #dfa2da);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .post-btn:hover:not(:disabled)::before {
    opacity: 1;
  }

  .post-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(207, 48, 170, 0.4);
  }

  .post-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 600px) {
    .modal-title {
      font-size: 24px;
    }

    .media-options {
      flex-direction: column;
    }

    .media-btn {
      width: 100%;
    }
  }
`;

export default CreatePostModal;

