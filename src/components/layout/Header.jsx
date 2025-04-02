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
  Avatar
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
    { name: 'Register Complaint', path: '/complaints', section: null }
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

  // Handle navigation for both anchor links and direct routes
  const handleNavigation = (e, path, section) => {
    e.preventDefault();
    
    // Close mobile drawer if open
    if (mobileOpen) {
      setMobileOpen(false);
    }

    // If it's an anchor link (contains #)
    if (path.includes('#')) {
      handleSmoothScroll(e, section);
    } else {
      // For direct routes
      navigate(path);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
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

  return (
    <ElevationScroll>
      <AppBar position="sticky" color="inherit" sx={{ backgroundColor: 'background.paper' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo/Brand - visible on all screens */}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                textDecoration: 'none',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              JFGR
            </Typography>

            {/* Mobile menu icon */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
              <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ ml: 2 }}
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Desktop Navigation Items */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 'auto', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  onClick={(e) => handleNavigation(e, item.path, item.section)}
                  sx={{
                    mx: 1,
                    color: activeSection === item.section ? 'primary.main' : 'text.primary',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  {item.name}
                </Button>
              ))}
              
              {/* User Menu */}
              {currentUser ? (
                <>
                  <Button
                    onClick={handleMenuOpen}
                    endIcon={<KeyboardArrowDownIcon />}
                    startIcon={<Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <PersonIcon />
                    </Avatar>}
                    sx={{
                      ml: 2,
                      textTransform: 'none',
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    Profile
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleCloseMenu}
                    TransitionComponent={Fade}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1,
                        minWidth: 180,
                        borderRadius: 1
                      }
                    }}
                  >
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{
                        py: 1,
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'error.lighter'
                        }
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
                  sx={{
                    ml: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Login
                </Button>
              )}
            </Box>

            {/* Mobile Drawer */}
            <Drawer
              variant="temporary"
              anchor="right"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true // Better mobile performance
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': { 
                  boxSizing: 'border-box', 
                  width: 240,
                  backgroundColor: 'background.paper'
                },
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  component={Link}
                  to="/"
                  onClick={handleDrawerToggle}
                  sx={{
                    fontWeight: 800,
                    color: 'primary.main',
                    textDecoration: 'none',
                    display: 'block',
                    mb: 2
                  }}
                >
                  JFGR
                </Typography>
                <List>
                  {navItems.map((item) => (
                    <ListItem 
                      key={item.name}
                      onClick={(e) => {
                        handleNavigation(e, item.path, item.section);
                        handleDrawerToggle();
                      }}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
                      <ListItemText primary={item.name} />
                    </ListItem>
                  ))}
                  {currentUser ? (
                    <ListItem
                      onClick={handleLogout}
                      sx={{
                        borderRadius: 1,
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'error.lighter'
                        }
                      }}
                    >
                      <ListItemText primary="Logout" />
                    </ListItem>
                  ) : (
                    <ListItem
                      component={Link}
                      to="/login"
                      onClick={handleDrawerToggle}
                      sx={{
                        borderRadius: 1,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark'
                        }
                      }}
                    >
                      <ListItemText primary="Login" />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Drawer>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
};

export default Header;