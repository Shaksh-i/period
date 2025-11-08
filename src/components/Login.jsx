import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link as MuiLink,
  Alert,
  Collapse,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { login as loginApi, validateLogin } from "../services/api";
import { useEffect } from "react";

const Login = ({ setUser }) => {
  const location = useLocation();
  // Prefill identifier from navigation state (e.g., after signup)
  const prefilling = location?.state?.identifier || "";
  const [identifier, setIdentifier] = useState(prefilling);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Basic client-side validation for login
  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // If identifier looks like an email, validate format; otherwise ensure it's non-empty
  const identifierValid =
    identifier && (identifier.includes("@") ? isEmailValid(identifier) : true);
  // Password must be at least 6 characters for the login button to be enabled
  const isPasswordValid = password && password.length >= 6;
  // credential validation state
  const [validCredentials, setValidCredentials] = useState(false);
  const [validating, setValidating] = useState(false);

  const isButtonDisabled =
    loading || !identifierValid || !isPasswordValid || !validCredentials;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const loginPayload = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };

      const { data } = await loginApi(loginPayload);

      setUser(data.user);

      // Store token + user for 7 days
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(
        "tokenData",
        JSON.stringify({ token: data.access_token, expiry, user: data.user })
      );

      setSuccess("Login successful!");
      setTimeout(() => {
        // Redirect to Home page instead of Dashboard
        navigate("/");
      }, 1500);
    } catch (err) {
      const backendMsg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Invalid username or password";
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  // Debounced backend credential validation: enable Login only when backend confirms credentials
  useEffect(() => {
    let timer = null;

    // Reset validation when inputs change
    setValidCredentials(false);

    if (!identifierValid || !isPasswordValid) {
      setValidating(false);
      return () => clearTimeout(timer);
    }

    setValidating(true);
    // debounce before calling backend
    timer = setTimeout(async () => {
      try {
        const payload = identifier.includes("@")
          ? { email: identifier, password }
          : { username: identifier, password };
        await validateLogin(payload);
        setValidCredentials(true);
      } catch (err) {
        setValidCredentials(false);
      } finally {
        setValidating(false);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [identifier, password, identifierValid, isPasswordValid]);

  // (previous simpler check removed) -- login button enabled only when validation passes

  return (
    <Paper
      sx={{
        p: 4,
        maxWidth: 400,
        mx: "auto",
        mt: 6,
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Login
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Username or Email"
          fullWidth
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!password && !isPasswordValid}
          helperText={
            !!password && !isPasswordValid
              ? "Password must be at least 6 characters"
              : ""
          }
        />

        {/* Credential validation feedback */}
        <Collapse in={identifierValid && isPasswordValid && validating}>
          <Alert severity="info">Validating credentials…</Alert>
        </Collapse>
        <Collapse
          in={
            identifierValid &&
            isPasswordValid &&
            !validating &&
            !validCredentials
          }
        >
          <Alert severity="error">Credentials do not match our records</Alert>
        </Collapse>

        <Collapse in={!!error}>
          {error && (
            <Alert severity="error" variant="filled">
              {error}
            </Alert>
          )}
        </Collapse>

        <Collapse in={!!success}>
          {success && (
            <Alert severity="success" variant="filled">
              {success}
            </Alert>
          )}
        </Collapse>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isButtonDisabled}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <MuiLink
          component={Link}
          to="/forgot-password"
          sx={{ mt: 1, textAlign: "right" }}
        >
          Forgot password?
        </MuiLink>
      </Box>
    </Paper>
  );
};

export default Login;
