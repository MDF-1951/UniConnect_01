import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import LinkIcon from '@mui/icons-material/Link';
import { Event } from '../types';

interface EventDetailModalProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ open, onClose, event }) => {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${url}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(160, 153, 216, 0.2)',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '24px',
          fontWeight: 700,
          color: '#ffffff',
          borderBottom: '1px solid rgba(160, 153, 216, 0.15)',
          pb: 2,
        }}
      >
        Event Details
        <IconButton
          onClick={onClose}
          sx={{
            color: '#a099d8',
            '&:hover': {
              color: '#cf30aa',
              background: 'rgba(207, 48, 170, 0.1)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3 }}>
        {/* Banner Image */}
        {event.bannerUrl && (
          <div
            style={{
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '24px',
              border: '2px solid rgba(160, 153, 216, 0.2)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              background: 'rgba(16, 15, 28, 0.5)',
            }}
          >
            <img
              src={getImageUrl(event.bannerUrl)}
              alt={event.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Event Title */}
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '28px',
            fontWeight: 700,
            color: '#ffffff',
            marginTop: 0,
            marginBottom: '12px',
          }}
        >
          {event.title}
        </h2>

        {/* Club Name */}
        <Chip
          label={`Organized by ${event.clubName}`}
          sx={{
            background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
            color: 'white',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            mb: 2,
          }}
        />

        {/* OD Chip */}
        {event.odProvided && (
          <Chip
            label="OD Provided"
            sx={{
              background: 'rgba(76, 175, 80, 0.2)',
              color: '#4caf50',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              ml: 1,
              mb: 2,
            }}
          />
        )}

        {/* Description */}
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '16px',
            color: '#b6a9b7',
            lineHeight: '1.6',
            marginTop: '20px',
            marginBottom: '24px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {event.description}
        </p>

        {/* Event Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <EventIcon sx={{ color: '#cf30aa', fontSize: '24px' }} />
            <div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '12px',
                  color: '#a099d8',
                  marginBottom: '4px',
                }}
              >
                Date
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  color: '#ffffff',
                  fontWeight: 600,
                }}
              >
                {formatDate(event.startTime)}
              </div>
            </div>
          </div>

          {/* Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AccessTimeIcon sx={{ color: '#cf30aa', fontSize: '24px' }} />
            <div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '12px',
                  color: '#a099d8',
                  marginBottom: '4px',
                }}
              >
                Time
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  color: '#ffffff',
                  fontWeight: 600,
                }}
              >
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LocationOnIcon sx={{ color: '#cf30aa', fontSize: '24px' }} />
            <div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '12px',
                  color: '#a099d8',
                  marginBottom: '4px',
                }}
              >
                Location
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  color: '#ffffff',
                  fontWeight: 600,
                }}
              >
                {event.location}
              </div>
            </div>
          </div>

          {/* Registration Link */}
          {event.registrationLink && (
            <div style={{ marginTop: '8px' }}>
              <Button
                variant="contained"
                startIcon={<LinkIcon />}
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #cf30aa, #dfa2da)',
                  },
                }}
              >
                Register Now
              </Button>
              {event.registrationDeadline && (
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '12px',
                    color: '#a099d8',
                    marginTop: '8px',
                  }}
                >
                  Registration deadline: {formatDate(event.registrationDeadline)} at{' '}
                  {formatTime(event.registrationDeadline)}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;

