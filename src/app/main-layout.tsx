"use client";
import SWRegProvider from "@/lib/provider/SWRegProvider";
import { CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Toaster } from "react-hot-toast";
import theme from "./theme";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <SWRegProvider>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Toaster />
                  {children}
                </LocalizationProvider>
              </AppRouterCacheProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </SWRegProvider>
      </body>
    </html>
  );
}
