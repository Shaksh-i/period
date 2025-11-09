import React, { useState } from "react";
import { submitFeedback } from "../services/api";
import { Box, Button, TextField, Typography } from "@mui/material";

function FeedbackForm() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitFeedback(feedback);
      setSubmitted(true);
      setFeedback("");
    } catch (err) {
      alert("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        We value your feedback!
      </Typography>
      <TextField
        label="Your Feedback"
        multiline
        rows={3}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!feedback}
      >
        Submit
      </Button>
      {submitted && (
        <Typography color="success.main" sx={{ mt: 1 }}>
          Thank you for your feedback!
        </Typography>
      )}
    </Box>
  );
}

export default FeedbackForm;
