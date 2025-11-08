import React from "react";
import { Typography } from "@mui/material";
import Paper from "@mui/material/Paper";

const ErrorElement = () => {
  return (
    <Paper sx={{ p: 4, mt: 4 }}>
      <Typography variant="h5">Please use a correct endpoint.</Typography>
    </Paper>
  );
};

export default ErrorElement;
