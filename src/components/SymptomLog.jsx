import React, { useEffect, useState } from "react";
import {
  fetchSymptoms,
  createSymptom,
  fetchCycles,
  deleteSymptom,
  getSymptomById,
  updateSymptom,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Slider,
} from "@mui/material";
import SymptomDetails from "./SymptomDetails";
import Paper from "@mui/material/Paper";
// Symptom categories for dropdowns
const symptomCategories = {
  Physical: [
    "Cramps",
    "Headache",
    "Back pain",
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
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [form, setForm] = useState({
    date: "",
    category: "Physical",
    symptom_type: "Cramps",
    severity: 3,
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Helper to reload symptoms and cycles
  const reload = async () => {
    try {
      const [symptomRes, cycleRes] = await Promise.all([
        fetchSymptoms(),
        fetchCycles(),
      ]);
      setSymptoms(symptomRes.data || []);
      setCycles(cycleRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line
  }, []);

  if (!user) {
    return (
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Please log in to view the Symptoms.
        </Typography>
      </Paper>
    );
  }

  const loadCycles = async () => {
    try {
      const res = await fetchCycles();
      setCycles(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };
  // ...existing code...

  const submit = async () => {
    if (!form.date) return alert("Date required");
    try {
      await createSymptom(form);
      setForm({
        ...form,
        symptom_type: symptomCategories[form.category][0],
        notes: "",
      });
      await reload();
      setTimeout(() => {
        if (window.dispatchEvent) {
          window.dispatchEvent(new Event("refresh-insights"));
        }
      }, 0);
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

  // Edit handlers
  const startEdit = (symptom) => {
    setEditingId(symptom.id);
    setEditForm({
      date: symptom.date,
      category: symptom.category || "Physical",
      symptom_type: symptom.symptom_type,
      severity: symptom.severity,
      notes: symptom.notes || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const submitEdit = async (id) => {
    try {
      await updateSymptom(id, editForm);
      setEditingId(null);
      setEditForm({});
      await reload();
      // Trigger health insights refresh
      setTimeout(() => {
        if (window.dispatchEvent) {
          window.dispatchEvent(new Event("refresh-insights"));
        }
      }, 0);
    } catch (e) {
      alert("Failed to update symptom");
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
            <Grid sx={{ minWidth: 180, flex: 1 }}>
              <TextField
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Grid>
            <Grid sx={{ minWidth: 180, flex: 1 }}>
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
            <Grid sx={{ minWidth: 180, flex: 1 }}>
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
            <Grid sx={{ display: "flex", alignItems: "center", minWidth: 120 }}>
              <Slider
                value={Number(form.severity) || 3}
                min={1}
                max={5}
                step={1}
                marks
                valueLabelDisplay="auto"
                onChange={(_, v) => setForm({ ...form, severity: v })}
                sx={{ width: 120 }}
              />
            </Grid>
            <Grid sx={{ display: "flex", alignItems: "center", minWidth: 100 }}>
              <Button variant="contained" onClick={submit} sx={{ mt: 1 }}>
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
                  if (editingId === s.id) {
                    return (
                      <li
                        key={s.id}
                        style={{
                          marginBottom: 4,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <TextField
                          type="date"
                          size="small"
                          value={editForm.date || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, date: e.target.value })
                          }
                          sx={{ mr: 1, width: 120 }}
                        />
                        <TextField
                          select
                          size="small"
                          value={editForm.category || "Physical"}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              category: e.target.value,
                              symptom_type:
                                symptomCategories[e.target.value][0],
                            })
                          }
                          sx={{ mr: 1, width: 120 }}
                        >
                          {Object.keys(symptomCategories).map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          size="small"
                          value={editForm.symptom_type || ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              symptom_type: e.target.value,
                            })
                          }
                          sx={{ mr: 1, width: 140 }}
                        >
                          {(symptomCategories[editForm.category] || []).map(
                            (type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            )
                          )}
                        </TextField>
                        <Slider
                          value={Number(editForm.severity) || 3}
                          min={1}
                          max={5}
                          step={1}
                          marks
                          valueLabelDisplay="auto"
                          onChange={(_, v) =>
                            setEditForm({ ...editForm, severity: v })
                          }
                          sx={{ width: 100, mr: 1 }}
                        />
                        <TextField
                          size="small"
                          value={editForm.notes || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, notes: e.target.value })
                          }
                          placeholder="Notes"
                          sx={{ mr: 1, width: 120 }}
                        />
                        <Button
                          size="x-small"
                          color="success"
                          variant="contained"
                          sx={{
                            mr: 0.5,
                            minWidth: 60,
                            fontSize: "0.75rem",
                            py: 0.5,
                            px: 1,
                          }}
                          onClick={() => submitEdit(s.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="x-small"
                          color="inherit"
                          variant="outlined"
                          sx={{
                            mr: 0.5,
                            minWidth: 60,
                            fontSize: "0.75rem",
                            py: 0.5,
                            px: 0.5,
                          }}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </li>
                    );
                  }
                  return (
                    <li
                      key={s.id}
                      style={{
                        marginBottom: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ flex: 1 }}>
                        {s.date}: {s.symptom_type} (Severity:{" "}
                        {severityLabels[s.severity] || s.severity})
                      </span>
                      <Button
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 1 }}
                        onClick={() => startEdit(s)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ ml: 1 }}
                        onClick={async () => {
                          if (window.confirm("Delete this symptom?")) {
                            await deleteSymptom(s.id);
                            await reload();
                            setTimeout(() => {
                              if (window.dispatchEvent) {
                                window.dispatchEvent(
                                  new Event("refresh-insights")
                                );
                              }
                            }, 0);
                          }
                        }}
                      >
                        Delete
                      </Button>
                      {/* New: View Details Button with navigation */}
                      <Button
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ ml: 1 }}
                        onClick={() => navigate(`/symptoms/${s.id}`)}
                      >
                        View Details
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Removed modal/panel symptom details logic. Details shown only on separate page via navigation. */}
    </Box>
  );
}
