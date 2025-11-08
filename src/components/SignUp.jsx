import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Collapse,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../services/api";

export default function Signup({ setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Basic client-side validation flags
  const isEmailValid = (email) => {
    // simple RFC-ish check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;
  const isButtonDisabled =
    loading ||
    !username ||
    !email ||
    !password ||
    !confirmPassword ||
    !isEmailValid(email) ||
    !passwordsMatch;

  const handleSignup = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await registerApi({ username, email, password });

      // Do NOT auto-login here. Redirect user to the login page to authenticate.
      setSuccess(res.data.msg || "Signup successful! Please login.");
      setTimeout(() => {
        // Redirect to Login and pass the email to prefill the login form
        navigate("/login", { state: { identifier: email } });
      }, 1000);
    } catch (err) {
      const backendMsg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Signup failed";
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>
          Create Account
        </Typography>

        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
        />

        <Collapse in={!!error}>
          {error && <Alert severity="error">{error}</Alert>}
        </Collapse>

        <Collapse in={!!success}>
          {success && <Alert severity="success">{success}</Alert>}
        </Collapse>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2, backgroundColor: "#6a1b9a" }}
          onClick={handleSignup}
          disabled={isButtonDisabled}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </Paper>
    </Box>
  );
}
