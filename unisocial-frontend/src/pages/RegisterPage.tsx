import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { Alert, Snackbar } from '@mui/material';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long!');
      return;
    }

    if (!formData.email.endsWith('@vitstudent.ac.in')) {
      setError('Please use your VIT student email (@vitstudent.ac.in)');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting registration...');
      await register(formData.regNo, formData.email, formData.password, formData.name);
      console.log('Registration successful, navigating to profile completion...');
      navigate('/complete-profile');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="grid" />
      
      {/* Background Container */}
      <div className="register-container">
        
        {/* Header Section */}
        <div className="header-section">
          <h1 className="logo">Join Uni<span className="lowercase">connect</span></h1>
          <p className="subtitle">Create your account and start connecting!</p>
        </div>

        {/* Main Content */}
        <div className="content-wrapper">
          
          {/* Left Side - Welcome Message */}
          <div className="welcome-section">
            <div className="welcome-card">
              <div className="icon-container">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#starGradient)" stroke="url(#starGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="starGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#a099d8" />
                      <stop offset="0.5" stopColor="#cf30aa" />
                      <stop offset="1" stopColor="#dfa2da" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2 className="welcome-title">Welcome to UniConnect</h2>
              <p className="welcome-text">
                Join thousands of students connecting, collaborating, and celebrating campus life together.
              </p>
              
              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Discover campus events</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Join clubs & communities</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Connect with peers</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Share achievements</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="form-section">
            <div className="form-box">
              <h2 className="form-title">Create Account</h2>
              
              <form onSubmit={handleSubmit}>
                
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label">Full Name</label>
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
                          placeholder="Enter your full name" 
                          type="text" 
                          name="name" 
                          className="input"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                        <div id="input-mask" />
                        <div id="pink-mask" />
                        <div className="filterBorder" />
                        <div id="input-icon">
                          <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="url(#userGradient)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="url(#userGradient)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <defs>
                              <linearGradient id="userGradient" gradientTransform="rotate(50)">
                                <stop stopColor="#f8e7f8" offset="0%" />
                                <stop stopColor="#b6a9b7" offset="50%" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Number */}
                <div className="form-group">
                  <label className="form-label">Registration Number</label>
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
                          placeholder="e.g., 21BCE1234" 
                          type="text" 
                          name="regNo" 
                          className="input"
                          value={formData.regNo}
                          onChange={handleChange}
                          required
                        />
                        <div id="input-mask" />
                        <div id="pink-mask" />
                        <div className="filterBorder" />
                        <div id="input-icon">
                          <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="url(#regGradient)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 2V8H20" stroke="url(#regGradient)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <defs>
                              <linearGradient id="regGradient" gradientTransform="rotate(50)">
                                <stop stopColor="#f8e7f8" offset="0%" />
                                <stop stopColor="#b6a9b7" offset="50%" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">VIT Email</label>
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
                          placeholder="yourname@vitstudent.ac.in" 
                          type="email" 
                          name="email" 
                          className="input"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        <div id="input-mask" />
                        <div id="pink-mask" />
                        <div className="filterBorder" />
                        <div id="input-icon">
                          <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="url(#emailGradient2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 6L12 13L2 6" stroke="url(#emailGradient2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <defs>
                              <linearGradient id="emailGradient2" gradientTransform="rotate(50)">
                                <stop stopColor="#f8e7f8" offset="0%" />
                                <stop stopColor="#b6a9b7" offset="50%" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password</label>
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
                          placeholder="Create a strong password" 
                          type="password" 
                          name="password" 
                          className="input"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <div id="input-mask" />
                        <div id="pink-mask" />
                        <div className="filterBorder" />
                        <div id="input-icon">
                          <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="url(#lockGradient2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="url(#lockGradient2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <defs>
                              <linearGradient id="lockGradient2" gradientTransform="rotate(50)">
                                <stop stopColor="#f8e7f8" offset="0%" />
                                <stop stopColor="#b6a9b7" offset="50%" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
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
                          placeholder="Re-enter your password" 
                          type="password" 
                          name="confirmPassword" 
                          className="input"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                        <div id="input-mask" />
                        <div id="pink-mask" />
                        <div className="filterBorder" />
                        <div id="input-icon">
                          <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="url(#checkGradient)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M22 4L12 14.01L9 11.01" stroke="url(#checkGradient)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <defs>
                              <linearGradient id="checkGradient" gradientTransform="rotate(50)">
                                <stop stopColor="#f8e7f8" offset="0%" />
                                <stop stopColor="#b6a9b7" offset="50%" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <button type="submit" className="register-submit-btn" disabled={loading}>
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
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </span>
                  </span>
                </button>

                {/* Login Link */}
                <div className="login-link">
                  <p className="login-text">Already have an account?</p>
                  <button 
                    type="button" 
                    className="login-btn-link"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </button>
                </div>
              </form>
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
  padding: 40px 20px;

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

  .register-container {
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
  }

  .logo {
    font-size: 72px;
    font-weight: 400;
    font-family: 'Playlist Script', 'Pacifico', 'Brush Script MT', cursive !important;
    background: linear-gradient(135deg, #a099d8 0%, #cf30aa 50%, #dfa2da 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    margin-bottom: 8px;
    letter-spacing: 1px;
    filter: drop-shadow(0 0 20px rgba(207, 48, 170, 0.4));
    font-style: normal;
  }

  .logo .lowercase {
    text-transform: lowercase;
  }

  .subtitle {
    font-size: 20px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 300;
    color: #dfa2da;
    margin: 0;
    letter-spacing: 0.5px;
  }

  /* Content Wrapper */
  .content-wrapper {
    display: flex;
    gap: 60px;
    width: 100%;
    align-items: flex-start;
    justify-content: center;
  }

  /* Welcome Section */
  .welcome-section {
    flex: 0 0 400px;
  }

  .welcome-card {
    background: rgba(16, 15, 28, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 40px;
    border: 2px solid transparent;
    background-image: 
      linear-gradient(rgba(16, 15, 28, 0.6), rgba(16, 15, 28, 0.6)),
      linear-gradient(135deg, #402fb5, #cf30aa);
    background-origin: border-box;
    background-clip: padding-box, border-box;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 60px rgba(160, 153, 216, 0.1);
  }

  .icon-container {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .welcome-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 28px;
    font-weight: 600;
    background: linear-gradient(135deg, #dfa2da 0%, #a099d8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 16px 0;
    text-align: center;
  }

  .welcome-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    color: #c0b9c0;
    line-height: 1.7;
    text-align: center;
    margin-bottom: 32px;
  }

  .features-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: #d4d0d6;
  }

  .feature-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #402fb5, #cf30aa);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    flex-shrink: 0;
  }

  /* Form Section */
  .form-section {
    flex: 0 0 500px;
  }

  .form-box {
    background: rgba(16, 15, 28, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 40px;
    border: 2px solid transparent;
    background-image: 
      linear-gradient(rgba(16, 15, 28, 0.8), rgba(16, 15, 28, 0.8)),
      linear-gradient(135deg, #402fb5, #cf30aa);
    background-origin: border-box;
    background-clip: padding-box, border-box;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 0 60px rgba(160, 153, 216, 0.15);
  }

  .form-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 32px 0;
    text-align: center;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .form-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #b6a9b7;
    display: block;
    margin-bottom: 8px;
    margin-left: 4px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .input-wrapper {
    margin-bottom: 0;
  }

  /* Input Styling - From Login Component */
  .white,
  .border,
  .darkBorderBg,
  .glow {
    max-height: 70px;
    max-width: 98%;
    height: 100%;
    width: 98%;
    position: absolute;
    overflow: hidden;
    z-index: -1;
    border-radius: 12px;
    filter: blur(3px);
  }

  .input {
    background-color: #010201;
    border: none;
    width: 100%;
    height: 50px;
    border-radius: 10px;
    color: white;
    padding-inline: 50px;
    font-size: 15px;
    font-family: 'Space Grotesk', sans-serif;
  }

  #poda {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
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
    width: 80px;
    height: 18px;
    position: absolute;
    background: linear-gradient(90deg, transparent, rgba(1, 2, 1, 0.8));
    top: 16px;
    left: 55px;
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
    max-height: 55px;
    max-width: 97%;
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
    max-height: 53px;
    max-width: 96.5%;
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
    max-height: 58px;
    max-width: 97.5%;
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
    max-height: 105px;
    max-width: 94%;
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

  #input-icon {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    max-height: 34px;
    max-width: 34px;
    height: 100%;
    width: 100%;
    isolation: isolate;
    overflow: hidden;
    border-radius: 10px;
    background: linear-gradient(180deg, #161329, black, #1d1b4b);
    border: 1px solid transparent;
  }

  .filterBorder {
    height: 36px;
    width: 36px;
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
    width: 100%;
  }

  @keyframes rotate {
    100% {
      transform: translate(-50%, -50%) rotate(450deg);
    }
  }

  /* Register Submit Button */
  .register-submit-btn {
    position: relative;
    background: #1a1828;
    border-radius: 50px;
    padding: 2px;
    overflow: hidden;
    border: none;
    cursor: pointer;
    width: 100%;
    margin-top: 16px;
    transition: transform 0.2s ease;
  }

  .register-submit-btn:hover {
    transform: translateY(-1px);
  }

  .register-submit-btn:active {
    transform: translateY(0);
  }

  .register-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

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

  .register-submit-btn:active .btn-inner {
    transform: scale(0.98);
  }

  .btn-label {
    background: linear-gradient(to bottom, #ffffff, rgba(255, 255, 255, 0.6));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 17px;
    font-weight: 600;
    font-family: 'Space Grotesk', sans-serif;
    transition: transform 0.3s ease;
  }

  .register-submit-btn:hover .btn-label {
    transform: scale(1.05);
  }

  .register-submit-btn:disabled:hover .btn-label {
    transform: scale(1);
  }

  /* Login Link */
  .login-link {
    text-align: center;
    margin-top: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .login-text {
    font-family: 'Space Grotesk', sans-serif;
    color: #b6a9b7;
    font-size: 14px;
    margin: 0;
  }

  .login-btn-link {
    background: transparent;
    border: none;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 600;
    background: linear-gradient(135deg, #dfa2da, #a099d8);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .login-btn-link:hover {
    background: linear-gradient(135deg, #ffffff, #dfa2da);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    transform: scale(1.05);
  }

  /* Responsive Design */
  @media (max-width: 1100px) {
    .content-wrapper {
      flex-direction: column;
      align-items: center;
    }

    .welcome-section,
    .form-section {
      flex: none;
      max-width: 500px;
      width: 100%;
    }
  }

  @media (max-width: 600px) {
    padding: 20px 10px;

    .logo {
      font-size: 56px;
    }

    .subtitle {
      font-size: 16px;
    }

    .welcome-card,
    .form-box {
      padding: 30px 24px;
    }

    .welcome-section,
    .form-section {
      max-width: 100%;
    }

    .input {
      font-size: 14px;
    }
  }
`;

export default RegisterPage;
