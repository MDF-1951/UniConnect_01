import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { CreateEventRequest } from '../types';
import apiService from '../services/api';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  clubId: number;
  onEventCreated: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  open,
  onClose,
  clubId,
  onEventCreated,
}) => {
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    description: '',
    bannerUrl: '',
    location: '',
    startTime: '',
    endTime: '',
    registrationLink: '',
    registrationDeadline: '',
    odProvided: false,
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      bannerUrl: '',
      location: '',
      startTime: '',
      endTime: '',
      registrationLink: '',
      registrationDeadline: '',
      odProvided: false,
    });
    setBannerFile(null);
    setBannerPreview('');
    setError('');
    onClose();
  };

  const handleBannerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Title, description, and location are required');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Start time and end time are required');
      return;
    }

    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    if (endDate <= startDate) {
      setError('End time must be after start time');
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      let bannerUrl = '';
      if (bannerFile) {
        const uploadResponse = await apiService.uploadImage(bannerFile);
        bannerUrl = uploadResponse.url;
      }

      // Convert to ISO strings for backend
      const eventData: CreateEventRequest = {
        ...formData,
        bannerUrl: bannerUrl || formData.bannerUrl || undefined,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        registrationDeadline: formData.registrationDeadline
          ? new Date(formData.registrationDeadline).toISOString()
          : undefined,
      };

      await apiService.createEvent(clubId, eventData);
      onEventCreated();
      handleClose();
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(160, 153, 216, 0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '24px',
          fontWeight: 700,
          color: '#ffffff',
          borderBottom: '1px solid rgba(160, 153, 216, 0.15)',
          pb: 2,
        }}
      >
        Create New Event
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title */}
          <TextField
            label="Event Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              },
              '& .MuiInputLabel-root': {
                color: '#a099d8',
                fontFamily: "'Space Grotesk', sans-serif",
              },
            }}
          />

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            required
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              },
              '& .MuiInputLabel-root': {
                color: '#a099d8',
                fontFamily: "'Space Grotesk', sans-serif",
              },
            }}
          />

          {/* Banner Upload */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#a099d8',
                marginBottom: '8px',
              }}
            >
              Event Banner (Optional)
            </label>
            {bannerPreview ? (
              <div style={{ position: 'relative', width: '100%' }}>
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '2px solid rgba(160, 153, 216, 0.2)',
                  }}
                />
                <Button
                  onClick={handleRemoveBanner}
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
                    '&:hover': {
                      background: 'rgba(244, 67, 54, 1)',
                    },
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
                  '&:hover': {
                    border: '2px dashed rgba(207, 48, 170, 0.5)',
                    background: 'rgba(207, 48, 170, 0.05)',
                    color: '#cf30aa',
                  },
                }}
              >
                <input type="file" hidden accept="image/*" onChange={handleBannerSelect} />
                🖼️ Click to upload event banner
              </Button>
            )}
          </div>

          {/* Location */}
          <TextField
            label="Location"
            fullWidth
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
              },
              '& .MuiInputLabel-root': {
                color: '#a099d8',
                fontFamily: "'Space Grotesk', sans-serif",
              },
            }}
          />

          {/* Start Time */}
          <TextField
            label="Start Time"
            type="datetime-local"
            fullWidth
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
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
              },
              '& .MuiInputLabel-root': {
                color: '#a099d8',
                fontFamily: "'Space Grotesk', sans-serif",
              },
            }}
          />

          {/* End Time */}
          <TextField
            label="End Time"
            type="datetime-local"
            fullWidth
            required
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
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
              },
              '& .MuiInputLabel-root': {
                color: '#a099d8',
                fontFamily: "'Space Grotesk', sans-serif",
              },
            }}
          />

          {/* Registration Link */}
          <TextField
            label="Registration Link (Optional)"
            fullWidth
            value={formData.registrationLink}
            onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
            placeholder="https://forms.example.com/register"
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
              },
              '& .MuiInputLabel-root': {
                color: '#a099d8',
                fontFamily: "'Space Grotesk', sans-serif",
              },
            }}
          />

          {/* Registration Deadline */}
          <TextField
            label="Registration Deadline (Optional)"
            type="datetime-local"
            fullWidth
            value={formData.registrationDeadline}
            onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
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
              },
              '& .MuiInputLabel-root': {
                color: '#a099d8',
                fontFamily: "'Space Grotesk', sans-serif",
              },
            }}
          />

          {/* OD Provided */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.odProvided}
                onChange={(e) => setFormData({ ...formData, odProvided: e.target.checked })}
                sx={{
                  color: '#a099d8',
                  '&.Mui-checked': {
                    color: '#cf30aa',
                  },
                }}
              />
            }
            label="OD (On Duty) Provided"
            sx={{
              '& .MuiFormControlLabel-label': {
                color: '#ffffff',
                fontFamily: "'Space Grotesk', sans-serif",
              },
            }}
          />
        </div>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 2,
          borderTop: '1px solid rgba(160, 153, 216, 0.15)',
        }}
      >
        <Button
          onClick={handleClose}
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
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(160, 153, 216, 0.5)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={creating}
          sx={{
            background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
            color: 'white',
            borderRadius: '8px',
            padding: '10px 32px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #cf30aa, #dfa2da)',
            },
            '&:disabled': {
              opacity: 0.6,
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          {creating ? 'Creating...' : 'Create Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateEventModal;

