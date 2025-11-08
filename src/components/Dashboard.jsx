import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
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
import { fetchDashboard, triggerPeriodPredictionEmails } from "../services/api";

function DashboardContainer() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [careTipMsg, setCareTipMsg] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard()
      .then((res) => {
        setUser(res.data);
        let tips =
          "- Stay hydrated\n- Get enough rest\n- Maintain a balanced diet\n- Practice gentle exercise\n- Track your symptoms";
        if (res.data?.insights?.length > 0) {
          tips = res.data.insights[res.data.insights.length - 1];
        }
        setCareTipMsg(
          `You are expected to get your period soon. Please follow the care tips below:\n\n${tips}`
        );
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSendPeriodEmail = async () => {
    try {
      await triggerPeriodPredictionEmails();
      setEmailSent(true);
    } catch {
      setEmailSent(false);
    }
  };

  if (loading) {
    return <Paper sx={{ p: 4, mt: 4 }}>Loading dashboard...</Paper>;
  }

  if (!user) {
    return (
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            backgroundColor: "rgba(243, 229, 245, 0.6)", // transparent lavender
            padding: { xs: 3, md: 6 },
            borderRadius: 4,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
            Dashboard Overview
          </Typography>

          <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
            Please log in to view your dashboard.
          </Typography>

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  const cycleLogs = user.cycleLogs || [];

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
          background: "linear-gradient(135deg, #f3e5f5, #ede7f6)",
          padding: 2,
          borderRadius: 2,
        }}
      >
        Welcome {user.name || user.email}
      </Typography>

      {cycleLogs.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Card
            sx={{
              mb: 4,
              background: "linear-gradient(135deg, #d1c4e9, #f8bbd0)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              width: { xs: "100%", sm: 600, md: 900 },
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              },
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
                Cycle Length Over Time
              </Typography>
              <Box sx={{ width: "100%", minHeight: 200 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={cycleLogs}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#aaa" />
                    <XAxis dataKey="date" />
                    <YAxis
                      label={{
                        value: "Days",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        fontSize: "14px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "14px" }} />
                    <Line
                      type="monotone"
                      dataKey="length"
                      name="Cycle Length"
                      stroke="#6a1b9a"
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
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
      )}

      {careTipMsg && (
        <Card
          sx={{
            mb: 4,
            background: "#fffde7",
            border: "1px solid #ffe082",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                margin: 0,
              }}
            >
              {careTipMsg}
            </pre>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={handleSendPeriodEmail}
              disabled={emailSent}
            >
              {emailSent ? "Care Tips Email Sent" : "Send Care Tips Email"}
            </Button>
          </CardContent>
        </Card>
      )}

      {[
        {
          title: "Cycle Details",
          gradient: "linear-gradient(135deg, #f3e5f5, #fff5e1)",
          content: (
            <>
              <Typography>Cycle Length: {user.cycleLength || "-"}</Typography>
              <Typography>Last Period: {user.lastPeriod || "-"}</Typography>
              <Typography>
                Next Predicted Period: {user.nextPeriod || "-"}
              </Typography>
              <Typography>
                Ovulation Period:{" "}
                {user.ovulationPeriod ||
                  user.insights?.find?.((i) =>
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
              {(user.symptoms || []).map((symptom, idx) => (
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
              {(user.cycleLogs || []).map((cycle, idx) => (
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
              {(user.reminders || []).map((reminder, idx) => (
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
              {(user.insights || []).map((insight, idx) => (
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
      ].map(({ title, content, gradient }, idx) => (
        <Box
          key={idx}
          sx={{
            mb: 3,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 900,
              background: gradient,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 3,
              }}
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
// Define FeedbackForm first
function FeedbackForm() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!feedback.trim()) {
      setError("Please enter your feedback.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Typography color="success.main" sx={{ mt: 2, textAlign: "center" }}>
        Thank you for your feedback!
      </Typography>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: "100%" }}>
      <TextField
        label="Your feedback"
        multiline
        rows={4}
        fullWidth
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        error={!!error}
        helperText={error}
        variant="outlined"
      />
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "#6a1b9a",
            fontWeight: "bold",
            px: 4,
            py: 1,
            "&:hover": { backgroundColor: "#4a148c" },
          }}
        >
          Submit Feedback
        </Button>
      </Box>
    </Box>
  );
}

export default DashboardContainer;
