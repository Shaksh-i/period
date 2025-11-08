import React, { useEffect, useState } from "react";
import { fetchSymptoms, createSymptom, fetchCycles } from "../services/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Slider,
  Button,
  Paper,
} from "@mui/material";

const symptomCategories = {
  Physical: [
    "Cramps",
    "Headache",
    "Breast tenderness",
    "Bloating",
    "Fatigue",
    "Acne",
  ],
  Emotional: [
    "Mood swings",
    "Irritability",
    "Anxiety",
    "Depression",
    "Low motivation",
  ],
  Behavioral: [
    "Appetite change",
    "Sleep disturbance",
    "Energy level",
    "Libido fluctuation",
  ],
  Menstrual: ["Flow intensity", "Duration", "Spotting"],
};

export default function SymptomLog({ user }) {
  if (!user) {
    return (
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Please log in to view the Symptoms.
        </Typography>
      </Paper>
    );
  }

  const [symptoms, setSymptoms] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [form, setForm] = useState({
    date: "",
    category: "Physical",
    symptom_type: "Cramps",
    severity: 3,
    notes: "",
  });

  useEffect(() => {
    reload();
    loadCycles();
  }, []);

  const reload = async () => {
    try {
      const res = await fetchSymptoms();
      setSymptoms(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCycles = async () => {
    try {
      const res = await fetchCycles();
      setCycles(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const submit = async () => {
    if (!form.date) return alert("Date required");
    try {
      await createSymptom(form);
      setForm({
        ...form,
        symptom_type: symptomCategories[form.category][0],
        notes: "",
      });
      reload();
    } catch (e) {
      console.error(e);
      alert("Failed");
    }
  };

  const latestCycles = [...cycles]
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    .slice(0, 2);

  const symptomsByCycle = latestCycles.map((cycle) => ({
    cycle,
    symptoms: symptoms.filter((s) => {
      const d = new Date(s.date);
      return (
        d >= new Date(cycle.start_date) &&
        (!cycle.end_date || d <= new Date(cycle.end_date))
      );
    }),
  }));

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
        Symptom Log
      </Typography>

      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #f3e5f5, #f6f67eff)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          },
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Category"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                    symptom_type: symptomCategories[e.target.value][0],
                  })
                }
                fullWidth
              >
                {Object.keys(symptomCategories).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                label="Symptom"
                value={form.symptom_type}
                onChange={(e) =>
                  setForm({ ...form, symptom_type: e.target.value })
                }
                fullWidth
              >
                {symptomCategories[form.category].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              md={2}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "flex-start", sm: "center" },
              }}
            >
              <Slider
                value={Number(form.severity) || 3}
                min={1}
                max={5}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(_, v) => setForm({ ...form, severity: v })}
                sx={{ width: { xs: 120, sm: 120, md: 140 } }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              md={1}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "flex-start", sm: "center" },
              }}
            >
              <Button
                variant="contained"
                onClick={submit}
                sx={{ mt: { xs: 1, sm: 0 } }}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {symptomsByCycle.map(({ cycle, symptoms }) => (
        <Card
          key={cycle.id}
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, #ede7f6, #e482a1ff)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
            },
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Cycle: {cycle.start_date} – {cycle.end_date || "Ongoing"}
            </Typography>
            {symptoms.length === 0 ? (
              <Typography>No symptoms logged for this cycle.</Typography>
            ) : (
              <ul
                style={{
                  paddingLeft: 16,
                  fontSize: "1.05rem",
                  margin: 0,
                  wordBreak: "break-word",
                }}
              >
                {symptoms.map((s) => {
                  const severityLabels = {
                    1: "Very Mild",
                    2: "Mild",
                    3: "Moderate",
                    4: "Severe",
                    5: "Very Severe",
                  };
                  return (
                    <li key={s.id} style={{ marginBottom: 4 }}>
                      {s.date}: {s.symptom_type} (Severity:{" "}
                      {severityLabels[s.severity] || s.severity})
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
