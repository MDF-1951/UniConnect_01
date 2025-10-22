import React from 'react';
import styled from 'styled-components';

const StayHardLoader = () => {
  return (
    <StyledWrapper>
      <div className="loader-wrapper">
        <span className="loader-letter">S</span>
        <span className="loader-letter">t</span>
        <span className="loader-letter">a</span>
        <span className="loader-letter">y</span>
        <span className="loader-letter"> </span>
        <span className="loader-letter">H</span>
        <span className="loader-letter">a</span>
        <span className="loader-letter">r</span>
        <span className="loader-letter">d</span>
        <div className="loader" />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loader-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    width: auto;
    margin: 2rem;

    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.6em;
    font-weight: 700;
    user-select: none;
    color: #fff;

    scale: 1.5;
  }

  .loader {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 1;

    background-color: transparent;
    mask: repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 6px,
      black 7px,
      black 8px
    );
  }

  .loader::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    background-image: radial-gradient(circle at 50% 50%, #cf30aa 0%, transparent 50%),
      radial-gradient(circle at 45% 45%, #402fb5 0%, transparent 45%),
      radial-gradient(circle at 55% 55%, #dfa2da 0%, transparent 45%),
      radial-gradient(circle at 45% 55%, #a099d8 0%, transparent 45%),
      radial-gradient(circle at 55% 45%, #8a7ba8 0%, transparent 45%);
    mask: radial-gradient(
      circle at 50% 50%,
      transparent 0%,
      transparent 10%,
      black 25%
    );
    animation:
      transform-animation 2s infinite alternate,
      opacity-animation 4s infinite;
    animation-timing-function: cubic-bezier(0.6, 0.8, 0.5, 1);
  }

  @keyframes transform-animation {
    0% {
      transform: translate(-55%);
    }
    100% {
      transform: translate(55%);
    }
  }

  @keyframes opacity-animation {
    0%,
    100% {
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    65% {
      opacity: 0;
    }
  }

  .loader-letter {
    display: inline-block;
    opacity: 0;
    animation: loader-letter-anim 4s infinite linear;
    z-index: 2;
  }

  .loader-letter:nth-child(1) {
    animation-delay: 0.1s;
  }
  .loader-letter:nth-child(2) {
    animation-delay: 0.2s;
  }
  .loader-letter:nth-child(3) {
    animation-delay: 0.3s;
  }
  .loader-letter:nth-child(4) {
    animation-delay: 0.4s;
  }
  .loader-letter:nth-child(5) {
    animation-delay: 0.5s;
  }
  .loader-letter:nth-child(6) {
    animation-delay: 0.6s;
  }
  .loader-letter:nth-child(7) {
    animation-delay: 0.7s;
  }
  .loader-letter:nth-child(8) {
    animation-delay: 0.8s;
  }
  .loader-letter:nth-child(9) {
    animation-delay: 0.9s;
  }

  @keyframes loader-letter-anim {
    0% {
      opacity: 0;
    }
    5% {
      opacity: 1;
      text-shadow: 0 0 8px #cf30aa, 0 0 16px #402fb5;
      transform: scale(1.15) translateY(-3px);
    }
    20% {
      opacity: 0.3;
    }
    100% {
      opacity: 0;
    }
  }
`;

export default StayHardLoader;




