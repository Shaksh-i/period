import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "#ffb6c1", // pastel pink
        width: "100%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderBottom: "2px solid #fff5e1", // pastel cream accent
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 3, sm: 8 },
          py: 2,
          minHeight: 80,
        }}
      >
        {/* Logo + App Name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: 2,
          }}
          onClick={() => navigate("/")}
        >
          <img src="/logo.png" alt="App Logo" style={{ height: 48 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontStyle: "italic",
              fontFamily: "'Poppins', sans-serif",
              color: "#fff5e1", // pastel cream
            }}
          >
            HerSync
          </Typography>
        </Box>

        {/* Auth Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {!isLoggedIn ? (
            <>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  backgroundColor: "#fff5e1",
                  color: "#d94f70",
                  fontWeight: "bold",
                  textTransform: "none",
                  fontFamily: "'Poppins', sans-serif",
                  "&:hover": { backgroundColor: "#ffe6ec" },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/signup")}
                sx={{
                  backgroundColor: "#ffe6ec",
                  color: "#d94f70",
                  fontWeight: "bold",
                  textTransform: "none",
                  fontFamily: "'Poppins', sans-serif",
                  "&:hover": { backgroundColor: "#ffd6e0" },
                }}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={() => {
                setIsLoggedIn(false);
                navigate("/login");
              }}
              sx={{
                backgroundColor: "#ffe6ec",
                color: "#d94f70",
                fontWeight: "bold",
                textTransform: "none",
                fontFamily: "'Poppins', sans-serif",
                "&:hover": { backgroundColor: "#ffd6e0" },
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
