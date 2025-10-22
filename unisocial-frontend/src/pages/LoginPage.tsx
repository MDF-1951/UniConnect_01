import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { Alert, Snackbar } from '@mui/material';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Add event listeners to track video state
    const handlePlay = () => {
      console.log('Video play event');
      setVideoPlaying(true);
    };
    
    const handlePause = () => {
      console.log('Video pause event - attempting to resume');
      // If video pauses unexpectedly, try to play again
      if (videoRef.current && !videoRef.current.ended) {
        videoRef.current.play().catch(err => {
          console.log('Could not resume, showing play button');
          setVideoPlaying(false);
        });
      }
    };
    
    const handleEnded = () => {
      console.log('Video ended event');
    };

    const handleLoadedData = () => {
      console.log('Video loaded, attempting autoplay');
      // Try to autoplay when video is loaded
      if (video) {
        video.muted = true;
        video.play()
          .then(() => {
            console.log('Autoplay successful (muted)');
            setVideoPlaying(true);
            // Unmute after successful play
            setTimeout(() => {
              if (video) {
                video.muted = false;
                console.log('Video unmuted');
              }
            }, 1000);
          })
          .catch(err => {
            console.log('Autoplay prevented:', err);
            setVideoPlaying(false);
          });
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadeddata', handleLoadedData);

    // Cleanup
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);

  const handlePlayVideo = () => {
    console.log('Play button clicked');
    if (videoRef.current) {
      console.log('Video element found, attempting to play');
      videoRef.current.muted = false;
      videoRef.current.play()
        .then(() => {
          console.log('Video playing successfully');
          setVideoPlaying(true);
        })
        .catch(err => {
          console.error('Play error:', err);
          setVideoPlaying(false);
        });
    } else {
      console.error('Video element not found');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login...');
      await login(email, password);
      console.log('Login successful, navigating to dashboard...');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="grid" />
      
      {/* Background Container */}
      <div className="login-container">
        
        {/* Header Section */}
        <div className="header-section">
          <h1 className="logo">Uni<span className="lowercase">connect</span></h1>
          <p className="subtitle">— your campus, connected.</p>
        </div>

        {/* Video Section */}
        <div className="video-section">
          <div className="video-container">
            <video 
              ref={videoRef}
              loop 
              playsInline
              className="background-video"
              preload="auto"
            >
              <source src="/login-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {!videoPlaying && (
              <div className="play-button-overlay" onClick={handlePlayVideo}>
                <div className="play-button">
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="38" stroke="url(#playGradient)" strokeWidth="3" opacity="0.8"/>
                    <path d="M32 25L55 40L32 55V25Z" fill="url(#playGradient)"/>
                    <defs>
                      <linearGradient id="playGradient" gradientTransform="rotate(45)">
                        <stop stopColor="#a099d8" offset="0%" />
                        <stop stopColor="#cf30aa" offset="100%" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <p className="play-text">Click to Play</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content and Login Section */}
        <div className="bottom-section">
          {/* Left Side - Content */}
          <div className="content-section">
            <div className="content-paragraphs">
              <p className="content-text">
                UniConnect is a campus-wide social platform built to bring students, clubs, and events together in one place.
                It helps you discover what's happening around campus — from club updates to upcoming events — and connect with peers who share your interests.
              </p>
              
              <p className="content-text">
                Beyond just event updates, UniConnect is about networking, collaboration, and recognition.
                Students can share achievements, join communities, and stay informed about everything that makes campus life vibrant and connected.
              </p>
            </div>

            {/* Eye-catching Tagline */}
            <div className="tagline-box">
              <p className="tagline-text">
                A single space where your campus comes alive — connect, engage, and grow together with <span className="highlight">UniConnect</span>.
              </p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="form-section">
            <div className="form-box-container">
              {/* Login Box */}
              <div className="login-box">
              <form onSubmit={handleLogin}>
                
                {/* Email Input */}
                <div className="input-wrapper">
                  <div id="poda">
                    <div className="glow" />
                    <div className="darkBorderBg" />
                    <div className="darkBorderBg" />
                    <div className="darkBorderBg" />
                    <div className="white" />
                    <div className="border" />
                    <div id="main">
                      <input 
                        placeholder="Email Address" 
                        type="email" 
                        name="email" 
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <div id="input-mask" />
                      <div id="pink-mask" />
                      <div className="filterBorder" />
                      <div id="email-icon">
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="url(#emailGradient)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M22 6L12 13L2 6" stroke="url(#emailGradient)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                          <defs>
                            <linearGradient id="emailGradient" gradientTransform="rotate(50)">
                              <stop stopColor="#f8e7f8" offset="0%" />
                              <stop stopColor="#b6a9b7" offset="50%" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Input */}
                <div className="input-wrapper">
                  <div id="poda">
                    <div className="glow" />
                    <div className="darkBorderBg" />
                    <div className="darkBorderBg" />
                    <div className="darkBorderBg" />
                    <div className="white" />
                    <div className="border" />
                    <div id="main">
                      <input 
                        placeholder="Password" 
                        type="password" 
                        name="password" 
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <div id="input-mask" />
                      <div id="pink-mask" />
                      <div className="filterBorder" />
                      <div id="password-icon">
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                          <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="url(#lockGradient)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="url(#lockGradient)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                          <defs>
                            <linearGradient id="lockGradient" gradientTransform="rotate(50)">
                              <stop stopColor="#f8e7f8" offset="0%" />
                              <stop stopColor="#b6a9b7" offset="50%" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Login Button */}
                <button type="submit" className="login-btn" disabled={loading}>
                  <span className="btn-glow-container">
                    <span className="btn-glow-inner">
                      <span className="btn-glow-blob" />
                    </span>
                  </span>
                  <span className="btn-border-glow">
                    <span className="btn-border-glow-light" />
                  </span>
                  <span className="btn-inner">
                    <span className="btn-label">
                      {loading ? 'Signing In...' : 'Sign In'}
                    </span>
                  </span>
                </button>
              </form>
            </div>

              {/* Register Section - Outside Box */}
              <div className="register-section">
                <p className="register-text">Don't have an account?</p>
                <button 
                  type="button" 
                  className="register-btn"
                  onClick={() => navigate('/register')}
                >
                  <span className="btn-glow-container">
                    <span className="btn-glow-inner">
                      <span className="btn-glow-blob" />
                    </span>
                  </span>
                  <span className="btn-border-glow">
                    <span className="btn-border-glow-light" />
                  </span>
                  <span className="btn-inner btn-inner-register">
                    <span className="btn-label btn-label-register">
                      Register Now
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  background: #000000;
  background-image: 
    radial-gradient(at 47% 33%, hsl(262, 47%, 15%) 0, transparent 59%), 
    radial-gradient(at 82% 65%, hsl(288, 39%, 18%) 0, transparent 55%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px;

  .grid {
    height: 100vh;
    width: 100vw;
    background-image: linear-gradient(to right, #0f0f10 1px, transparent 1px),
      linear-gradient(to bottom, #0f0f10 1px, transparent 1px);
    background-size: 1rem 1rem;
    background-position: center center;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 0;
    filter: blur(1px);
    opacity: 0.5;
  }

  .login-container {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    max-width: 1400px;
    width: 100%;
  }

  /* Header Section */
  .header-section {
    text-align: center;
    margin-bottom: 30px;
    max-width: 900px;
  }

  .logo {
    font-size: 96px;
    font-weight: 400;
    font-family: 'Playlist Script', 'Pacifico', 'Brush Script MT', cursive !important;
    background: linear-gradient(135deg, #a099d8 0%, #cf30aa 50%, #dfa2da 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    margin-bottom: 8px;
    letter-spacing: 1px;
    text-shadow: 0 0 40px rgba(207, 48, 170, 0.3);
    filter: drop-shadow(0 0 20px rgba(207, 48, 170, 0.4));
    font-style: normal;
    line-height: 1.2;
  }

  .logo .lowercase {
    text-transform: lowercase;
  }

  .subtitle {
    font-size: 22px;
    font-family: 'Poppins', sans-serif;
    font-weight: 300;
    color: #dfa2da;
    margin: 0;
    margin-bottom: 15px;
    letter-spacing: 0.5px;
    font-style: italic;
  }

  /* Bottom Section - Content and Form */
  .bottom-section {
    display: flex;
    gap: 80px;
    width: 100%;
    max-width: 1400px;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0 40px;
  }

  /* Left Side Content */
  .content-section {
    flex: 1;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 35px;
    padding-right: 20px;
  }

  .content-paragraphs {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .content-text {
    font-family: 'Space Grotesk', 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: #d4d0d6;
    line-height: 1.75;
    margin: 0;
    text-align: left;
    letter-spacing: 0.2px;
  }

  /* Eye-catching Tagline Box */
  .tagline-box {
    background: linear-gradient(135deg, rgba(64, 47, 181, 0.15), rgba(207, 48, 170, 0.15));
    border: 2px solid transparent;
    background-image: 
      linear-gradient(rgba(26, 24, 40, 0.9), rgba(26, 24, 40, 0.9)),
      linear-gradient(135deg, #402fb5, #cf30aa);
    background-origin: border-box;
    background-clip: padding-box, border-box;
    border-radius: 12px;
    padding: 18px 24px;
    box-shadow: 
      0 6px 24px rgba(207, 48, 170, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;
  }

  .tagline-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top left, rgba(160, 153, 216, 0.1), transparent 50%);
    pointer-events: none;
  }

  .tagline-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 500;
    color: #e8dfe9;
    line-height: 1.6;
    margin: 0;
    text-align: left;
    position: relative;
    z-index: 1;
    letter-spacing: 0.2px;
  }

  .tagline-text .highlight {
    font-family: 'Playlist Script', cursive;
    font-size: 21px;
    background: linear-gradient(135deg, #a099d8 0%, #cf30aa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 400;
    position: relative;
    top: 2px;
  }

  /* Video Section */
  .video-section {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
  }

  .video-container {
    position: relative;
    width: 800px;
    height: 450px;
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 
      0 0 60px rgba(160, 153, 216, 0.3),
      0 0 100px rgba(207, 48, 170, 0.2);
    border: 2px solid transparent;
    background: linear-gradient(#000, #000) padding-box,
                linear-gradient(135deg, #402fb5, #cf30aa) border-box;
  }

  .background-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-button-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
  }

  .play-button-overlay:hover {
    background: rgba(0, 0, 0, 0.5);
  }

  .play-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    animation: pulse 2s ease-in-out infinite;
  }

  .play-button svg {
    filter: drop-shadow(0 0 20px rgba(207, 48, 170, 0.5));
    transition: transform 0.3s ease;
  }

  .play-button-overlay:hover .play-button svg {
    transform: scale(1.1);
  }

  .play-text {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    margin: 0;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  /* Form Section */
  .form-section {
    display: flex;
    justify-content: flex-end;
    flex: 0 0 auto;
  }

  .form-box-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 20px;
    width: 450px;
  }

  .login-box {
    background: rgba(16, 15, 28, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 35px 45px;
    border: 2px solid transparent;
    background-image: 
      linear-gradient(rgba(16, 15, 28, 0.8), rgba(16, 15, 28, 0.8)),
      linear-gradient(135deg, #402fb5, #cf30aa);
    background-origin: border-box;
    background-clip: padding-box, border-box;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 60px rgba(160, 153, 216, 0.15);
    width: 100%;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }

  .input-wrapper {
    margin-bottom: 0;
  }

  /* Input Styling - From Component */
  .white,
  .border,
  .darkBorderBg,
  .glow {
    max-height: 70px;
    max-width: 314px;
    height: 100%;
    width: 100%;
    position: absolute;
    overflow: hidden;
    z-index: -1;
    border-radius: 12px;
    filter: blur(3px);
  }

  .input {
    background-color: #010201;
    border: none;
    width: 301px;
    height: 56px;
    border-radius: 10px;
    color: white;
    padding-inline: 59px;
    font-size: 18px;
    font-family: 'Space Grotesk', sans-serif;
  }

  #poda {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .input::placeholder {
    color: #8a8494;
    opacity: 1;
    position: relative;
    z-index: 2;
  }

  .input:focus {
    outline: none;
  }

  #main:focus-within > #input-mask {
    display: none;
  }

  #input-mask {
    pointer-events: none;
    width: 100px;
    height: 20px;
    position: absolute;
    background: linear-gradient(90deg, transparent, rgba(1, 2, 1, 0.9));
    top: 18px;
    left: 70px;
    z-index: 1;
  }

  #pink-mask {
    pointer-events: none;
    width: 30px;
    height: 20px;
    position: absolute;
    background: #cf30aa;
    top: 10px;
    left: 5px;
    filter: blur(20px);
    opacity: 0.8;
    transition: all 2s;
  }

  #main:hover > #pink-mask {
    opacity: 0;
  }

  .white {
    max-height: 63px;
    max-width: 307px;
    border-radius: 10px;
    filter: blur(2px);
  }

  .white::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(83deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    filter: brightness(1.4);
    background-image: conic-gradient(
      rgba(0, 0, 0, 0) 0%,
      #a099d8,
      rgba(0, 0, 0, 0) 8%,
      rgba(0, 0, 0, 0) 50%,
      #dfa2da,
      rgba(0, 0, 0, 0) 58%
    );
    transition: all 2s;
  }

  .border {
    max-height: 59px;
    max-width: 303px;
    border-radius: 11px;
    filter: blur(0.5px);
  }

  .border::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(70deg);
    position: absolute;
    width: 600px;
    height: 600px;
    filter: brightness(1.3);
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #1c191c,
      #402fb5 5%,
      #1c191c 14%,
      #1c191c 50%,
      #cf30aa 60%,
      #1c191c 64%
    );
    transition: all 2s;
  }

  .darkBorderBg {
    max-height: 65px;
    max-width: 312px;
  }

  .darkBorderBg::before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(82deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      rgba(0, 0, 0, 0),
      #18116a,
      rgba(0, 0, 0, 0) 10%,
      rgba(0, 0, 0, 0) 50%,
      #6e1b60,
      rgba(0, 0, 0, 0) 60%
    );
    transition: all 2s;
  }

  #poda:hover > .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(-98deg);
  }

  #poda:hover > .glow::before {
    transform: translate(-50%, -50%) rotate(-120deg);
  }

  #poda:hover > .white::before {
    transform: translate(-50%, -50%) rotate(-97deg);
  }

  #poda:hover > .border::before {
    transform: translate(-50%, -50%) rotate(-110deg);
  }

  #poda:focus-within > .darkBorderBg::before {
    transform: translate(-50%, -50%) rotate(442deg);
    transition: all 4s;
  }

  #poda:focus-within > .glow::before {
    transform: translate(-50%, -50%) rotate(420deg);
    transition: all 4s;
  }

  #poda:focus-within > .white::before {
    transform: translate(-50%, -50%) rotate(443deg);
    transition: all 4s;
  }

  #poda:focus-within > .border::before {
    transform: translate(-50%, -50%) rotate(430deg);
    transition: all 4s;
  }

  .glow {
    overflow: hidden;
    filter: blur(30px);
    opacity: 0.4;
    max-height: 130px;
    max-width: 354px;
  }

  .glow:before {
    content: "";
    z-index: -2;
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(60deg);
    position: absolute;
    width: 999px;
    height: 999px;
    background-repeat: no-repeat;
    background-position: 0 0;
    background-image: conic-gradient(
      #000,
      #402fb5 5%,
      #000 38%,
      #000 50%,
      #cf30aa 60%,
      #000 87%
    );
    transition: all 2s;
  }

  #email-icon,
  #password-icon {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    max-height: 40px;
    max-width: 38px;
    height: 100%;
    width: 100%;
    isolation: isolate;
    overflow: hidden;
    border-radius: 10px;
    background: linear-gradient(180deg, #161329, black, #1d1b4b);
    border: 1px solid transparent;
  }

  .filterBorder {
    height: 42px;
    width: 40px;
    position: absolute;
    overflow: hidden;
    top: 7px;
    left: 7px;
    border-radius: 10px;
  }

  .filterBorder::before {
    content: "";
    text-align: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
    position: absolute;
    width: 600px;
    height: 600px;
    background-repeat: no-repeat;
    background-position: 0 0;
    filter: brightness(1.35);
    background-image: conic-gradient(
      rgba(0, 0, 0, 0),
      #3d3a4f,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0) 50%,
      #3d3a4f,
      rgba(0, 0, 0, 0) 100%
    );
    animation: rotate 4s linear infinite;
  }

  #main {
    position: relative;
  }

  @keyframes rotate {
    100% {
      transform: translate(-50%, -50%) rotate(450deg);
    }
  }

  /* Animated Button - Login */
  .login-btn {
    position: relative;
    background: #1a1828;
    border-radius: 50px;
    padding: 2px;
    overflow: hidden;
    border: none;
    cursor: pointer;
    width: 100%;
    margin-top: 10px;
    transition: transform 0.2s ease;
  }

  .login-btn:hover {
    transform: translateY(-1px);
  }

  .login-btn:active {
    transform: translateY(0);
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Glow Container */
  .btn-glow-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50px;
    overflow: hidden;
  }

  .btn-glow-inner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    user-select: none;
  }

  .btn-glow-blob {
    display: block;
    width: 96px;
    height: 96px;
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(-50%, -30%);
    filter: blur(40px);
    background: linear-gradient(135deg, #402fb5, #cf30aa, #dfa2da);
    animation: glow-pulse 8s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%, 100% {
      opacity: 0.6;
      transform: translate(-50%, -30%) scale(1);
    }
    50% {
      opacity: 0.9;
      transform: translate(-50%, -30%) scale(1.2);
    }
  }

  /* Border Glow */
  .btn-border-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    user-select: none;
    animation: border-rotate 8s linear infinite;
  }

  .btn-border-glow-light {
    display: block;
    height: 100%;
    width: 48px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 50px;
    filter: blur(25px);
    background: linear-gradient(135deg, #402fb5, #cf30aa, #dfa2da);
    animation: border-scale 8s ease-in-out infinite;
  }

  @keyframes border-rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes border-scale {
    0%, 100% {
      transform: translateX(-50%) scaleY(1);
    }
    50% {
      transform: translateX(-50%) scaleY(1.4);
    }
  }

  /* Button Inner Content */
  .btn-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    background: rgba(10, 8, 18, 0.95);
    border-radius: 48px;
    padding: 14px 32px;
    width: 100%;
    transition: transform 0.2s ease;
  }

  .login-btn:active .btn-inner {
    transform: scale(0.98);
  }

  .btn-label {
    background: linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.6));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 17px;
    font-weight: 600;
    transition: transform 0.3s ease;
  }

  .login-btn:hover .btn-label {
    transform: scale(1.05);
  }

  .login-btn:disabled:hover .btn-label {
    transform: scale(1);
  }

  /* Register Section */
  .register-section {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .register-text {
    color: #b6a9b7;
    font-size: 13px;
    margin: 0;
  }

  /* Register Button */
  .register-btn {
    position: relative;
    background: #1a1828;
    border-radius: 50px;
    padding: 2px;
    overflow: hidden;
    border: none;
    cursor: pointer;
    max-width: 200px;
    transition: transform 0.2s ease;
  }

  .register-btn:hover {
    transform: translateY(-1px);
  }

  .register-btn:active {
    transform: translateY(0);
  }

  .btn-inner-register {
    background: rgba(10, 8, 18, 0.9);
    padding: 10px 28px;
  }

  .btn-label-register {
    font-size: 15px;
    background: linear-gradient(to bottom, #dfa2da, #a099d8);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .register-btn:hover .btn-label-register {
    background: linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.7));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Responsive Design */
  @media (max-width: 1100px) {
    .bottom-section {
      flex-direction: column;
      align-items: center;
      gap: 40px;
    }

    .content-section {
      max-width: 700px;
    }

    .form-section {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 900px) {
    .video-container {
      width: 100%;
      max-width: 600px;
      height: 350px;
    }

    .form-box-container {
      align-items: center;
    }

    .register-section {
      align-items: center;
      text-align: center;
    }

    .content-section {
      padding: 0 20px;
    }
  }

  @media (max-width: 600px) {
    .logo {
      font-size: 64px;
    }

    .subtitle {
      font-size: 18px;
    }

    .content-text {
      font-size: 14px;
    }

    .tagline-text {
      font-size: 15px;
    }

    .tagline-text .highlight {
      font-size: 19px;
    }

    .video-container {
      height: 250px;
      border-radius: 20px;
    }

    .input {
      width: 280px;
    }

    .login-btn,
    .register-btn {
      width: 100%;
    }

    .login-box {
      padding: 25px 30px;
    }

    .tagline-box {
      padding: 16px 20px;
    }

    .tagline-text {
      font-size: 14px;
    }

    .tagline-text .highlight {
      font-size: 18px;
    }
  }
`;

export default LoginPage;
