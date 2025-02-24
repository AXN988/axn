'use client'

import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, useMediaQuery, useTheme, ImageListItem } from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if on mobile device
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('login')
        router.replace('/');
    };


    return (
        <Box position="sticky" sx={{ backgroundColor: 'red', padding: '10px' }}>
            <Toolbar className="flex justify-between items-center">
                {/* Left Side Logo and Text in a Row */}
                {/* Logo Image */}
                <img
                    src={'./axn_navbar_logo.png'}
                    alt="Logo"
                    style={{ width: '120px', height: '60px', objectFit: 'contain' }} // Adjust the size as needed
                />

                {/* Right Side Logout Button */}
                <Box className="flex items-center" onClick={() => { handleLogout() }}>
                    <IconButton
                        edge="end"
                        aria-label="logout"
                        className='space-x-4'
                        sx={{ color: 'white', fontSize: isMobile ? '20px' : '24px' }}
                    >
                        {/* Logo Text */}
                        <Typography variant="h6" color="white">
                            Logout
                        </Typography>
                        <Logout />
                    </IconButton>
                </Box>
            </Toolbar>
        </Box>
    );
};

export default Navbar;
