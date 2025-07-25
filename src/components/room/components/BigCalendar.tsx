import { Box, useMediaQuery, useTheme } from "@mui/material";
import { format, getDay, parse, startOfWeek } from "date-fns";
import id from "date-fns/locale/id";
import { CSSProperties, useCallback, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import BookingDetailModal from "./BookingDetailModal";
import ToolbarCust from "./ToolbarRBCCust";

const locales = {
  id: id,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function BigCalendar({
  events,
  refreshBookings,
}: {
  events?: any;
  refreshBookings?: () => void;
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { views, defaultDate, formats } = useMemo(
    () => ({
      views: {
        month: true,
        week: true,
      },
      defaultDate: new Date(),
      formats: {
        weekdayFormat: (date: any, culture: any, localizer: any) =>
          localizer.format(date, "E", culture),
        timeGutterFormat: "HH:mm",
        eventTimeRangeFormat: (
          { start, end }: any,
          culture: any,
          localizer: any
        ) =>
          `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
            end,
            "HH:mm",
            culture
          )}`,
        dayHeaderFormat: (date: any, culture: any, localizer: any) =>
          localizer.format(date, "EEEE, MMMM dd", culture),
        dayRangeHeaderFormat: (
          { start, end }: any,
          culture: any,
          localizer: any
        ) =>
          `${localizer.format(start, "MMMM dd", culture)} - ${localizer.format(
            end,
            "MMMM dd",
            culture
          )}`,
      },
    }),
    []
  );

  const onNavigate = useCallback((newDate: Date) => {
    console.log("Navigating to:", newDate);
    setDate(newDate);
  }, []);

  const onView = useCallback((newView: any) => {
    console.log("Switching to view:", newView);
    setView(newView);
  }, []);

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const eventStyleGetter = (event: any): { style: CSSProperties } => {
    let backgroundColor = "#3174ad";
    let borderColor = "#3174ad";

    // Color code events based on approval status
    if (event.resource?.approval === "approved") {
      backgroundColor = "#4caf50"; // Green for approved
      borderColor = "#4caf50";
    } else if (event.resource?.approval === "pending") {
      backgroundColor = "#ff9800"; // Orange for pending
      borderColor = "#ff9800";
    } else if (event.resource?.approval === "rejected") {
      backgroundColor = "#f44336"; // Red for rejected
      borderColor = "#f44336";
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        border: `1px solid ${borderColor}`,
        color: "white",
        fontWeight: "500",
        borderRadius: "0",
        opacity: 0.95,
        fontSize: "12px",
        padding: "2px 4px",
        margin: "0",
        width: "100%",
        minHeight: "20px",
        boxSizing: "border-box" as const,
        left: "0",
        right: "0",
        transform: "none",
      },
    };
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        my: 24,
        height: {
          xs: "400px", // Mobile: smaller height
          sm: "500px", // Tablet: medium height
          md: "600px", // Desktop: full height
        },
        "& .rbc-calendar": {
          fontFamily: "inherit",
          fontSize: {
            xs: "0.75rem", // Mobile: smaller font
            sm: "0.875rem", // Tablet: medium font
            md: "1rem", // Desktop: normal font
          },
        },
        // Mobile-specific calendar adjustments
        "& .rbc-header": {
          fontSize: {
            xs: "0.7rem",
            sm: "0.8rem",
            md: "0.9rem",
          },
          padding: {
            xs: "4px 2px",
            sm: "8px 4px",
            md: "12px 8px",
          },
        },
        // Mobile month view improvements
        "& .rbc-month-view": {
          "& .rbc-date-cell": {
            fontSize: {
              xs: "0.65rem",
              sm: "0.75rem",
              md: "0.875rem",
            },
            padding: {
              xs: "2px",
              sm: "4px",
              md: "8px",
            },
          },
          "& .rbc-row-content": {
            minHeight: {
              xs: "60px",
              sm: "80px",
              md: "100px",
            },
          },
        },
        // Responsive week/day view improvements
        "& .rbc-time-view": {
          "& .rbc-time-slot": {
            borderTop: "none !important",
            borderBottom: "none !important",
            "&:not(:last-child)": {
              borderBottom: "1px solid rgba(0,0,0,0.05) !important",
            },
          },
          "& .rbc-timeslot-group": {
            borderBottom: "1px solid rgba(0,0,0,0.15) !important",
            minHeight: {
              xs: "40px !important", // Mobile: smaller slots
              sm: "50px !important", // Tablet: medium slots
              md: "60px !important", // Desktop: full slots
            },
          },
          "& .rbc-time-header-gutter": {
            borderRight: "1px solid rgba(0,0,0,0.2) !important",
            minWidth: {
              xs: "50px", // Mobile: narrower time gutter
              sm: "60px",
              md: "70px",
            },
          },
          "& .rbc-time-header-content": {
            borderLeft: "1px solid rgba(0,0,0,0.1) !important",
          },
          "& .rbc-time-gutter": {
            "& .rbc-time-slot": {
              border: "none !important",
              fontSize: {
                xs: "0.6rem",
                sm: "0.7rem",
                md: "0.8rem",
              },
            },
            "& .rbc-timeslot-group": {
              borderBottom: "none !important",
              "& .rbc-time-slot": {
                borderTop: "none !important",
                borderBottom: "none !important",
              },
            },
          },
        },
        // Responsive event styling (base styles)
        "& .rbc-event": {
          borderRadius: "0 !important",
          border: "none !important",
          fontSize: {
            xs: "0.6rem", // Mobile: very small text
            sm: "0.7rem", // Tablet: small text
            md: "0.75rem", // Desktop: normal text
          },
          padding: {
            xs: "1px 2px",
            sm: "2px 4px",
            md: "2px 4px",
          },
          margin: "0",
          minHeight: {
            xs: "16px",
            sm: "18px",
            md: "20px",
          },
          boxSizing: "border-box" as const,
          // Hover effects (disabled on mobile for better touch experience)
          "&:hover": {
            opacity: isMobile ? 1 : 0.9,
            transform: isMobile ? "none" : "scale(1.02)",
            boxShadow: isMobile ? "none" : "0 2px 8px rgba(0,0,0,0.15)",
            cursor: "pointer",
            transition: isMobile ? "none" : "all 0.2s ease-in-out",
          },
        },
        // Month view events should take full width
        "& .rbc-month-view .rbc-event": {
          width: "100% !important",
          left: "0 !important",
          right: "0 !important",
          transform: "none !important",
        },
        // Today highlighting - different behavior per view
        // Month view: keep the gray background for today's date
        "& .rbc-month-view .rbc-today": {
          backgroundColor: "rgba(0,0,0,0.05) !important",
        },
        // Week view: keep subtle highlighting for today's column
        "& .rbc-week-view .rbc-today": {
          backgroundColor: "rgba(0,0,0,0.03) !important",
        },
        // Mobile-specific adjustments for containers
        "& .rbc-day-slot, & .rbc-time-column": {
          padding: "0 !important",
          margin: "0 !important",
        },
        // Hide current time indicator on mobile to reduce clutter
        "& .rbc-current-time-indicator": {
          display: {
            xs: "none", // Hidden on mobile
            sm: "block", // Visible on tablet and up
          },
        },
        // Mobile toolbar adjustments
        "& .rbc-toolbar": {
          flexDirection: {
            xs: "column", // Stack on mobile
            sm: "row", // Side by side on tablet+
          },
          gap: {
            xs: 1,
            sm: 2,
          },
          marginBottom: {
            xs: 2,
            sm: 3,
          },
        },
        // Event content styling
        "& .rbc-event-content": {
          overflow: "hidden !important",
          textOverflow: "ellipsis !important",
          whiteSpace: "nowrap !important",
          padding: "0 !important",
          margin: "0 !important",
        },
        // Week view: events should take full column width
        "& .rbc-week-view .rbc-time-view .rbc-event": {
          width: "100% !important",
          left: "0 !important",
          right: "0 !important",
          margin: "0 !important",
          position: "absolute !important",
          borderRadius: "0 !important",
          transform: "none !important",
        },
        // Week view day slots
        "& .rbc-week-view .rbc-day-slot .rbc-event": {
          width: "100% !important",
          left: "0 !important",
          right: "0 !important",
          margin: "0 !important",
          borderRadius: "0 !important",
        },

        // Month view and all-day events
        "& .rbc-event-allday": {
          width: "100% !important",
          left: "0 !important",
          right: "0 !important",
          borderRadius: "0 !important",
        },
        // Remove excessive borders in day view and fix containers
        "& .rbc-day-slot": {
          padding: "0 !important",
          margin: "0 !important",
          "& .rbc-time-slot": {
            borderTop: "none !important",
            borderBottom: "none !important",
          },
        },
        // Week view improvements
        "& .rbc-time-view .rbc-time-content": {
          borderTop: "none !important",
        },
        // Remove borders from the main content area
        "& .rbc-time-content > *": {
          borderTop: "none !important",
        },
        // Remove borders from day columns
        "& .rbc-day-slot .rbc-time-slot": {
          borderTop: "none !important",
          borderRight: "none !important",
        },
        // Header improvements
        "& .rbc-time-header": {
          "& .rbc-time-header-cell": {
            borderLeft: "1px solid rgba(0,0,0,0.1) !important",
            minHeight: "50px !important",
          },
        },
        // Gutter time labels
        "& .rbc-time-gutter .rbc-timeslot-group": {
          "& .rbc-time-slot": {
            border: "none !important",
          },
        },
        // Remove all unwanted borders and lines
        "& .rbc-time-slot": {
          borderTop: "none !important",
          borderLeft: "none !important",
          borderRight: "none !important",
        },
        // Clean up week view specifically
        "& .rbc-time-view .rbc-time-header": {
          borderBottom: "1px solid rgba(0,0,0,0.1) !important",
        },
        // Fix time slot containers
        "& .rbc-time-column": {
          padding: "0 !important",
          margin: "0 !important",
        },
        // Fix the day column containers in week view
        "& .rbc-time-view .rbc-time-content .rbc-day-slot": {
          padding: "0 !important",
          margin: "0 !important",
          width: "100% !important",
        },
        // Remove padding from time content area
        "& .rbc-time-content": {
          padding: "0 !important",
        },
        // Fix day column width calculation
        "& .rbc-time-header-content": {
          paddingLeft: "0 !important",
          paddingRight: "0 !important",
        },
        // Ensure column headers don't add extra spacing
        "& .rbc-time-header-cell": {
          paddingLeft: "0 !important",
          paddingRight: "0 !important",
        },
        // Fix the main day column containers
        "& .rbc-day-bg": {
          padding: "0 !important",
          margin: "0 !important",
        },
        // Force events to use exact column width calculation
        "& .rbc-events-container": {
          width: "100% !important",
          left: "0 !important",
          right: "0 !important",
        },
        // Override any width calculation for events
        "& .rbc-event-continues-after": {
          paddingRight: "0 !important",
        },
        "& .rbc-event-continues-before": {
          paddingLeft: "0 !important",
        },
      }}
    >
      <Calendar
        startAccessor="start"
        endAccessor="end"
        localizer={localizer}
        style={{ height: 600 }}
        components={{
          toolbar: (props) => (
            <ToolbarCust
              {...props}
              view={view}
              setView={setView as (view: View) => void}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          ),
        }}
        views={views}
        view={view}
        defaultDate={defaultDate}
        onView={onView}
        onNavigate={onNavigate}
        date={date}
        formats={formats}
        events={events}
        eventPropGetter={eventStyleGetter}
        popup={true}
        showMultiDayTimes={true}
        step={30}
        timeslots={2}
        min={new Date(2023, 0, 1, 6, 0, 0)}
        max={new Date(2023, 0, 1, 22, 0, 0)}
        onSelectEvent={handleSelectEvent}
      />

      <BookingDetailModal
        open={modalOpen}
        event={selectedEvent}
        onClose={handleCloseModal}
        isMobile={isMobile}
        isTablet={isTablet}
        refreshBookings={refreshBookings}
      />
    </Box>
  );
}
