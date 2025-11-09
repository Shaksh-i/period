import React, { useEffect, useState } from "react";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  fetchUpcomingNotifications,
  markNotificationRead,
  fetchAllNotifications,
} from "../services/api";
import fetchNotifications from "../services/api";
export default function AppNotificationIcon({ user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        let res;
        if (showAll) {
          res = await fetchAllNotifications();
        } else {
          res = await fetchUpcomingNotifications();
        }
        setNotifications(res.data || []);
        setUnreadCount((res.data || []).filter((n) => !n.is_read).length);

        // Check for notifications whose scheduled_for is now (within 1 minute)
        const now = new Date();
        const showPopup = (res.data || []).some((n) => {
          if (!n.scheduled_for || n.is_read) return false;
          const notifTime = new Date(n.scheduled_for);
          return Math.abs(now - notifTime) < 60000; // within 1 minute
        });
        if (showPopup) {
          setAnchorEl(document.body); // Show popover automatically
        }
      } catch {}
    };
    load();
    // Poll every 30 seconds for real-time badge updates
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user, showAll]);

  useEffect(() => {
    fetchNotifications();
    // Listen for custom event to force refresh
    const handler = () => fetchNotifications();
    window.addEventListener("refresh-notifications", handler);
    // Optionally, poll every 60s
    // const interval = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(interval);
    return () => {
      window.removeEventListener("refresh-notifications", handler);
      // if (interval) clearInterval(interval);
    };
  }, []);

  const handleOpen = async (event) => {
    setAnchorEl(event.currentTarget);
    setShowAll(false);
    // Mark all notifications as read in the backend so badge does not reappear after refresh
    if (notifications.length > 0) {
      await Promise.all(notifications.map((n) => markNotificationRead(n.id)));
      setUnreadCount(0);
      // Refetch notifications so only active (unread) are shown
      try {
        const res = await fetchUpcomingNotifications();
        setNotifications(res.data || []);
      } catch {}
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Mark notification as read (remove from list and update badge, persistently)
  const handleDismiss = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch {}
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        sx={{ mr: { xs: 0.5, sm: 1 } }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { minWidth: 300, p: 2 } }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6">Notifications</Typography>
          <Typography
            variant="body2"
            sx={{
              color: "primary.main",
              cursor: "pointer",
              ml: 2,
              textDecoration: "underline",
            }}
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show Unread" : "Show All"}
          </Typography>
        </Box>
        {notifications.length === 0 && (
          <Typography>No new notifications</Typography>
        )}
        {notifications.map((n) => (
          <Box
            key={n.id}
            sx={{
              mb: 1,
              p: 1,
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: n.is_read ? 0.6 : 1,
            }}
          >
            <Box>
              <Typography variant="subtitle2">
                {n.title || n.message}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {n.scheduled_for || n.sent_at}
              </Typography>
            </Box>
            {!n.is_read && (
              <IconButton
                size="small"
                onClick={() => handleDismiss(n.id)}
                aria-label="Dismiss notification"
              >
                ✕
              </IconButton>
            )}
          </Box>
        ))}
      </Popover>
    </>
  );
}
