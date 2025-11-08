import { useState, useEffect } from "react";
import {
  Container,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import CycleLog from "./components/CycleLog";
import SymptomLog from "./components/SymptomLog";
import MedicationReminder from "./components/MedicationReminder";
import HealthInsights from "./components/HealthInsights";
import NotificationCenter from "./components/NotificationCenter";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";
import ErrorElement from "./components/ErrorElement";
import { fetchUpcomingNotifications } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNotification, setModalNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenData = localStorage.getItem("tokenData");
    if (tokenData) {
      try {
        const { token, expiry, user } = JSON.parse(tokenData);
        if (Date.now() < expiry) {
          setUser(user);
        } else {
          localStorage.removeItem("tokenData");
        }
      } catch {
        localStorage.removeItem("tokenData");
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetchUpcomingNotifications();
        const notifications = res.data || [];
        const next = notifications.find((n) => !n.is_read);
        if (next) {
          setModalNotification(next);
          setModalOpen(true);
        }
      } catch {}
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const setAuth = (user, token) => {
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("tokenData", JSON.stringify({ token, expiry, user }));
    setUser(user);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tokenData");
    navigate("/");
  };

  return (
    <>
      <Dialog
        open={modalOpen && !!modalNotification}
        onClose={() => setModalOpen(false)}
      >
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <Typography>
            {modalNotification?.message || modalNotification?.title}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Layout user={user} setUser={setUser} logout={logout}>
        <Container maxWidth="md" sx={{ pb: { xs: 2, sm: 3, md: 4 } }}>
          <Routes>
            <Route
              path="/"
              element={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: { xs: "60vh", sm: "75vh", md: "85vh" },
                    background: "linear-gradient(to right, #f3e5f5, #ede7f6)",
                  }}
                >
                  <Paper
                    elevation={6}
                    sx={{
                      p: { xs: 2, sm: 4, md: 6 },
                      borderRadius: 4,
                      width: { xs: "98%", sm: "90%", md: "80%" },
                      maxWidth: 800,
                      textAlign: "center",
                      border: "2px solid #d1c4e9",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      <Box component="span" fontWeight="bold">
                        Welcome to{" "}
                      </Box>
                      <Box
                        component="span"
                        fontStyle="italic"
                        sx={{ color: "#ab47bc" }}
                      >
                        HerSync
                      </Box>
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    <Typography
                      variant="h6"
                      sx={{ mb: 4, color: "text.secondary" }}
                    >
                      Wellness that moves with you. Track, reflect, and thrive.
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={() => navigate("/dashboard")}
                      >
                        Go to Dashboard
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              }
            />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/cycles" element={<CycleLog user={user} />} />
            <Route path="/symptoms" element={<SymptomLog user={user} />} />
            <Route
              path="/reminders"
              element={<MedicationReminder user={user} />}
            />
            <Route path="/insights" element={<HealthInsights user={user} />} />
            <Route
              path="/notifications"
              element={<NotificationCenter user={user} />}
            />
            <Route path="/login" element={<Login setUser={setAuth} />} />
            <Route path="/signup" element={<Signup setUser={setAuth} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/*" element={<ErrorElement />} />
          </Routes>
        </Container>
      </Layout>
    </>
  );
}

export default App;
