import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import apiService from '../services/api';
import { Event } from '../types';
import EventDetailModal from '../components/EventDetailModal';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EventIcon from '@mui/icons-material/Event';

const EventsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadEventsForMonth();
  }, [currentDate]);

  const loadEventsForMonth = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const eventsData = await apiService.getAllEvents(year, month);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
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

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDay = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getFullYear() === targetDate.getFullYear() &&
        eventDate.getMonth() === targetDate.getMonth() &&
        eventDate.getDate() === targetDate.getDate()
      );
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<CalendarDay key={`empty-${i}`} isEmpty />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <CalendarDay key={day} isToday={isToday}>
          <DayNumber>{day}</DayNumber>
          <EventsContainer>
            {dayEvents.slice(0, 3).map((event) => (
              <EventChip
                key={event.eventId}
                onClick={() => handleEventClick(event)}
                title={event.title}
              >
                <EventDot />
                <EventTitle>{event.title}</EventTitle>
              </EventChip>
            ))}
            {dayEvents.length > 3 && (
              <MoreEventsIndicator>+{dayEvents.length - 3} more</MoreEventsIndicator>
            )}
          </EventsContainer>
        </CalendarDay>
      );
    }

    return days;
  };

  return (
    <PageContainer>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none', mb: 2 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/home')}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Title>Events</Title>

          <div style={{ marginLeft: 'auto' }} />

          <Avatar
            onClick={handleMenuClick}
            sx={{
              width: 40,
              height: 40,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #402fb5, #cf30aa)',
            }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(160, 153, 216, 0.2)',
                borderRadius: '8px',
                mt: 1,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                navigate('/profile');
                handleMenuClose();
              }}
              sx={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: '#ffffff',
                '&:hover': { background: 'rgba(160, 153, 216, 0.1)' },
              }}
            >
              Profile
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

      {/* Calendar Controls */}
      <CalendarControls>
        <MonthDisplay>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </MonthDisplay>
        <ControlButtons>
          <Button
            variant="outlined"
            onClick={handleToday}
            sx={{
              border: '1.5px solid rgba(160, 153, 216, 0.3)',
              color: '#a099d8',
              borderRadius: '8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#cf30aa',
                background: 'rgba(207, 48, 170, 0.1)',
              },
            }}
          >
            Today
          </Button>
          <IconButton
            onClick={handlePreviousMonth}
            sx={{
              color: '#a099d8',
              '&:hover': {
                color: '#cf30aa',
                background: 'rgba(207, 48, 170, 0.1)',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={handleNextMonth}
            sx={{
              color: '#a099d8',
              '&:hover': {
                color: '#cf30aa',
                background: 'rgba(207, 48, 170, 0.1)',
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </ControlButtons>
      </CalendarControls>

      {/* Calendar Grid */}
      <CalendarContainer>
        {/* Weekday Headers */}
        <WeekdayHeaders>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <WeekdayHeader key={day}>{day}</WeekdayHeader>
          ))}
        </WeekdayHeaders>

        {/* Calendar Days */}
        <CalendarGrid>{renderCalendarDays()}</CalendarGrid>

        {loading && (
          <LoadingOverlay>
            <p>Loading events...</p>
          </LoadingOverlay>
        )}
      </CalendarContainer>

      {/* Event Detail Modal */}
      <EventDetailModal
        open={isEventDetailOpen}
        onClose={() => setIsEventDetailOpen(false)}
        event={selectedEvent}
      />
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 0 20px 40px 20px;
`;

const Title = styled.h1`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
`;

const CalendarControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const MonthDisplay = styled.h2`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const CalendarContainer = styled.div`
  background: rgba(16, 15, 28, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(160, 153, 216, 0.2);
  padding: 24px;
  position: relative;
`;

const WeekdayHeaders = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const WeekdayHeader = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #a099d8;
  text-align: center;
  padding: 12px;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  min-height: 500px;
`;

const CalendarDay = styled.div<{ isEmpty?: boolean; isToday?: boolean }>`
  background: ${(props) =>
    props.isEmpty
      ? 'transparent'
      : props.isToday
      ? 'rgba(207, 48, 170, 0.1)'
      : 'rgba(255, 255, 255, 0.02)'};
  border: 1px solid
    ${(props) =>
      props.isEmpty
        ? 'transparent'
        : props.isToday
        ? '#cf30aa'
        : 'rgba(160, 153, 216, 0.1)'};
  border-radius: 8px;
  padding: 8px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  ${(props) =>
    !props.isEmpty &&
    `
    &:hover {
      border-color: rgba(160, 153, 216, 0.3);
      background: rgba(255, 255, 255, 0.05);
    }
  `}
`;

const DayNumber = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
`;

const EventsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
  max-height: 80px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(160, 153, 216, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(207, 48, 170, 0.5);
    border-radius: 4px;
  }
`;

const EventChip = styled.div`
  background: linear-gradient(135deg, #402fb5, #cf30aa);
  border-radius: 4px;
  padding: 4px 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(207, 48, 170, 0.3);
  }
`;

const EventDot = styled.div`
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  flex-shrink: 0;
`;

const EventTitle = styled.span`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MoreEventsIndicator = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10px;
  color: #a099d8;
  padding: 2px 4px;
  text-align: center;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(16, 15, 28, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;

  p {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    color: #a099d8;
  }
`;

export default EventsPage;

