import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSymptomById } from "../services/api";
import { Box, Typography, Button, Paper } from "@mui/material";

export default function SymptomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [symptom, setSymptom] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // ✅ Convert id to number and validate
      const numericId = Number(id);
      if (!numericId || isNaN(numericId)) {
        setError("Invalid symptom ID");
        return;
      }

      try {
        const numericId = Number(id);
        const res = await getSymptomById(numericId);
        setSymptom(res.data);
      } catch (e) {
        console.error("[SymptomDetails] Error fetching symptom:", e);

        if (e.response?.status === 401) {
          setError("Unauthorized access. Please log in again.");
        } else if (e.response?.status === 404) {
          setError("Symptom not found.");
        } else if (e.response?.data?.msg) {
          setError(e.response.data.msg);
        } else if (e.message) {
          setError(e.message);
        } else {
          setError("An unknown error occurred while fetching data.");
        }
      }
    }

    fetchData();
  }, [id]);

  return (
    <Box sx={{ mt: 4, p: 3 }}>
      {/* 🔴 Error State */}
      {error ? (
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        </Paper>
      ) : !symptom ? (
        /* 🟡 Loading State */
        <Typography sx={{ mb: 3 }}>Loading...</Typography>
      ) : (
        /* 🟢 Data Loaded */
        <Box sx={{ background: "#e3f2fd", borderRadius: 2, p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Symptom Details
          </Typography>
          <pre
            style={{
              fontSize: "1rem",
              background: "#fff",
              padding: 12,
              borderRadius: 4,
            }}
          >
            {JSON.stringify(symptom, null, 2)}
          </pre>
        </Box>
      )}

      {/* ✅ Always visible Back Button */}
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate("/symptoms")}
      >
        Back to Symptoms
      </Button>
    </Box>
  );
}
