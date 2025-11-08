import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  Avatar,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import AppNotificationIcon from "./AppNotificationIcon";
import ProfileMenu from "./ProfileMenu";
import axios from "../services/api";

export default function Layout({ children, user, setUser, logout }) {
  const [open, setOpen] = useState(false);
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const location = useLocation();

  const handleUpload = async (file) => {
    if (!user || !file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/users/profile-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.profilePhoto) {
        const updatedUser = { ...user, profilePhoto: res.data.profilePhoto };
        setUser(updatedUser);
        const tokenData = localStorage.getItem("tokenData");
        if (tokenData) {
          try {
            const parsed = JSON.parse(tokenData);
            parsed.user = updatedUser;
            localStorage.setItem("tokenData", JSON.stringify(parsed));
          } catch {}
        }
      }
    } catch {
      alert("Failed to upload profile photo.");
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    try {
      const res = await axios.delete("/users/profile-photo");
      if (res.data?.profilePhoto === null) {
        const updatedUser = { ...user, profilePhoto: null };
        setUser(updatedUser);
        const tokenData = localStorage.getItem("tokenData");
        if (tokenData) {
          try {
            const parsed = JSON.parse(tokenData);
            parsed.user = updatedUser;
            localStorage.setItem("tokenData", JSON.stringify(parsed));
          } catch {}
        }
      }
    } catch {
      alert("Failed to remove profile photo.");
    }
  };

  const menuItems = [
    { text: "Home", path: "/" },
    { text: "Cycle Log", path: "/cycles" },
    { text: "Symptoms", path: "/symptoms" },
    { text: "Reminders", path: "/reminders" },
    { text: "Health Insights", path: "/insights" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        backgroundAttachment: "fixed",
      }}
    >
      <AppBar
        position="sticky"
        sx={{
          width: "100%",
          background: "linear-gradient(to right, #6a1b9a, #8e24aa)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderBottom: "2px solid #ede7f6",
          height: 100,
          justifyContent: "center",
        }}
      >
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", px: 2 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => isLoggedIn && setOpen(true)}
              disabled={!isLoggedIn}
              sx={{ fontSize: 28 }}
            >
              <MenuIcon fontSize="inherit" />
            </IconButton>

            <Box
              component="img"
              src="/logo.png"
              alt="HerSync Logo"
              sx={{ height: 60, width: 60 }}
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                fontFamily: "'Poppins', sans-serif",
                color: "#fff",
              }}
            >
              HerSync
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isLoggedIn && <AppNotificationIcon user={user} />}

            {!isLoggedIn ? (
              <>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/login"
                  sx={{
                    color: "#fff",
                    borderColor: "#fff",
                    backgroundColor: "transparent",
                    "&:hover": { backgroundColor: "#fff", color: "#6a1b9a" },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/signup"
                  sx={{
                    color: "#fff",
                    borderColor: "#fff",
                    backgroundColor: "transparent",
                    "&:hover": { backgroundColor: "#fff", color: "#6a1b9a" },
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <ProfileMenu
                  user={user}
                  onUpload={handleUpload}
                  onRemove={handleRemovePhoto}
                >
                  <Avatar
                    src={user?.profilePhoto || ""}
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: user?.profilePhoto ? "transparent" : "#7b1fa2",
                      fontWeight: 600,
                      fontSize: 24,
                      color: "#fff",
                      cursor: "pointer",
                      border: "2px solid #fff",
                      boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                    }}
                  >
                    {!user?.profilePhoto &&
                      (user?.username || user?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                  </Avatar>
                </ProfileMenu>

                <IconButton
                  color="inherit"
                  onClick={logout}
                  title="Logout"
                  sx={{
                    fontSize: 28,
                    "&:hover": {
                      backgroundColor: "#fff",
                      color: "#6a1b9a",
                    },
                  }}
                >
                  <LogoutIcon fontSize="inherit" />
                </IconButton>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {isLoggedIn && (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: 200, sm: 240, md: 260 },
              backgroundColor: "#fff",
            },
          }}
        >
          <Box sx={{ height: "100%" }}>
            <List>
              {menuItems.map(({ text, path }) => {
                const isActive = location.pathname === path;
                return (
                  <ListItem
                    button
                    component={Link}
                    to={path}
                    key={text}
                    onClick={() => setOpen(false)}
                    sx={{
                      backgroundColor: isActive ? "#e1bee7" : "transparent",
                      borderLeft: isActive ? "6px solid #6a1b9a" : "none",
                      "&:hover": {
                        backgroundColor: "#f3e5f5",
                      },
                    }}
                  >
                    <ListItemText
                      primary={text}
                      sx={{
                        color: "#6a1b9a",
                        fontWeight: isActive ? "bold" : "normal",
                        fontSize: "1.2rem",
                        fontFamily: "'Poppins', sans-serif",
                        transition: "color 0.3s ease",
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Drawer>
      )}

      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>
    </Box>
  );
}
