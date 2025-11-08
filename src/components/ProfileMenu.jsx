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
    <Box>
      <IconButton onClick={handleMenu} color="inherit" size="large">
        {user?.profilePhoto ? (
          <Avatar src={user.profilePhoto} />
        ) : (
          <Avatar
            sx={{
              bgcolor: "linear-gradient(135deg, #7b1fa2, #e91e63)",
              width: 40,
              height: 40,
              fontWeight: 600,
              fontSize: 22,
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
            minWidth: 220,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {user?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
