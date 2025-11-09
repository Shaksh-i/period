import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReminderById } from "../services/api";
import { Box, Typography, Button, Paper } from "@mui/material";

export default function ReminderDetails() {
  const { id } = useParams();
  const [reminder, setReminder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getReminderById(id);
        setReminder(res.data);
      } catch (e) {
        setError("Reminder not found or unauthorized");
      }
    }
    fetchData();
  }, [id]);

  if (error) {
    return (
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }
  if (!reminder) {
    return <Typography>Loading...</Typography>;
  }
  return (
    <Box sx={{ mt: 4, p: 2, background: "#ede7f6", borderRadius: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        Reminder Details
      </Typography>
      <pre
        style={{
          fontSize: "1rem",
          background: "#fff",
          padding: 12,
          borderRadius: 4,
        }}
      >
        {JSON.stringify(reminder, null, 2)}
      </pre>
      <Button variant="outlined" href="/reminders">
        Back to Reminders
      </Button>
    </Box>
  );
}
