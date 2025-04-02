import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TextField, 
  Button, 
  InputAdornment, 
  Typography, 
  Container, 
  Box, 
  Paper, 
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Email, Lock, Handshake } from '@mui/icons-material';

function VolunteerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [volunteerId, setVolunteerId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !volunteerId) {
      setMessage('Please enter all required fields');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      // Here you would add volunteer-specific login logic
      // For now, we'll use the same login function but you might want to add
      // a special volunteer verification step
      await login(email, password);
      
      // Later you can add volunteer ID verification
      // validateVolunteerId(volunteerId)
      
      navigate('/volunteer-dashboard'); // Redirect to volunteer dashboard after login
    } catch (error) {
      console.error('Volunteer login error:', error);
      let errorMessage = 'Failed to log in';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No volunteer found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid credentials';
          break;
        default:
          errorMessage = `Login failed: ${error.message}`;
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          my: { xs: 3, md: 6 }, 
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1 
            }}
          >
            <Handshake 
              sx={{ 
                fontSize: 36, 
                mr: 1, 
                color: '#F59E0B' 
              }} 
            />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
              Volunteer Login
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to access your volunteer account
          </Typography>

          {message && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="volunteerId"
              label="Volunteer ID"
              name="volunteerId"
              autoComplete="off"
              autoFocus
              value={volunteerId}
              onChange={(e) => setVolunteerId(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Handshake />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                mb: 2,
                py: 1.5,
                bgcolor: '#F59E0B',
                '&:hover': {
                  bgcolor: '#D97706',
                },
                fontWeight: 500,
                fontSize: '1rem'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Options
              </Typography>
            </Divider>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Not a volunteer?{' '}
                <Link to="/login" style={{ color: '#F59E0B', fontWeight: 500, textDecoration: 'none' }}>
                  Regular Login
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Want to volunteer?{' '}
                <Link to="/volunteer-registration" style={{ color: '#F59E0B', fontWeight: 500, textDecoration: 'none' }}>
                  Apply Now
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default VolunteerLogin; 