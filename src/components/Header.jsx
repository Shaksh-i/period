import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100%",
        backgroundColor: "#a259c1", // full purple
        backgroundImage: "none",
        color: "#fff5e1",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderBottom: "2px solid #fff5e1",
        zIndex: 1300,
        overflow: "hidden", // fixes small-screen overflow gap
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap", // allows wrapping on small screens
          gap: 1,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 0.8, sm: 1 },
          width: "100%",
          minHeight: { xs: 56, sm: 64 },
          backgroundColor: "#a259c1", // ensures consistent color under all items
        }}
      >
        {/* Left Section: Menu + Logo + Name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
            flexShrink: 0,
            flexWrap: "nowrap",
          }}
        >
          <IconButton sx={{ color: "#fff5e1", p: { xs: 0.5, sm: 1 } }}>
            <MenuIcon />
          </IconButton>

          <img
            src="/logo.png"
            alt="App Logo"
            style={{
              height: 35,
              width: "auto",
              objectFit: "contain",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              fontStyle: "italic",
              fontFamily: "'Poppins', sans-serif",
              color: "#fff5e1",
              fontSize: { xs: "1.1rem", sm: "1.4rem" },
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            onClick={() => navigate("/dashboard")}
          >
            HerSync
          </Typography>
        </Box>

        {/* Right Section: Notification + Profile + Logout */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: { xs: 0.8, sm: 1.5 },
            width: "100%", // ensures full width background
            flexShrink: 0,
            flexWrap: "nowrap",
            backgroundColor: "#a259c1", // fixes gap under wrapping
          }}
        >
          <IconButton sx={{ color: "#fff5e1", p: { xs: 0.5, sm: 1 } }}>
            <NotificationsIcon />
          </IconButton>

          {isLoggedIn && (
            <>
              <Box
                sx={{
                  backgroundColor: "#fff5e1",
                  color: "#a259c1",
                  width: { xs: 30, sm: 35 },
                  height: { xs: 30, sm: 35 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  transition: "all 0.3s ease",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                K
              </Box>

              <Button
                variant="contained"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  backgroundColor: "#fff5e1",
                  color: "#a259c1",
                  fontWeight: "bold",
                  textTransform: "none",
                  fontFamily: "'Poppins', sans-serif",
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.5, sm: 1 },
                  fontSize: { xs: "0.7rem", sm: "0.85rem" },
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#f2e1ff" },
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
