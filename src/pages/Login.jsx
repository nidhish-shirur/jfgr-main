import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
  CircularProgress,
  Alert,
  Collapse
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const getEmailError = () => {
    if (!formData.email && touched.email) return 'Email is required';
    if (touched.email && !validateEmail(formData.email)) return 'Please enter a valid email';
    return '';
  };

  const getPasswordError = () => {
    if (!formData.password && touched.password) return 'Password is required';
    if (touched.password && formData.password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set all fields as touched
    setTouched({
      email: true,
      password: true
    });

    // Validate all fields
    const emailError = getEmailError();
    const passwordError = getPasswordError();

    if (emailError || passwordError) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Add actual authentication logic here
      console.log('Login attempt with:', formData);
      
      // Simulate error for demo
      if (formData.email === 'test@test.com') {
        throw new Error('Invalid credentials');
      }
      
      // If successful, navigate to home
      navigate('/');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const emailError = getEmailError();
  const passwordError = getPasswordError();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        py: 8,
        bgcolor: '#f8f9fa',
        backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(255,205,41,0.08) 0%, rgba(255,205,41,0) 25%), radial-gradient(circle at 85% 30%, rgba(51,51,51,0.05) 0%, rgba(51,51,51,0) 25%)',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              mb: 2,
              color: 'secondary.main'
            }}
          >
            Welcome Back
          </Typography>
          <Typography 
            sx={{ 
              color: 'text.secondary',
              fontSize: '1.1rem'
            }}
          >
            Login to your account to register complaints
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 4,
            bgcolor: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative elements */}
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 150,
              height: 150,
              background: 'radial-gradient(circle at top right, rgba(255,205,41,0.12) 0%, rgba(255,205,41,0) 70%)',
              borderRadius: '0 0 0 100%',
              zIndex: 0
            }}
          />
          
          <Box 
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 120,
              height: 120,
              background: 'radial-gradient(circle at bottom left, rgba(51,51,51,0.05) 0%, rgba(51,51,51,0) 70%)',
              borderRadius: '0 100% 0 0',
              zIndex: 0
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Collapse in={!!error} sx={{ mb: 2 }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            </Collapse>

            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}
            >
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                variant="outlined"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!emailError}
                helperText={emailError}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: emailError ? 'error.main' : 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#f8f9fa',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
              
              <FormControl variant="outlined" fullWidth error={!!passwordError}>
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: passwordError ? 'error.main' : 'text.secondary' }} />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? 
                          <VisibilityOffIcon /> : 
                          <VisibilityIcon />
                        }
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#f8f9fa',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                />
                {passwordError && (
                  <Typography 
                    variant="caption" 
                    color="error" 
                    sx={{ mt: 0.5, ml: 2 }}
                  >
                    {passwordError}
                  </Typography>
                )}
              </FormControl>
              
              <Box sx={{ textAlign: 'right' }}>
                <Link 
                  to="/forgot-password"
                  style={{ 
                    color: '#333',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '0.9rem'
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading || !!emailError || !!passwordError}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'secondary.main',
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(255, 205, 41, 0.3)',
                  '&:hover': {
                    bgcolor: '#e6b800',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(255, 205, 41, 0.4)'
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255, 205, 41, 0.5)',
                    color: 'rgba(51, 51, 51, 0.7)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isLoading ? (
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      color: 'secondary.main',
                    }} 
                  />
                ) : 'Login'}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  '& a': {
                    color: 'secondary.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    position: 'relative',
                    ml: 0.5,
                    '&:hover': {
                      color: 'primary.main'
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '2px',
                      bottom: -2,
                      left: 0,
                      backgroundColor: 'primary.main',
                      transform: 'scaleX(0)',
                      transformOrigin: 'right',
                      transition: 'transform 0.3s ease'
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)',
                      transformOrigin: 'left'
                    }
                  }
                }}
              >
                Don't have an account?
                <Link to="/signup">Sign up here</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 