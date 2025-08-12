"use client";

import AppBar from "@/components/home/components/AppBar";
import { Box, Container, useMediaQuery, useTheme } from "@mui/material";
import NavButton from "./NavButton";

interface WrapperChild {
  children: React.ReactNode;
}

const WrapperAdmin = ({ children }: WrapperChild) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <AppBar admin />
      <Container
        maxWidth="md"
        sx={{
          my: 8,
          px: {
            xs: 10, // Reduced padding on mobile
            sm: 16,
          },
          flex: 1,
          // Add bottom padding on mobile to account for floating nav button
          pb: mobile ? 10 : 8, // Extra bottom padding on mobile
          position: "relative",
          overflow: "visible",
        }}
      >
        {children}
      </Container>
      {mobile && <NavButton admin />}
    </Box>
  );
};

export default WrapperAdmin;
