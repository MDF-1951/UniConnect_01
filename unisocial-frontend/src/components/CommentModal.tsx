import React, { useState, useEffect } from 'react';
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
  Send as SendIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Comment } from '../types';

interface CommentModalProps {
  open: boolean;
  onClose: () => void;
  postId: number;
  postAuthor: string;
}

const CommentModal: React.FC<CommentModalProps> = ({ open, onClose, postId, postAuthor }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const postComments = await apiService.getPostComments(postId);
      // Organize comments into parent-child structure
      const organizedComments = organizeComments(postComments);
      setComments(organizedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeComments = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map and add replies array
    flatComments.forEach(comment => {
      commentMap.set(comment.commentId, { ...comment, replies: [] });
    });

    // Second pass: organize into tree structure
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.commentId)!;
      
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const commentData = {
        content: newComment.trim(),
        parentCommentId: replyingTo || undefined
      };
      
      const comment = await apiService.addComment(postId, commentData);
      
      // Add the new comment to the appropriate place
      if (replyingTo) {
        setComments(prev => addReplyToComment(prev, replyingTo, comment));
      } else {
        setComments(prev => [comment, ...prev]);
      }
      
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addReplyToComment = (comments: Comment[], parentId: number, newReply: Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.commentId === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, parentId, newReply)
        };
      }
      return comment;
    });
  };

  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
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

  const renderComment = (comment: Comment, depth: number = 0) => (
    <div key={comment.commentId} className={`comment-item ${depth > 0 ? 'reply-comment' : ''}`}>
      <Avatar className="comment-avatar" src={comment.authorDpUrl}>
        {comment.authorName?.charAt(0).toUpperCase()}
      </Avatar>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.authorName}</span>
          <span className="comment-time">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        <div className="comment-actions">
          <button 
            className="reply-btn"
            onClick={() => handleReply(comment.commentId)}
          >
            <ReplyIcon fontSize="small" />
            Reply
          </button>
        </div>
        
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies-container">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent className="dialog-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Comments</h2>
          <IconButton className="close-btn" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* Comments List */}
        <div className="comments-container">
          {loading ? (
            <div className="loading-container">
              <CircularProgress style={{ color: '#cf30aa' }} />
              <p>Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="empty-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map(comment => renderComment(comment))}
            </div>
          )}
        </div>

        {/* Add Comment Section */}
        <div className="add-comment-section">
          <Avatar className="user-avatar" src={user?.dpUrl}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div className="comment-input-container">
            {replyingTo && (
              <div className="reply-indicator">
                <span>Replying to comment...</span>
                <button className="cancel-reply-btn" onClick={handleCancelReply}>
                  Cancel
                </button>
              </div>
            )}
            <textarea
              className="comment-input"
              placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={submitting}
              rows={2}
            />
            <IconButton 
              className="send-btn"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <CircularProgress size={20} style={{ color: '#cf30aa' }} />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </div>
        </div>
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
    max-height: 80vh;
  }

  .dialog-content {
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    height: 70vh;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 16px;
    border-bottom: 1px solid rgba(160, 153, 216, 0.1);
  }

  .modal-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
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

  .comments-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
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

  .empty-comments {
    text-align: center;
    padding: 40px 20px;
  }

  .empty-comments p {
    font-family: 'Space Grotesk', sans-serif;
    color: #8a8494;
    font-size: 14px;
    margin: 0;
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .comment-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .comment-item.reply-comment {
    margin-left: 20px;
    border-left: 2px solid rgba(160, 153, 216, 0.2);
    padding-left: 12px;
  }

  .comment-avatar {
    width: 40px !important;
    height: 40px !important;
    border: 2px solid #402fb5;
    flex-shrink: 0;
  }

  .comment-content {
    flex: 1;
    min-width: 0;
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .comment-author {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
  }

  .comment-time {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    color: #8a8494;
  }

  .comment-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #d4d0d6;
    line-height: 1.5;
    margin: 0 0 8px 0;
    word-wrap: break-word;
  }

  .comment-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .reply-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: #8a8494;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .reply-btn:hover {
    color: #cf30aa;
    background: rgba(207, 48, 170, 0.1);
  }

  .replies-container {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .reply-indicator {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(207, 48, 170, 0.1);
    border: 1px solid rgba(207, 48, 170, 0.3);
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 8px;
  }

  .reply-indicator span {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    color: #cf30aa;
  }

  .cancel-reply-btn {
    background: none;
    border: none;
    color: #cf30aa;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    cursor: pointer;
    text-decoration: underline;
  }

  .cancel-reply-btn:hover {
    color: #dfa2da;
  }

  .add-comment-section {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid rgba(160, 153, 216, 0.1);
    align-items: flex-end;
  }

  .user-avatar {
    width: 40px !important;
    height: 40px !important;
    border: 2px solid #cf30aa;
    flex-shrink: 0;
  }

  .comment-input-container {
    flex: 1;
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }

  .comment-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(160, 153, 216, 0.2);
    border-radius: 12px;
    padding: 12px 16px;
    color: #ffffff;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    transition: all 0.3s ease;
  }

  .comment-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: #cf30aa;
    box-shadow: 0 0 20px rgba(207, 48, 170, 0.2);
  }

  .comment-input::placeholder {
    color: #8a8494;
    opacity: 1;
  }

  .comment-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .send-btn {
    color: #cf30aa !important;
    background: rgba(207, 48, 170, 0.1) !important;
    transition: all 0.3s ease !important;
    flex-shrink: 0;
  }

  .send-btn:hover:not(:disabled) {
    background: rgba(207, 48, 170, 0.2) !important;
    transform: scale(1.05);
  }

  .send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    .modal-title {
      font-size: 20px;
    }

    .comments-container {
      padding: 12px 16px;
    }

    .add-comment-section {
      padding: 12px 16px;
    }
  }
`;

export default CommentModal;
