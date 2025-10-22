import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Import pages (we'll create these as you provide designs)
import LoginPage from './pages/LoginPage';
import { 
  RegisterPage, 
  DashboardPage, 
  ProfilePage, 
  ClubsPage, 
  ClubProfilePage,
  ClubViewPage,
  CreatePostPage,
  ChatPage, 
  AdminPage,
  EventsPage,
  AdminOverviewPage,
  ProfileCompletionPage
} from './pages';
import LoadingSpinner from './components/LoadingSpinner';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
            <Box sx={{ minHeight: '100vh' }}>
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/register" 
                  element={<RegisterPage />} 
                />

                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile/:userId" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/clubs" 
                  element={
                    <ProtectedRoute>
                      <ClubsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/events" 
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/club-view/:clubId" 
                  element={
                    <ProtectedRoute>
                      <ClubViewPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/club-profile/:clubId" 
                  element={
                    <ProtectedRoute>
                      <ClubProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create-post" 
                  element={
                    <ProtectedRoute>
                      <CreatePostPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/complete-profile" 
                  element={
                    <ProtectedRoute>
                      <ProfileCompletionPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminOverviewPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Box>
          </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;