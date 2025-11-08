import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import React, { useEffect, useState } from "react";
import {
  fetchCycles,
  createCycle,
  deleteCycle,
  updateCycle,
} from "../services/api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Paper,
} from "@mui/material";

export default function CycleLog({ user }) {
  if (!user) {
    return (
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Please log in to view your Cycle logs.
        </Typography>
      </Paper>
    );
  }

  const [cycles, setCycles] = useState([]);
  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    flow_intensity: "medium",
    notes: "",
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    reload();
  }, []);

  const reload = async () => {
    try {
      const res = await fetchCycles();
      setCycles(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const submit = async () => {
    // Always send dates as YYYY-MM-DD strings, and null for empty end_date
    const payload = {
      ...form,
      start_date: form.start_date ? form.start_date : null,
      end_date: form.end_date && form.end_date !== "" ? form.end_date : null,
    };
    if (!payload.start_date) return alert("Start date required");
    if (payload.end_date && payload.end_date < payload.start_date) {
      return alert("End date cannot be before start date.");
    }
    try {
      if (editId) {
        await updateCycle(editId, payload);
        alert("Cycle updated successfully");
      } else {
        await createCycle(payload);
        alert("Cycle added successfully");
      }
      setForm({
        start_date: "",
        end_date: "",
        flow_intensity: "medium",
        notes: "",
      });
      setEditId(null);
      reload();
    } catch (e) {
      console.error(e);
      alert(editId ? "Failed to update cycle" : "Failed to add cycle");
    }
  };

  const chartData = [...cycles]
    .filter((c) => c.end_date)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .map((c) => {
      const start = new Date(c.start_date);
      const end = new Date(c.end_date);
      const duration = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return {
        // include a single `date` field for the x-axis (matches Dashboard's `date` key)
        date: c.start_date,
        // keep the full range for display in tooltips / lists
        name: `${c.start_date} - ${c.end_date}`,
        Duration: duration,
      };
    });

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#6a1b9a",
          textAlign: "center",
          mb: 4,
          background: "linear-gradient(135deg, #e1bee7, #f8bbd0)",
          padding: 2,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        Cycle Log
      </Typography>

      {chartData.length > 0 && (
        <Box
          sx={{
            background: "linear-gradient(135deg, #d1c4e9, #f3e5f5)",
            p: 3,
            borderRadius: 3,
            mb: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#4a148c",
              mb: 2,
              textAlign: "center",
            }}
          >
            Cycle Duration Overview
          </Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#aaa" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                // Align with Dashboard: no angle, textAnchor middle
              />
              <YAxis
                label={{
                  value: "Duration (days)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 14,
                }}
                allowDecimals={false}
                domain={[0, (dataMax) => Math.max(10, dataMax + 2)]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                // Show the full start->end range as the tooltip label (instead of raw date)
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.date === label);
                  return item ? item.name : label;
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              />
              <Line
                type="monotone"
                dataKey="Duration"
                stroke="#6a1b9a"
                strokeWidth={3}
                dot={{ r: 5, stroke: "#4a148c", strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      <Card
        sx={{ mb: 4, background: "linear-gradient(135deg, #f8bbd0, #f3e5f5)" }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="End date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                inputProps={{
                  min: form.start_date || undefined,
                }}
                error={Boolean(
                  form.end_date &&
                    form.start_date &&
                    form.end_date < form.start_date
                )}
                helperText={
                  form.end_date &&
                  form.start_date &&
                  form.end_date < form.start_date
                    ? "End date cannot be before start date."
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="Flow"
                value={form.flow_intensity}
                fullWidth
                onChange={(e) =>
                  setForm({ ...form, flow_intensity: e.target.value })
                }
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="heavy">Heavy</MenuItem>
                <MenuItem value="spotting">Spotting</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={submit}>
                {editId ? "Update cycle" : "Add cycle"}
              </Button>
              {editId && (
                <Button
                  sx={{ ml: 2 }}
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      start_date: "",
                      end_date: "",
                      flow_intensity: "medium",
                      notes: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} alignItems="stretch">
        {(cycles || []).map((c) => (
          <Grid key={c.id} item xs={12} sm={6} md={4}>
            <Card
              sx={{
                minHeight: { xs: 160, sm: 200, md: 220 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #f3e5f5, #e1bee7)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  {c.start_date}  {c.end_date || "ongoing"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Flow: {c.flow_intensity}
                </Typography>
                <Typography variant="body2">{c.notes}</Typography>
              </CardContent>
              <Box
                sx={{ p: 2, pt: 0, display: "flex", gap: 1, flexWrap: "wrap" }}
              >
                <Button
                  sx={{ mt: 1 }}
                  color="primary"
                  variant="outlined"
                  onClick={() => {
                    setEditId(c.id);
                    setForm({
                      start_date: c.start_date,
                      end_date: c.end_date || "",
                      flow_intensity: c.flow_intensity || "medium",
                      notes: c.notes || "",
                    });
                  }}
                >
                  Edit
                </Button>
                <Button
                  sx={{ mt: 1 }}
                  color="error"
                  variant="outlined"
                  onClick={() => {
                    deleteCycle(c.id).then(reload);
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
