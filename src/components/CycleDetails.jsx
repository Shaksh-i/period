import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCycleById } from "../services/api";
import { Box, Typography, Button, Paper } from "@mui/material";

export default function CycleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (isNaN(id)) {
        setError("Invalid cycle ID");
        return;
      }

      try {
        const res = await getCycleById(id);
        setCycle(res.data);
      } catch (e) {
        console.error("[CycleDetails] Error fetching cycle:", e);

        if (e.response?.status === 401) {
          setError("Unauthorized access. Please log in again.");
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
      {/* If there's an error */}
      {error ? (
        <Paper sx={{ p: 4, mb: 3 }}>
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        </Paper>
      ) : !cycle ? (
        // While loading
        <Typography sx={{ mb: 3 }}>Loading...</Typography>
      ) : (
        // When data is available
        <Box sx={{ background: "#f3e5f5", borderRadius: 2, p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Cycle Details
          </Typography>
          <pre
            style={{
              fontSize: "1rem",
              background: "#fff",
              padding: 12,
              borderRadius: 4,
            }}
          >
            {JSON.stringify(cycle, null, 2)}
          </pre>
        </Box>
      )}

      {/* ✅ Back to Cycles Button - always visible */}
      <Button
        variant="contained"
        color="secondary"
        onClick={() => navigate("/cycles")}
      >
        Back to Cycles
      </Button>
    </Box>
  );
}
