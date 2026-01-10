import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  SportsSoccer as SportsIcon,
  CalendarMonth as CalendarIcon,
  Payment as PaymentIcon
} from "@mui/icons-material";
import logo from "../../assets/logo.png";

export default function ResponsiveHeader({ title, subtitle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    // Set current path on component mount
    setCurrentPath(window.location.pathname);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  };

  const navigationItems = [
    // { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Captains', icon: <PeopleIcon />, path: '/admin' },
    { text: 'Slots', icon: <DashboardIcon />, path: '/admin/slots' },
  ];

  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: { 
          width: 280,
          background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: 'white', mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <img src={logo} alt="Logo" style={{ height: 40 }} />
        </Box>
        
        <List>
          {navigationItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              onClick={() => {
                if (item.path !== '#') window.location.href = item.path;
                setMobileMenuOpen(false);
              }}
              sx={{ 
                borderRadius: 1,
                mb: 1,
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                backgroundColor: currentPath === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          
          <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{ 
              borderRadius: 1,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="sticky"
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: theme.shadows[3],
          mb: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mr: { xs: 1, sm: 2 }
          }}>
            <img 
              src={logo} 
              alt="Logo" 
              style={{ 
                height: isMobile ? '40px' : isTablet ? '50px' : '60px',
                maxWidth: '100%'
              }} 
            />
          </Box>

          {/* Tournament Title */}
          {!isMobile && (
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: { xs: 'center', sm: 'flex-start' },
              justifyContent: 'center',
              ml: { sm: 1, md: 2 }
            }}>
              <Typography
                variant={isMobile ? "h6" : isTablet ? "h5" : "h4"}
                sx={{
                  fontWeight: 800,
                  letterSpacing: { xs: 0.5, md: 1 },
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.2
                }}
              >
                CDS Premier League
              </Typography>
              {!isTablet && (
                <Typography
                  variant="subtitle2"
                  sx={{
                    opacity: 0.9,
                    mt: 0.5,
                    letterSpacing: 0.3,
                    fontWeight: 500,
                    color: 'white'
                  }}
                >
                  {subtitle || "Team Captains Management"}
                </Typography>
              )}
            </Box>
          )}

          {/* Desktop Navigation */}
          {!isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Show Slots button only on /admin page */}
              {currentPath === '/admin' && (
                <Button
                  variant="text"
                  startIcon={<DashboardIcon />}
                  onClick={() => window.location.href = "/admin/slots"}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Slots
                </Button>
              )}
              
              {/* Show Captains button only on /admin/slots page */}
              {currentPath === '/admin/slots' && (
                <Button
                  variant="text"
                  startIcon={<PeopleIcon />}
                  onClick={() => window.location.href = "/admin"}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Captains
                </Button>
              )}
              
              <Button
                variant="outlined"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Logout
              </Button>
            </Stack>
          )}

          {/* Mobile Title and Actions */}
          {isMobile && (
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              ml: 1
            }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  color: 'white',
                  lineHeight: 1.2
                }}
              >
                CDS Premier League
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.9,
                  color: 'white',
                  lineHeight: 1.1
                }}
              >
                {subtitle || "Management"}
              </Typography>
            </Box>
          )}

          {/* Mobile Action Buttons */}
          {isMobile && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* Show Slots button only on /admin page */}
              {currentPath === '/admin' && (
                <IconButton
                  color="inherit"
                  onClick={() => window.location.href = "/admin/slots"}
                  sx={{ 
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                  title="Slots"
                >
                  <DashboardIcon />
                </IconButton>
              )}
              
              {/* Show Captains button only on /admin/slots page */}
              {currentPath === '/admin/slots' && (
                <IconButton
                  color="inherit"
                  onClick={() => window.location.href = "/admin"}
                  sx={{ 
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                  title="Captains"
                >
                  <PeopleIcon />
                </IconButton>
              )}
              
              <IconButton
                color="inherit"
                onClick={handleLogout}
                sx={{ 
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
                title="Logout"
              >
                <LogoutIcon />
              </IconButton>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {mobileMenuOpen && <MobileDrawer />}
    </>
  );
}