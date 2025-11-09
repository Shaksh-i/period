import React, { useRef, useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Box,
  Divider,
  useTheme,
} from "@mui/material";

export default function ProfileMenu({ user, onLogout, onUpload, onRemove }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef();
  const theme = useTheme();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = (e) => {
    if (onUpload) onUpload(e.target.files[0]);
    handleClose();
  };
  const handleRemovePhoto = () => {
    if (onRemove) onRemove();
    handleClose();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        minWidth: 0,
        gap: { xs: 0.5, sm: 1 },
        ml: { xs: 0, sm: 1 },
      }}
    >
      <IconButton onClick={handleMenu} color="inherit" size="large">
        {user?.profilePhoto ? (
          <Avatar
            src={user.profilePhoto}
            sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
          />
        ) : (
          <Avatar
            sx={{
              bgcolor: "linear-gradient(135deg, #7b1fa2, #e91e63)",
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              fontWeight: 600,
              fontSize: { xs: 18, sm: 22 },
            }}
          >
            {(user?.username || user?.email || "U").charAt(0).toUpperCase()}
          </Avatar>
        )}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #f3e5f5, #fce4ec)",
            borderRadius: 2,
            boxShadow: 6,
            minWidth: { xs: 180, sm: 220 },
          },
        }}
      >
        <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 1.5 } }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", fontSize: { xs: 15, sm: 17 } }}
          >
            {user?.username}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: 12, sm: 14 } }}
          >
            {user?.email}
          </Typography>
        </Box>
        <Divider />

        {user?.profilePhoto ? (
          <MenuItem
            onClick={handleRemovePhoto}
            sx={{
              "&:hover": {
                backgroundColor: theme.palette.secondary.main,
                color: "#fff",
              },
            }}
          >
            Remove Profile Photo
          </MenuItem>
        ) : (
          <MenuItem
            onClick={handleUploadClick}
            sx={{
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
              },
            }}
          >
            Upload Profile Photo
          </MenuItem>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </Menu>
    </Box>
  );
}
