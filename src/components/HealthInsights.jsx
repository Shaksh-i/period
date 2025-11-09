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
    const handler = () => load();
    window.addEventListener("refresh-insights", handler);
    return () => window.removeEventListener("refresh-insights", handler);
  }, []);

  // Notify if today is predicted period start
  useEffect(() => {
    const nextPeriod = summary?.next_cycle_start ?? pred?.next_cycle_start;
    if (!nextPeriod) return;
    const today = new Date();
    const nextPeriodDate = new Date(nextPeriod);
    const todayStr = today.toISOString().slice(0, 10);
    const notifiedKey = `predictedPeriodNotified_${todayStr}`;
    const notifiedDate = localStorage.getItem(notifiedKey);
    if (
      today.toDateString() === nextPeriodDate.toDateString() &&
      !notifiedDate
    ) {
      if (window.Notification && Notification.permission === "granted") {
        new Notification("Period Tracker", {
          body: "Your period is predicted to start today. Take care!",
        });
        localStorage.setItem(notifiedKey, "1");
      } else if (window.Notification && Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            new Notification("Period Tracker", {
              body: "Your period is predicted to start today. Take care!",
            });
            localStorage.setItem(notifiedKey, "1");
          }
        });
      } else {
        alert("Your period is predicted to start today. Take care!");
        localStorage.setItem(notifiedKey, "1");
      }
    }
  }, [summary, pred]);

  const load = async () => {
    try {
      const s = await fetchInsightsSummary();
      const p = await fetchInsightsPredictions();
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
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 4,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: { xs: "100%", sm: 600, md: 1000 },
        mx: "auto",
        minHeight: { xs: "80vh", sm: "70vh" },
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#6a1b9a",
          fontWeight: "bold",
          textAlign: "center",
          mb: { xs: 2, sm: 4 },
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
        }}
      >
        Health Insights
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 4 },
          width: "100%",
        }}
      >
        {/* Next Period & Summary Card (more detailed) */}
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
              Cycle Summary
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body1">
                <b>Next Period:</b>
              </Typography>
              <Typography variant="h6" sx={{ color: "#4a148c", mb: 1 }}>
                {summary?.next_cycle_start ?? pred?.next_cycle_start ?? "—"}
              </Typography>
              <Typography variant="body1">
                <b>Avg Cycle:</b>{" "}
                {summary?.average_cycle
                  ? `${summary.average_cycle} days`
                  : "Unknown"}
              </Typography>
              <Typography variant="body1">
                <b>Most Common Symptom:</b>{" "}
                {summary?.most_common_symptom ?? "None yet"}
              </Typography>
            </Box>
            {/* Removed 'Often:' Chip for cleaner display */}
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
                  today.toDateString() === nextCycle.toDateString()
                ) {
                  tips.push(
                    "Your period is predicted to start today. Prepare pads/tampons/cups and rest as needed."
                  );
                  tips.push(
                    "Track your flow and symptoms for better predictions next month."
                  );
                } else if (
                  nextCycle &&
                  today > nextCycle &&
                  today <=
                    new Date(nextCycle.getTime() + 5 * 24 * 60 * 60 * 1000)
                ) {
                  tips.push(
                    "You are in your period. Hydrate, rest, and use heat pads for cramps."
                  );
                  tips.push(
                    "Monitor flow and consider iron-rich foods if heavy."
                  );
                } else if (
                  ovulation &&
                  Math.abs(today - ovulation) < 3 * 24 * 60 * 60 * 1000
                ) {
                  tips.push(
                    "You are near ovulation. You may feel energetic or have mild discomfort."
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
                  tips.push(
                    "PMS may occur: mood changes, bloating, or cravings."
                  );
                  tips.push(
                    "Magnesium-rich foods and gentle exercise can help."
                  );
                } else {
                  tips.push(
                    "Hydrate, rest, and keep tracking your cycles and symptoms."
                  );
                  tips.push("Eat a balanced diet and get enough sleep.");
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
