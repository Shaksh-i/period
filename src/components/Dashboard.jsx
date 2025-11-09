import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Typography,
} from "@mui/material";
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
import { useNavigate } from "react-router-dom";
import { fetchDashboard } from "../services/api";
import FeedbackForm from "./FeedbackForm";

function DashboardContainer({ user }) {
  const [userState, setUserState] = useState(user || null);
  const [loading, setLoading] = useState(false);
  const [careTipMsg, setCareTipMsg] = useState([]);
  // Removed emailSent state
  const navigate = useNavigate();

  // Always try to fetch dashboard data on mount, even if user is null
  useEffect(() => {
    const setTips = (u) => {
      // Print care tips as a list, similar to Health Insights tab
      const today = new Date();
      let summary = u?.insightsSummary || {};
      let pred = u?.insightsPrediction || {};
      if (Array.isArray(u?.insights)) {
        summary = u.insights[u.insights.length - 1] || {};
      }
      let tipsArr = [];
      const nextCycle = summary?.next_cycle_start
        ? new Date(summary.next_cycle_start)
        : null;
      const ovulation = pred?.ovulation_date
        ? new Date(pred.ovulation_date)
        : null;
      const avgCycle = summary?.average_cycle || 28;
      if (nextCycle && today.toDateString() === nextCycle.toDateString()) {
        tipsArr.push(
          "Your period is predicted to start today. Prepare pads/tampons/cups and rest as needed."
        );
        tipsArr.push(
          "Track your flow and symptoms for better predictions next month."
        );
      } else if (
        nextCycle &&
        today > nextCycle &&
        today <= new Date(nextCycle.getTime() + 5 * 24 * 60 * 60 * 1000)
      ) {
        tipsArr.push(
          "You are in your period. Hydrate, rest, and use heat pads for cramps."
        );
        tipsArr.push("Monitor flow and consider iron-rich foods if heavy.");
      } else if (
        ovulation &&
        Math.abs(today - ovulation) < 3 * 24 * 60 * 60 * 1000
      ) {
        tipsArr.push(
          "You are near ovulation. You may feel energetic or have mild discomfort."
        );
        tipsArr.push(
          "Fertile window: consider contraception or conception planning."
        );
        tipsArr.push(
          "Track cervical fluid and BBT for more accurate predictions."
        );
      } else if (
        nextCycle &&
        today < nextCycle &&
        nextCycle - today < (avgCycle * 24 * 60 * 60 * 1000) / 2
      ) {
        tipsArr.push("PMS may occur: mood changes, bloating, or cravings.");
        tipsArr.push("Magnesium-rich foods and gentle exercise can help.");
      } else {
        tipsArr.push(
          "Hydrate, rest, and keep tracking your cycles and symptoms."
        );
        tipsArr.push("Eat a balanced diet and get enough sleep.");
      }
      setCareTipMsg(tipsArr);
    };
    // Always fetch dashboard data on mount
    fetchDashboard()
      .then((res) => {
        setUserState(res.data);
        setTips(res.data);
      })
      .catch(() => setUserState(null));
    const handler = () => {
      fetchDashboard()
        .then((res) => {
          setUserState(res.data);
          setTips(res.data);
        })
        .catch(() => setUserState(null));
    };
    window.addEventListener("refresh-insights", handler);
    return () => window.removeEventListener("refresh-insights", handler);
  }, []);

  // Removed handleSendPeriodEmail

  if (!userState) {
    return (
      <Box sx={{ mt: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" align="center" color="error">
          Please log in to view your dashboard.
        </Typography>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </Box>
      </Box>
    );
  }

  const cycleLogs = userState?.cycleLogs || [];
  // Additive: Prepare data for period duration graph
  const periodDurationData = cycleLogs
    .map((cycle) => ({
      date: cycle.start_date,
      duration:
        cycle.end_date && cycle.start_date
          ? (new Date(cycle.end_date) - new Date(cycle.start_date)) /
            (1000 * 60 * 60 * 24)
          : null,
    }))
    .filter((d) => d.duration !== null);

  // Additive: Prepare data for symptom trends graph
  const symptoms = userState?.symptoms || [];
  const symptomTrendMap = {};
  symptoms.forEach((symptom) => {
    const date = symptom.date || symptom;
    const type =
      symptom.symptom_type || (typeof symptom === "string" ? symptom : "Other");
    if (!symptomTrendMap[date]) symptomTrendMap[date] = {};
    symptomTrendMap[date][type] = (symptomTrendMap[date][type] || 0) + 1;
  });
  const allTypes = Array.from(
    new Set(symptoms.map((s) => s.symptom_type).filter(Boolean))
  );
  const symptomTrendData = Object.entries(symptomTrendMap).map(
    ([date, types]) => {
      const entry = { date };
      allTypes.forEach((type) => {
        entry[type] = types[type] || 0;
      });
      return entry;
    }
  );

  const dashboardSections = [
    {
      title: "Cycle Details",
      gradient: "linear-gradient(135deg, #f3e5f5, #fff5e1)",
      content: (
        <>
          <Typography>Cycle Length: {userState.cycleLength || "-"}</Typography>
          <Typography>Last Period: {userState.lastPeriod || "-"}</Typography>
          <Typography>
            Next Predicted Period: {userState.nextPeriod || "-"}
          </Typography>
          <Typography>
            Ovulation Period:{" "}
            {userState.ovulationPeriod ||
              userState.insights?.find?.((i) =>
                i.toLowerCase().includes("ovulation")
              ) ||
              "-"}
          </Typography>
        </>
      ),
    },
    {
      title: "All Symptoms",
      gradient: "linear-gradient(135deg, #ede7f6, #e1bee7)",
      content: (
        <ul>
          {(userState.symptoms || []).map((symptom, idx) => (
            <li key={idx}>
              {typeof symptom === "string"
                ? symptom
                : `${symptom.date} — ${symptom.symptom_type || ""}`}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "All Cycles",
      gradient: "linear-gradient(135deg, #f8bbd0, #f3e5f5)",
      content: (
        <ul>
          {(userState.cycleLogs || []).map((cycle, idx) => (
            <li key={cycle.id || idx}>
              {cycle.start_date} → {cycle.end_date || "ongoing"} (Flow:{" "}
              {cycle.flow_intensity})
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Reminders",
      gradient: "linear-gradient(135deg, #d1c4e9, #ede7f6)",
      content: (
        <ul>
          {(userState.reminders || []).map((reminder, idx) => (
            <li key={idx}>{reminder}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "Health Insights",
      gradient: "linear-gradient(135deg, #fff5e1, #f3e5f5)",
      content: (
        <ul>
          {(userState.insights || []).map((insight, idx) => (
            <li key={idx}>{insight}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "Feedback & Suggestions",
      gradient: "linear-gradient(135deg, #e1bee7, #f8bbd0)",
      content: <FeedbackForm />,
    },
  ];

  return (
    <Box sx={{ mt: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 4 } }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#6a1b9a",
          textAlign: "center",
          mb: 4,
        }}
      >
        Welcome {userState.name || userState.email}
      </Typography>
      {/* Period Cycle Duration Graph (additive, robust fallback) */}
      {periodDurationData.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            mb: 4,
          }}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 900,
              background: "linear-gradient(135deg, #e1bee7, #f8bbd0)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              mx: "auto",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#4a148c",
                  mb: 2,
                  textAlign: "center",
                }}
              >
                Period Cycle Duration Trends
              </Typography>
              <Box sx={{ width: "100%", minHeight: 200 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={periodDurationData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#aaa" />
                    <XAxis dataKey="date" />
                    <YAxis
                      label={{
                        value: "Duration (days)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      name="Duration"
                      stroke="#6a1b9a"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                        stroke: "#4a148c",
                        strokeWidth: 2,
                        fill: "#fff",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No period cycle data available to display chart.
          </Typography>
        </Box>
      )}

      {/* Symptom Trends Graph (additive, robust fallback) */}
      {symptomTrendData.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            mb: 4,
          }}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 900,
              background: "linear-gradient(135deg, #ede7f6, #e1bee7)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              mx: "auto",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#4a148c",
                  mb: 2,
                  textAlign: "center",
                }}
              >
                Symptom Trends Over Time
              </Typography>
              <Box sx={{ width: "100%", minHeight: 200 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={symptomTrendData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#aaa" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {allTypes.map((type, idx) => (
                      <Line
                        key={type}
                        type="monotone"
                        dataKey={type}
                        name={type}
                        stroke={
                          [
                            "#6a1b9a",
                            "#f57c00",
                            "#4a148c",
                            "#e91e63",
                            "#00bcd4",
                          ][idx % 5]
                        }
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No symptom data available to display chart.
          </Typography>
        </Box>
      )}
      {/* Welcome heading moved to top */}

      {careTipMsg && careTipMsg.length > 0 && (
        <Card
          sx={{
            mb: 4,
            background: "#fffde7",
            border: "1px solid #ffe082",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            maxWidth: "100%",
            width: { xs: "100%", sm: 600, md: 900 },
            mx: "auto",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{ color: "#f57c00", fontWeight: "bold", mb: 1 }}
            >
              Period Care Tips
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
              {careTipMsg.map((tip, idx) => (
                <li key={idx} style={{ marginBottom: "6px" }}>
                  {tip}
                </li>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {dashboardSections.map(({ title, content, gradient }, idx) => (
        <Box
          key={idx}
          sx={{
            mb: 3,
            width: "100%",
            maxWidth: 900,
            mx: "auto",
            display: "flex",
            justifyContent: "center",
            px: { xs: 0, sm: 2 },
          }}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 900,
              background: gradient,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              mx: "auto",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", textAlign: "center" }}
              >
                {title}
              </Typography>
              <Box>{content}</Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}

export default DashboardContainer;
