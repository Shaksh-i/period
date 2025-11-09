import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Collapse,
  InputAdornment,
} from "@mui/material";
import UserIcon from "../assets/user.svg";
import LockIcon from "../assets/lock.svg";
import EmailIcon from "../assets/email.svg";
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
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
    try {
      const res = await registerApi({ username, email, password });
      setSuccess(res.data.msg || "Signup successful! Please login.");
      setTimeout(() => {
        navigate("/login", { state: { identifier: email } });
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: { xs: "80vh", sm: "70vh" },
        mt: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4, md: 6 },
          width: { xs: "98%", sm: "80%", md: 400 },
          maxWidth: 400,
          borderRadius: 4,
          mx: "auto",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}
        >
          Create Account
        </Typography>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img src={UserIcon} alt="user" width={24} height={24} />
              </InputAdornment>
            ),
          }}
          autoFocus
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img src={EmailIcon} alt="email" width={24} height={24} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img src={LockIcon} alt="lock" width={24} height={24} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <img src={LockIcon} alt="lock" width={24} height={24} />
              </InputAdornment>
            ),
          }}
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
          sx={{
            mt: 2,
            fontWeight: "bold",
          }}
          onClick={handleSignup}
          disabled={isButtonDisabled}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </Paper>
    </Box>
  );
}
