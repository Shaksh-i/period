import React, { useState } from "react";
import { Paper, Typography, TextField, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await forgotPassword({ email });
      setMessage("If this email is registered, a reset link has been sent.");
    } catch (err) {
      setError("Failed to send reset link.");
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        Forgot Password
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <Typography color="error">{error}</Typography>}
        {message && <Typography color="primary">{message}</Typography>}
        <Button variant="contained" color="primary" type="submit">
          Send Reset Link
        </Button>
      </Box>
    </Paper>
  );
};

export default ForgotPassword;
