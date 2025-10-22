import React from 'react';
import StayHardLoader from './StayHardLoader';
import styled from 'styled-components';

const LoadingSpinner: React.FC = () => {
  return (
    <LoadingContainer>
      <StayHardLoader />
    </LoadingContainer>
  );
};

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
`;

export default LoadingSpinner;
