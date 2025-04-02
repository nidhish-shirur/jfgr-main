import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Container, 
  Menu, 
  MenuItem, 
  Fade,
  useScrollTrigger,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';

// For hiding the navbar on scroll down and showing on scroll up
function ElevationScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuOpen = Boolean(anchorEl);

  // Navigation items
  const navItems = [
    { name: 'Know About Us', path: '/#know-about-us', section: 'know-about-us' },
    { name: 'What We Do', path: '/#what-we-do', section: 'what-we-do' },
    { name: 'Media', path: '/#media', section: 'media' },
    { name: 'Register Complaint', path: '/#register-complaint', section: 'register-complaint' }
  ];

  // Track scroll position and update active section
  useEffect(() => {
    const handleScroll = () => {
      // Only check for active sections on the home page
      if (location.pathname === '/') {
        // Get all sections
        const sections = [
          'hero',
          'know-about-us',
          'what-we-do',
          'media',
          'register-complaint'
        ];

        // Find which section is currently in viewport
        for (const sectionId of sections) {
          const section = document.getElementById(sectionId);
          if (section) {
            const rect = section.getBoundingClientRect();
            const headerHeight = document.querySelector('.MuiAppBar-root')?.offsetHeight || 0;
            
            // Check if section is in viewport (with offset for header)
            if (rect.top <= headerHeight + 100 && rect.bottom >= headerHeight) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Handle smooth scrolling for anchor links
  const handleSmoothScroll = (e, id) => {
    e.preventDefault();
    console.log(`Attempting to scroll to section: ${id}`);
    
    // Close mobile drawer if open
    if (mobileOpen) {
      setMobileOpen(false);
    }
    
    const element = document.getElementById(id);
    if (element) {
      console.log(`Found element with id: ${id}`);
      // Get the header height to offset the scroll position
      const headerHeight = document.querySelector('.MuiAppBar-root')?.offsetHeight || 0;
      console.log(`Header height: ${headerHeight}px`);
      
      // Method 1: Using scrollTo
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Method 2: Alternative using scrollIntoView (as a fallback)
      setTimeout(() => {
        if (Math.abs(window.pageYOffset - offsetPosition) > 50) {
          console.log('Using scrollIntoView as fallback');
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          // Adjust for header
          setTimeout(() => {
            window.scrollBy(0, -headerHeight);
          }, 100);
        }
      }, 300);
    } else if (location.pathname !== '/') {
      // If we're not on the home page, navigate there first then scroll
      console.log(`Element with id ${id} not found, navigating to home page first`);
      navigate('/');
      // Add a small delay to allow the page to load before scrolling
      setTimeout(() => {
        const targetElement = document.getElementById(id);
        if (targetElement) {
          console.log(`Found element after navigation: ${id}`);
          const headerHeight = document.querySelector('.MuiAppBar-root')?.offsetHeight || 0;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        } else {
          console.log(`Element with id ${id} still not found after navigation`);
        }
      }, 500); // Increased timeout to ensure page loads
    } else {
      console.log(`Element with id ${id} not found`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      handleCloseMenu();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ 
      textAlign: 'center', 
      pt: 3, 
      pb: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography 
        variant="h5" 
        component={Link} 
        to="/" 
        onClick={handleDrawerToggle}
        sx={{ 
          fontWeight: '800', 
          color: 'primary.main', 
          textDecoration: 'none', 
          mb: 4,
          letterSpacing: '0.5px'
        }}
      >
        JFGR
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      <List sx={{ flexGrow: 1, px: 2 }}>
        {navItems.map((item) => (
          <ListItem 
            key={item.name} 
            disablePadding
            sx={{ mb: 1 }}
          >
            <Button
              fullWidth
              onClick={(e) => {
                if (item.section) {
                  handleSmoothScroll(e, item.section);
                } else {
                  navigate(item.path);
                  setMobileOpen(false);
                }
              }}
              sx={{ 
                py: 1.5,
                px: 2,
                justifyContent: 'flex-start',
                borderRadius: 2,
                backgroundColor: (activeSection === item.section || location.pathname === item.path) 
                  ? 'rgba(255, 205, 3, 0.15)' 
                  : 'transparent',
                color: (activeSection === item.section || location.pathname === item.path) 
                  ? 'primary.main' 
                  : 'text.primary',
                fontWeight: (activeSection === item.section || location.pathname === item.path) 
                  ? 600 
                  : 500,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'rgba(255, 205, 41, 0.08)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: (activeSection === item.section || location.pathname === item.path) ? 4 : 0,
                  height: '50%',
                  bgcolor: 'primary.main',
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                  transition: 'width 0.2s ease',
                }
              }}
            >
              {item.name}
            </Button>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ px: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {currentUser ? (
          <>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleLogout}
              fullWidth
              sx={{ 
                py: 1.2, 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 6px 12px rgba(255, 205, 41, 0.2)'
                }
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Button 
            component={Link}
            to="/login"
            variant="contained" 
            color="primary"
            fullWidth
            sx={{ 
              py: 1.5, 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: 'none',
              letterSpacing: '0.5px',
              '&:hover': {
                boxShadow: '0 6px 12px rgba(255, 205, 41, 0.2)'
              }
            }}
          >
            Login / Register
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <ElevationScroll>
        <AppBar 
          position="fixed" 
          color="default" 
          elevation={0}
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            boxShadow: 'none'
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
              {/* Logo */}
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  color: 'primary.main',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  textDecoration: 'none',
                  flexGrow: { xs: 1, md: 0 },
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                JFGR
              </Typography>

              {/* Desktop navigation */}
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                mx: 2, 
                flexGrow: 1, 
                justifyContent: 'center',
                gap: 0.5
              }}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    component={item.section ? 'a' : Link}
                    to={!item.section ? item.path : undefined}
                    href={item.section ? `/#${item.section}` : undefined}
                    onClick={item.section ? (e) => handleSmoothScroll(e, item.section) : undefined}
                    sx={{
                      color: (activeSection === item.section || location.pathname === item.path) 
                        ? 'primary.main' 
                        : 'text.primary',
                      position: 'relative',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      px: 2,
                      py: 1,
                      mx: 0.5,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      transition: 'all 0.2s ease',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 6,
                        left: (activeSection === item.section || location.pathname === item.path) ? 10 : '50%',
                        width: (activeSection === item.section || location.pathname === item.path) ? 'calc(100% - 20px)' : 0,
                        height: 2,
                        bgcolor: 'primary.main',
                        transition: 'all 0.3s ease',
                        opacity: (activeSection === item.section || location.pathname === item.path) ? 1 : 0,
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255, 205, 41, 0.08)',
                        '&::after': {
                          left: 10,
                          width: 'calc(100% - 20px)',
                          opacity: 1
                        }
                      }
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>

              {/* Auth section - desktop */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
                {currentUser ? (
                  <>
                    <Button
                      id="admin-button"
                      aria-controls={menuOpen ? 'admin-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={menuOpen ? 'true' : undefined}
                      onClick={handleMenuOpen}
                      endIcon={<KeyboardArrowDownIcon />}
                      startIcon={<PersonIcon />}
                      sx={{ 
                        mr: 1, 
                        fontWeight: 500,
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 2,
                        py: 0.8,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(51, 51, 51, 0.06)'
                        }
                      }}
                    >
                      Admin
                    </Button>
                    <Menu
                      id="admin-menu"
                      MenuListProps={{
                        'aria-labelledby': 'admin-button',
                      }}
                      anchorEl={anchorEl}
                      open={menuOpen}
                      onClose={handleCloseMenu}
                      TransitionComponent={Fade}
                      PaperProps={{
                        elevation: 3,
                        sx: { 
                          borderRadius: 2,
                          mt: 1,
                          minWidth: 180,
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <MenuItem 
                        onClick={() => {
                          navigate('/admin');
                          handleCloseMenu();
                        }}
                        sx={{ 
                          py: 1.2, 
                          px: 2,
                          '&:hover': { bgcolor: 'rgba(255, 205, 41, 0.08)' } 
                        }}
                      >
                        Dashboard
                      </MenuItem>
                      <MenuItem 
                        onClick={() => {
                          navigate('/admin/create');
                          handleCloseMenu();
                        }}
                        sx={{ 
                          py: 1.2, 
                          px: 2,
                          '&:hover': { bgcolor: 'rgba(255, 205, 41, 0.08)' } 
                        }}
                      >
                        Create Admin
                      </MenuItem>
                      <Divider sx={{ my: 1 }} />
                      <MenuItem 
                        onClick={handleLogout}
                        sx={{ 
                          py: 1.2, 
                          px: 2,
                          color: 'error.main',
                          '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' } 
                        }}
                      >
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    component={Link}
                    to="/login" 
                    variant="contained"
                    color="primary"
                    sx={{ 
                      borderRadius: 2,
                      boxShadow: 'none',
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 8px 16px rgba(255, 205, 41, 0.3)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Login / Register
                  </Button>
                )}
              </Box>

              {/* Mobile menu button */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ 
                  display: { md: 'none' }, 
                  borderRadius: 1.5,
                  color: 'secondary.main',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 205, 41, 0.08)'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>
      </ElevationScroll>
      
      {/* Mobile drawer */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 280,
              boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
            },
          }}
          PaperProps={{
            sx: {
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12
            }
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Toolbar spacer to prevent content from hiding under the AppBar */}
      <Toolbar />
    </Box>
  );
};

export default Header;