"use client";

import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import React, { useState } from "react";

interface BookingDetailModalProps {
  event: any;
  open: boolean;
  onClose: () => void;
  onBookingCancelled?: () => void; // Callback to refresh data after cancellation
  refreshBookings?: () => void; // Alternative refresh callback
  isMobile?: boolean;
  isTablet?: boolean;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  event,
  open,
  onClose,
  onBookingCancelled,
  refreshBookings,
  isMobile = false,
  isTablet = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const axiosAuth = useAxiosAuth();
  const user = useAuthStore((state) => state.user);

  // Cancel booking states
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  if (!event) return null;
  console.log(event, "event");

  const isAdmin =
    user?.role_id === "43dba1a3-e595-4f0b-aaa8-9f33b28caf51" ||
    user?.role_id === "43dba1a3-e595-4f0b-aaa8-9f33b28caf51";

  // Check if booking can be cancelled (only active bookings)
  const canCancel = event.resource?.approval === "approved" || event.resource?.approval === "pending";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return { backgroundColor: "#4caf50", color: "white" };
      case "pending":
        return { backgroundColor: "#ff9800", color: "white" };
      case "rejected":
        return { backgroundColor: "#f44336", color: "white" };
      default:
        return { backgroundColor: "#757575", color: "white" };
    }
  };

  // Clean agenda title (remove status icons)
  const getCleanAgenda = (title: string) => {
    return title.replace(/^[✓⏳✗]\s/, "");
  };

  const formatDateTime = (date: Date) => {
    return format(date, "EEEE, d MMMM yyyy", { locale: id });
  };

  const handleCancelBooking = async () => {
    if (!event.resource?.id) return;

    setCancelling(true);
    try {
      await axiosAuth.patch(`/book/cancel/${event.resource.id}`, {
        cancel_reason: cancelReason || "Cancelled by admin",
      });

      setCancelDialogOpen(false);
      setCancelReason("");
      onClose();

      // Call refresh callback to reload data
      if (refreshBookings) {
        refreshBookings();
      } else if (onBookingCancelled) {
        onBookingCancelled();
      }

      // You might want to show a success message here
      console.log("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      // You might want to show an error message here
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setCancelReason("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={isMobile ? false : "sm"}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          maxHeight: fullScreen ? "100%" : "90vh",
          margin: fullScreen ? 0 : 2,
          width: fullScreen ? "100%" : "auto",
          bgcolor: "rgba(18, 18, 18, 0.95)",
          color: "text.primary",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          borderBottom: 1,
          borderColor: "rgba(255, 255, 255, 0.1)",
          bgcolor: "rgba(255, 255, 255, 0.05)",
          fontSize: {
            xs: "1.1rem",
            sm: "1.25rem",
          },
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          component="div"
          sx={{
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: isMobile ? "nowrap" : "normal",
            pr: 1,
            color: "white",
          }}
        >
          Booking Details
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size={isMobile ? "small" : "medium"}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          maxHeight: fullScreen ? "calc(100vh - 120px)" : "auto",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            py: 5,
            px: {
              xs: 2,
              sm: 3,
            },
          }}
        >
          {/* Event Details Grid */}
          <Grid container spacing={isMobile ? 2 : 3}>
            {/* Meeting Title */}
            <Grid item xs={12}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    mt: 2,
                    fontSize: {
                      xs: "0.875rem",
                      sm: "1rem",
                    },
                    color: "white",
                  }}
                >
                  Meeting Title:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    p: {
                      xs: 1.5,
                      sm: 2,
                    },
                    borderRadius: 2,
                    fontSize: {
                      xs: "0.875rem",
                      sm: "1rem",
                    },
                    wordBreak: "break-word",
                    color: "primary.light",
                    fontWeight: 500,
                  }}
                >
                  {getCleanAgenda(event.title)}
                </Typography>
              </Box>
            </Grid>

            {/* Date and Time - Full width on mobile, split on tablet+ */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: {
                      xs: "0.875rem",
                      sm: "1rem",
                    },
                    color: "white",
                  }}
                >
                  Date:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {formatDateTime(event.start)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: {
                      xs: "0.875rem",
                      sm: "1rem",
                    },
                    color: "white",
                  }}
                >
                  Time:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {event.resource.timeStart} - {event.resource.timeEnd}
                </Typography>
              </Box>
            </Grid>

            {/* Organizer and Participants - Stack on mobile */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: {
                      xs: "0.875rem",
                      sm: "1rem",
                    },
                    color: "white",
                  }}
                >
                  Organizer:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {event.resource.user}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: {
                      xs: "0.875rem",
                      sm: "1rem",
                    },
                    color: "white",
                  }}
                >
                  Participants:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {event.resource.participants} people
                </Typography>
              </Box>
            </Grid>

            {/* Room and Category - Stack on mobile */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: {
                      xs: "0.875rem",
                      sm: "1rem",
                    },
                    color: "white",
                  }}
                >
                  Room ID:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {event.resource.roomId}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    fontSize: {
                      xs: "0.875rem",
                      sm: "1rem",
                    },
                    color: "white",
                  }}
                >
                  Category:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {event.resource.category}
                </Typography>
              </Box>
            </Grid>

            {/* Remarks - Full width */}
            {event.resource.remark && (
              <Grid item xs={12}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      fontSize: {
                        xs: "0.875rem",
                        sm: "1rem",
                      },
                      color: "white",
                    }}
                  >
                    Remarks:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      p: {
                        xs: 1.5,
                        sm: 2,
                      },
                      borderRadius: 2,
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.875rem",
                      },
                      wordBreak: "break-word",
                      fontStyle: event.resource.remark === "No remarks" ? "italic" : "normal",
                      color:
                        event.resource.remark === "No remarks"
                          ? "rgba(255, 255, 255, 0.5)"
                          : "rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    {event.resource.remark}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: {
            xs: 2,
            sm: 3,
          },
          py: {
            xs: 1.5,
            sm: 2,
          },
          borderTop: 1,
          borderColor: "rgba(255, 255, 255, 0.1)",
          bgcolor: "rgba(255, 255, 255, 0.03)",
          gap: 1,
        }}
      >
        {/* Show cancel button only for admins and cancellable bookings */}
        {isAdmin && canCancel && (
          <Button
            onClick={() => setCancelDialogOpen(true)}
            variant="outlined"
            color="error"
            size={isMobile ? "medium" : "large"}
            sx={{
              minWidth: isMobile ? "auto" : 120,
              fontSize: {
                xs: "0.875rem",
                sm: "1rem",
              },
            }}
          >
            Cancel Booking
          </Button>
        )}

        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          fullWidth={isMobile && !isAdmin}
          size={isMobile ? "medium" : "large"}
          sx={{
            minWidth: isMobile ? "auto" : 100,
            fontSize: {
              xs: "0.875rem",
              sm: "1rem",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: "rgba(18, 18, 18, 0.95)",
            color: "text.primary",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "white",
            bgcolor: "rgba(255, 255, 255, 0.05)",
            borderBottom: 1,
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          Cancel Booking
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: "transparent",
            color: "white",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: "white",
              fontWeight: 500,
            }}
          >
            Are you sure you want to cancel this booking?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation Reason (Optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter cancellation reason..."
            sx={{
              mt: 5,
              "& .MuiInputBase-root": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "white",
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.2)",
              },
              "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255, 255, 255, 0.5)",
                opacity: 0.7,
              },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            gap: 1,
            borderTop: 1,
            borderColor: "rgba(255, 255, 255, 0.1)",
            bgcolor: "rgba(255, 255, 255, 0.03)",
          }}
        >
          <Button
            onClick={handleCancelDialogClose}
            variant="outlined"
            fullWidth={isMobile}
            disabled={cancelling}
            sx={{
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.5)",
                bgcolor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleCancelBooking}
            variant="contained"
            color="error"
            fullWidth={isMobile}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default BookingDetailModal;
