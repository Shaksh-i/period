import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import {
  fetchInsightsSummary,
  fetchInsightsPredictions,
} from "../services/api";

export default function HealthInsights({ user }) {
  const [summary, setSummary] = useState(null);
  const [pred, setPred] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const tokenData = JSON.parse(localStorage.getItem("tokenData"));
      const token = tokenData?.token;

      const s = await fetchInsightsSummary({
        headers: { Authorization: `Bearer ${token}` },
      });
      const p = await fetchInsightsPredictions({
        headers: { Authorization: `Bearer ${token}` },
      });

      setSummary(s.data || {});
      setPred(p.data || {});
    } catch (e) {
      console.error("AxiosError", e);
    }
  };

  const cardBaseStyle = {
    flex: 1,
    height: 400,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    borderRadius: 3,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    padding: 3,
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
    cursor: "pointer",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
    },
  };

  return (
    <Box
      sx={{
        backgroundColor: "rgba(243, 229, 245, 0.6)",
        padding: 4,
        borderRadius: 4,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "100%",
        mx: "auto",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#6a1b9a",
          fontWeight: "bold",
          textAlign: "center",
          mb: 4,
        }}
      >
        Health Insights
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          width: "100%",
        }}
      >
        {/* Next Period Card */}
        <Card
          elevation={4}
          sx={{
            ...cardBaseStyle,
            background: "linear-gradient(135deg, #f8bbd0, #f3e5f5)",
            "&:hover": {
              ...cardBaseStyle["&:hover"],
              background: "linear-gradient(135deg, #f48fb1, #f3e5f5)",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", width: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Next Period
            </Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {summary?.next_cycle_start ?? pred?.next_cycle_start ?? "—"}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {summary?.average_cycle
                ? `Avg cycle: ${summary.average_cycle} days`
                : "Average cycle unknown"}
            </Typography>
            <Chip
              label={
                summary?.most_common_symptom
                  ? `Often: ${summary.most_common_symptom}`
                  : "No common symptom yet"
              }
              sx={{
                fontSize: "0.9rem",
                padding: "0.4rem",
                backgroundColor: "#ab47bc",
                color: "#fff",
                mt: 1,
              }}
            />
          </CardContent>
        </Card>

        {/* Ovulation Prediction Card */}
        <Card
          elevation={4}
          sx={{
            ...cardBaseStyle,
            background: "linear-gradient(135deg, #d1c4e9, #ede7f6)",
            "&:hover": {
              ...cardBaseStyle["&:hover"],
              background: "linear-gradient(135deg, #b39ddb, #ede7f6)",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", width: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Ovulation Prediction
            </Typography>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {pred?.ovulation_date ?? "Ovulation: —"}
            </Typography>
            <Typography variant="body2">
              {pred?.fertile_window
                ? `Fertile window: ${pred.fertile_window}`
                : "Add more BBT & cervical fluid logs for accuracy"}
            </Typography>
          </CardContent>
        </Card>

        {/* Care Tips Card */}
        <Card
          elevation={4}
          sx={{
            ...cardBaseStyle,
            background: "linear-gradient(135deg, #fff5e1, #ffe6ec)",
            "&:hover": {
              ...cardBaseStyle["&:hover"],
              background: "linear-gradient(135deg, #ffe0b2, #ffcdd2)",
            },
          }}
        >
          <CardContent sx={{ textAlign: "center", width: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Care Tips
            </Typography>
            <Box
              component="ul"
              sx={{
                listStyle: "none",
                padding: 0,
                mt: 1,
                fontSize: "0.95rem",
                textAlign: "center",
              }}
            >
              {(() => {
                const today = new Date();
                const nextCycle = summary?.next_cycle_start
                  ? new Date(summary.next_cycle_start)
                  : null;
                const ovulation = pred?.ovulation_date
                  ? new Date(pred.ovulation_date)
                  : null;
                const avgCycle = summary?.average_cycle || 28;
                let tips = [];

                if (
                  nextCycle &&
                  today >= nextCycle &&
                  today <=
                    new Date(nextCycle.getTime() + 5 * 24 * 60 * 60 * 1000)
                ) {
                  tips.push("Rest, hydrate, and use heat pads for cramps.");
                  tips.push("Track flow and symptoms for better predictions.");
                  tips.push(
                    "Consider iron-rich foods or supplements if flow is heavy."
                  );
                } else if (
                  ovulation &&
                  Math.abs(today - ovulation) < 3 * 24 * 60 * 60 * 1000
                ) {
                  tips.push(
                    "You may feel energetic or experience mild discomfort."
                  );
                  tips.push(
                    "Fertile window: consider contraception or conception planning."
                  );
                  tips.push(
                    "Track cervical fluid and BBT for more accurate predictions."
                  );
                } else if (
                  nextCycle &&
                  today < nextCycle &&
                  nextCycle - today < (avgCycle * 24 * 60 * 60 * 1000) / 2
                ) {
                  tips.push("Mood changes or bloating may occur.");
                  tips.push("Magnesium-rich foods can help with PMS symptoms.");
                } else {
                  tips.push("Hydrate, rest, and track symptoms.");
                  tips.push("Try magnesium-rich foods for cramps.");
                }

                return tips.map((tip, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>
                    {tip}
                  </li>
                ));
              })()}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
