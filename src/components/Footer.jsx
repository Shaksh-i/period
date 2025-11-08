import React from "react";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "#6a1b9a",
        color: "#fff",
        textAlign: "center",
        py: 2,
        mt: "auto",
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} HerSync. All rights reserved.
      </Typography>
    </Box>
  );
}
