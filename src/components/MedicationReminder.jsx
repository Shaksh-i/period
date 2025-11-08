import React, { useEffect, useState } from "react";
import {
  fetchMedReminders,
  createMedReminder,
  deleteMedReminder,
  sendTestMedReminderEmail,
} from "../services/api";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Grid,
  Button,
  MenuItem,
  Typography,
  Paper,
} from "@mui/material";

const frequencyOptions = ["daily", "weekly", "monthly"];

export default function MedicationReminder({ user }) {
  if (!user) {
    return (
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Please log in to view your Medication Reminders.
        </Typography>
      </Paper>
    );
  }

  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    time: "09:00",
    frequency: "daily",
    start_date: "",
    end_date: "",
    category: "Menstrual",
    tags: "",
  });
  const [emailToSend, setEmailToSend] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  useEffect(() => {
    reload();
  }, []);

  const reload = async () => {
    try {
      const res = await fetchMedReminders();
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const submit = async () => {
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      await createMedReminder(payload);
      setForm({
        name: "",
        dosage: "",
        time: "09:00",
        frequency: "daily",
        start_date: "",
        end_date: "",
        category: "Menstrual",
        tags: "",
      });
      await reload();
      if (window.dispatchEvent) {
        window.dispatchEvent(new Event("refresh-notifications"));
      }
    } catch (e) {
      console.error(e);
      alert("Failed");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "rgba(243, 229, 245, 0.6)",
        padding: { xs: 3, md: 6 },
        borderRadius: 4,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        minHeight: "85vh",
        maxWidth: 1000,
        mx: "auto",
        mt: 4,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#6a1b9a",
          mb: 4,
          textAlign: "center",
        }}
      >
        Medication & Care Reminders
      </Typography>

      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #f3e5f5, #fff5e1)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          },
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dosage"
                fullWidth
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="time"
                label="Time"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Frequency"
                fullWidth
                value={form.frequency}
                onChange={(e) =>
                  setForm({ ...form, frequency: e.target.value })
                }
              >
                {frequencyOptions.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Category"
                fullWidth
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <MenuItem value="Menstrual">Menstrual</MenuItem>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Mental Health">Mental Health</MenuItem>
                <MenuItem value="Fertility">Fertility</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Start date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="End date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Tags (comma separated)"
                fullWidth
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Send test email to"
                fullWidth
                value={emailToSend}
                onChange={(e) => setEmailToSend(e.target.value)}
                placeholder="Enter email address"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                onClick={async () => {
                  setEmailStatus("");
                  try {
                    await sendTestMedReminderEmail({
                      ...form,
                      email: emailToSend,
                    });
                    setEmailStatus("Email sent!");
                  } catch (e) {
                    setEmailStatus("Failed to send email");
                  }
                }}
                disabled={!emailToSend}
              >
                Send Email
              </Button>
              {emailStatus && (
                <Typography
                  variant="body2"
                  color={emailStatus.includes("Failed") ? "error" : "success"}
                  sx={{ mt: 1 }}
                >
                  {emailStatus}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={submit}>
                Save reminder
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {items.map((it) => (
          <Grid key={it.id} item xs={12} sm={6}>
            <Card
              sx={{
                minHeight: 200,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                background: "linear-gradient(135deg, #ede7f6, #d1c4e9)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  {it.name} — {it.dosage}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {it.time} • {it.frequency} • {it.category}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Tags: {(it.tags || []).join(", ")}
                </Typography>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    deleteMedReminder(it.id).then(() => reload());
                  }}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
