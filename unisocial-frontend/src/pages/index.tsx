import React from 'react';

// Placeholder components - will be replaced with actual designs
const LoginPage: React.FC = () => {
  return (
    <div>
      <h1>Login Page - Design Pending</h1>
      <p>Waiting for design specifications...</p>
    </div>
  );
};

// RegisterPage is now in RegisterPage.tsx
export { default as RegisterPage } from './RegisterPage';

// DashboardPage is now in DashboardPage.tsx
export { default as DashboardPage } from './DashboardPage';

// ChatPage is now in ChatPage.tsx
export { default as ChatPage } from './ChatPage';

// ProfilePage is now in ProfilePage.tsx
export { default as ProfilePage } from './ProfilePage';

// ClubsPage is now in ClubsPage.tsx
export { default as ClubsPage } from './ClubsPage';

// ClubProfilePage is now in ClubProfilePage.tsx
export { default as ClubProfilePage } from './ClubProfilePage';

// ClubViewPage is now in ClubViewPage.tsx
export { default as ClubViewPage } from './ClubViewPage';
export { default as EventsPage } from './EventsPage';

// CreatePostPage is now in CreatePostPage.tsx
export { default as CreatePostPage } from './CreatePostPage';

const AdminPage: React.FC = () => {
  return (
    <div>
      <h1>Admin Page - Design Pending</h1>
      <p>Waiting for design specifications...</p>
    </div>
  );
};

// Export AdminOverviewPage
export { default as AdminOverviewPage } from './AdminOverviewPage';

// Export ProfileCompletionPage
export { default as ProfileCompletionPage } from './ProfileCompletionPage';

export {
  LoginPage,
  AdminPage,
};
