import React, { useEffect, useState } from "react";
import {
  fetchUpcomingNotifications,
  fetchAllNotifications,
  markNotificationRead,
  snoozeNotification,
} from "../services/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import Paper from "@mui/material/Paper";
export default function NotificationCenter({ user }) {
  if (!user) {
    return (
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5">
          Please log in to view the Notifications.
        </Typography>
      </Paper>
    );
  }
  const [items, setItems] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    load();
    // Poll for notifications every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [showAll]);
  const load = async () => {
    try {
      const res = showAll
        ? await fetchAllNotifications()
        : await fetchUpcomingNotifications();
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSnooze = async (id) => {
    try {
      // default snooze 60 minutes
      await snoozeNotification(id, 60);
      // reload list to reflect new schedule
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Notifications
      </Typography>
      <Stack spacing={2}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button size="small" onClick={() => setShowAll((s) => !s)}>
            {showAll ? "Show Upcoming" : "Show All"}
          </Button>
        </Box>
        {items.length === 0 && (
          <Typography>No upcoming notifications</Typography>
        )}
        {items.map((it) => (
          <Card key={it.id}>
            <CardContent>
              <Typography variant="subtitle1">
                {it.title ?? it.message}
              </Typography>
              <Typography variant="body2">
                {it.scheduled_for ?? it.sent_at}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  onClick={() => markRead(it.id)}
                  disabled={it.is_read}
                >
                  {it.is_read ? "Read" : "Dismiss"}
                </Button>
                <Button size="small" onClick={() => handleSnooze(it.id)}>
                  Snooze 60m
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
