import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link as MuiLink,
  Alert,
  Collapse,
  InputAdornment,
} from "@mui/material";
import { useNavigate, Link, useLocation } from "react-router-dom";
import UserIcon from "../assets/user.svg";
import LockIcon from "../assets/lock.svg";
import { login as loginApi, validateLogin } from "../services/api";

export default function Login({ setUser }) {
  const location = useLocation();
  const prefilling = location?.state?.identifier || "";
  const [identifier, setIdentifier] = useState(prefilling);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validCredentials, setValidCredentials] = useState(false);
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const identifierValid =
    identifier && (identifier.includes("@") ? isEmailValid(identifier) : true);
  const isPasswordValid = password && password.length >= 6;
  const isButtonDisabled =
    loading || !identifierValid || !isPasswordValid || !validCredentials;

  useEffect(() => {
    let timer;
    if (identifierValid && isPasswordValid) {
      setValidating(true);
      let payload = {};
      if (identifier.includes("@")) {
        payload = { email: identifier, password };
      } else {
        payload = { username: identifier, password };
      }
      validateLogin(payload)
        .then((res) => {
          setValidCredentials(true);
        })
        .catch(() => {
          setValidCredentials(false);
        })
        .finally(() => {
          setValidating(false);
        });
      timer = setTimeout(() => setValidating(false), 1000);
    } else {
      setValidCredentials(false);
    }
    return () => clearTimeout(timer);
  }, [identifier, password, identifierValid, isPasswordValid]);

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
      const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
      // Always set token key in tokenData, prefer access_token from backend
      let token =
        data && typeof data.access_token !== "undefined"
          ? data.access_token
          : undefined;
      if (!token && typeof data.token !== "undefined") {
        token = data.token;
      }
      if (!token) {
        // Read pt_token from cookies
        const match = document.cookie.match(/(?:^|; )pt_token=([^;]*)/);
        if (match) {
          token = decodeURIComponent(match[1]);
        }
      }
      localStorage.setItem(
        "tokenData",
        JSON.stringify({ token: token || "", expiry, user: data.user })
      );
      setSuccess("Login successful!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.msg || "Login failed");
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
        sx={{
          p: { xs: 2, sm: 4 },
          width: { xs: "98%", sm: "80%", md: 400 },
          maxWidth: 400,
          borderRadius: 3,
          mx: "auto",
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" sx={{ mb: 4 }} fontWeight="bold">
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
          }}
        >
          <TextField
            label="Username or Email"
            fullWidth
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <img src={LockIcon} alt="lock" width={24} height={24} />
                </InputAdornment>
              ),
            }}
          />
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
            sx={{
              fontWeight: "bold",
              fontFamily: "Roboto, Arial, sans-serif",
            }}
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
    </Box>
  );
}
