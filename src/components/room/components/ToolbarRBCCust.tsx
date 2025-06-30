import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import React from "react";
import { NavigateAction, View } from "react-big-calendar";

interface ToolbarProps {
  date: Date;
  view: View;
  views: any; // This matches what react-big-calendar passes
  onView: (view: View) => void;
  onNavigate: (action: NavigateAction, date?: Date) => void;
  setView: (view: View) => void;
  isMobile?: boolean;
  isTablet?: boolean;
  label: string;
  localizer: any;
}

const ToolbarRBCCust: React.FC<ToolbarProps> = ({
  date,
  view,
  views,
  onView,
  onNavigate,
  setView,
  isMobile = false,
  isTablet = false,
}) => {
  const getDateRangeLabel = () => {
    switch (view) {
      case "month":
        return format(date, "MMMM yyyy", { locale: id });
      case "week":
        // Calculate week start and end
        const startOfWeek = new Date(date);
        const dayOfWeek = startOfWeek.getDay();
        const diff =
          startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfWeek.setDate(diff);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${format(
            startOfWeek,
            "MMMM yyyy",
            { locale: id }
          )}`;
        } else {
          return `${format(startOfWeek, "d MMM", { locale: id })} - ${format(
            endOfWeek,
            "d MMM yyyy",
            { locale: id }
          )}`;
        }
      default:
        return format(date, "MMMM yyyy", { locale: id });
    }
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
    onView(newView);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column", // Stack vertically on mobile
          sm: "row", // Side by side on tablet+
        },
        justifyContent: "space-between",
        alignItems: {
          xs: "stretch", // Full width on mobile
          sm: "center", // Center on tablet+
        },
        gap: {
          xs: 2, // More gap on mobile
          sm: 1,
        },
        mb: 3,
        p: {
          xs: 1,
          sm: 0,
        },
      }}
    >
      {/* Navigation Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          order: {
            xs: 2, // Show after date/view selector on mobile
            sm: 1, // Show first on tablet+
          },
          justifyContent: {
            xs: "center", // Center on mobile
            sm: "flex-start",
          },
        }}
      >
        <Button
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          onClick={() => onNavigate("TODAY")}
          sx={{
            minWidth: {
              xs: "60px",
              sm: "auto",
            },
            fontSize: {
              xs: "0.7rem",
              sm: "0.875rem",
            },
          }}
        >
          Hari ini
        </Button>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={() => onNavigate("PREV")}
            sx={{
              minWidth: {
                xs: "40px",
                sm: "auto",
              },
              px: {
                xs: 1,
                sm: 2,
              },
            }}
          >
            <ArrowBack fontSize={isMobile ? "small" : "medium"} />
          </Button>
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={() => onNavigate("NEXT")}
            sx={{
              minWidth: {
                xs: "40px",
                sm: "auto",
              },
              px: {
                xs: 1,
                sm: 2,
              },
            }}
          >
            <ArrowForward fontSize={isMobile ? "small" : "medium"} />
          </Button>
        </Box>
      </Box>

      {/* Date Range Display */}
      <Box
        sx={{
          order: {
            xs: 1, // Show first on mobile
            sm: 2, // Show in middle on tablet+
          },
          textAlign: "center",
          flex: {
            xs: "none",
            sm: 1,
          },
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          component="h2"
          sx={{
            fontWeight: 600,
            color: "primary.main",
            fontSize: {
              xs: "1rem",
              sm: "1.25rem",
              md: "1.5rem",
            },
          }}
        >
          {getDateRangeLabel()}
        </Typography>
      </Box>

      {/* View Selector */}
      <Box
        sx={{
          order: {
            xs: 3, // Show last on mobile
            sm: 3, // Show last on tablet+
          },
          display: "flex",
          justifyContent: {
            xs: "center",
            sm: "flex-end",
          },
        }}
      >
        <ButtonGroup
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          sx={{
            "& .MuiButton-root": {
              fontSize: {
                xs: "0.7rem",
                sm: "0.875rem",
              },
              px: {
                xs: 1,
                sm: 2,
              },
              minWidth: {
                xs: "50px",
                sm: "auto",
              },
            },
          }}
        >
          <Button
            variant={view === "month" ? "contained" : "outlined"}
            onClick={() => handleViewChange("month")}
          >
            {isMobile ? "Bln" : "Bulan"}
          </Button>
          <Button
            variant={view === "week" ? "contained" : "outlined"}
            onClick={() => handleViewChange("week")}
          >
            {isMobile ? "Mgu" : "Minggu"}
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default ToolbarRBCCust;
