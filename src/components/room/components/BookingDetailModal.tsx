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
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import React from "react";

interface BookingDetailModalProps {
  event: any;
  open: boolean;
  onClose: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  event,
  open,
  onClose,
  isMobile = false,
  isTablet = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (!event) return null;
  console.log(event, "event");

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
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          borderBottom: 1,
          borderColor: "divider",
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
          }}
        >
          Detail Booking
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
          pt: 3,
          px: {
            xs: 2,
            sm: 3,
          },
          maxHeight: fullScreen ? "calc(100vh - 120px)" : "auto",
          overflow: "auto",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
                  }}
                >
                  Meeting Title:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    backgroundColor: "grey.100",
                    p: {
                      xs: 1,
                      sm: 1.5,
                    },
                    borderRadius: 1,
                    fontSize: {
                      xs: "0.875rem",
                      sm: "1rem",
                    },
                    wordBreak: "break-word",
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
                  }}
                >
                  Tanggal:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
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
                  }}
                >
                  Waktu:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
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
                  }}
                >
                  Penyelenggara:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
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
                  }}
                >
                  Jumlah Peserta:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
                  }}
                >
                  {event.resource.participants} orang
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
                  }}
                >
                  Ruangan:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
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
                  }}
                >
                  Kategori:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: {
                      xs: "0.8rem",
                      sm: "0.875rem",
                    },
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
                    }}
                  >
                    Catatan:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: "grey.50",
                      p: {
                        xs: 1,
                        sm: 1.5,
                      },
                      borderRadius: 1,
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.875rem",
                      },
                      wordBreak: "break-word",
                      fontStyle:
                        event.resource.remark === "No remarks"
                          ? "italic"
                          : "normal",
                      color:
                        event.resource.remark === "No remarks"
                          ? "text.secondary"
                          : "text.primary",
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
          borderColor: "divider",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          fullWidth={isMobile}
          size={isMobile ? "medium" : "large"}
          sx={{
            minWidth: isMobile ? "auto" : 100,
            fontSize: {
              xs: "0.875rem",
              sm: "1rem",
            },
          }}
        >
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDetailModal;
