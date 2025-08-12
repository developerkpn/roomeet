import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import useFetch from "@/lib/hooks/useFetch";
import { ContentCopy, Download, QrCode2 } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import BigCalendar from "./BigCalendar";
import { useAuthStore } from "@/lib/store/useAuthStore";

const Room = () => {
  const { idroom } = useParams();
  const user = useAuthStore((state) => state.user);
  const [rooms, setRooms] = useState<any>();
  const [room, setRoom] = useState<any>(idroom ? idroom[0] : "");
  const [events, setEvents] = useState<any>();
  const axiosAuth = useAxiosAuth();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [roomType, setRoomType] = useState<string>("all");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrCodeExists, setQrCodeExists] = useState<boolean>(false);
  const [qrCodeLoading, setQrCodeLoading] = useState<boolean>(false);
  const [copySnackbar, setCopySnackbar] = useState<boolean>(false);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  let url = "";
  if (room) {
    url = `/book?room=${room}&approval=calendar`;
  }

  const {
    data: books,
    error,
    isLoading,
  } = useSWR(url, {
    fallback: { url: [] },
  });

  const { data: roomDetails, loading } = useFetch<any>(room ? `/room/fas?id_room=${room}` : "");

  // Function to refresh booking data
  const refreshBookings = () => {
    if (url) {
      mutate(url);
    }
  };

  useEffect(() => {
    const getRooms = async () => {
      let url = "/room";
      if (roomType !== "all") {
        url += `?is_virtual=${roomType === "virtual" ? "true" : "false"}`;
      }
      const get = await axiosAuth.get(url);
      setRooms(get.data);
    };
    getRooms();

    if (books) {
      setEvents(
        books.data.map((item: any) => {
          const startHour = Number(item.time_start.split(":")[0]);
          const startMinute = Number(item.time_start.split(":")[1]);
          const endHour = Number(item.time_end.split(":")[0]);
          const endMinute = Number(item.time_end.split(":")[1]);

          // Create separate date objects to avoid mutation
          const bookDate = new Date(item.book_date);
          const startDate = new Date(bookDate);
          const endDate = new Date(bookDate);

          // Set hours and minutes on separate objects
          startDate.setHours(startHour, startMinute, 0, 0);
          endDate.setHours(endHour, endMinute, 0, 0);

          // Create user-friendly title and add approval status as resource
          const timeRange = `${item.time_start}-${item.time_end}`;
          const approvalIcon =
            item.approval === "approved"
              ? "✓"
              : item.approval === "pending"
              ? "⏳"
              : item.approval === "rejected"
              ? "✗"
              : "";

          return {
            title: `${approvalIcon} ${item.agenda}`,
            start: startDate,
            end: endDate,
            allDay: false,
            resource: {
              approval: item.approval,
              timeRange: timeRange,
              user: item.username || "Unknown User",
              participants: item.prtcpt_ctr || item.participant || 0,
              id: item.id_book,
              agenda: item.agenda,
              remark: item.remark || "No remarks",
              bookDate: item.book_date,
              timeStart: item.time_start,
              timeEnd: item.time_end,
              roomId: item.id_ruangan,
              userId: item.id_user,
              category: item.category || "General",
            },
          };
        })
      );
    }
  }, [books, axiosAuth, roomType]);

  const handleRoom = (e: any) => {
    const r = e.target.value;
    setRoom(r);
    console.log(r);
  };

  const handleDelete = async () => {
    await axiosAuth.delete(`/room/${room}`);
    setDeleteDialog(false);
    setRoom("");
    const get = await axiosAuth.get("/room");
    setRooms(get.data);
  };

  const checkQRCodeExists = async (id_ruangan: string) => {
    try {
      const response = await axiosAuth.get(`/room/${id_ruangan}/qrcode/check`);
      return response.data;
    } catch (error) {
      console.error("Error checking QR code:", error);
      return { exists: false, qr_code_url: null };
    }
  };

  const generateQRCode = async (id_ruangan: string) => {
    setQrCodeLoading(true);
    try {
      const response = await axiosAuth.post(
        `/room/${id_ruangan}/qrcode/generate`,
        {},
        {
          responseType: "blob",
        }
      );

      // Create blob URL for immediate display
      const imageBlob = new Blob([response.data], { type: "image/png" });
      const imageUrl = URL.createObjectURL(imageBlob);

      setQrCodeUrl(imageUrl);
      setQrCodeExists(true);

      return imageUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw error;
    } finally {
      setQrCodeLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySnackbar(true);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const downloadQRCodeWithTemplate = async (id_ruangan: string, roomName: string) => {
    setDownloadLoading(true);
    try {
      // Get QR code as blob
      const response = await axiosAuth.post(
        `/room/${id_ruangan}/qrcode/generate`,
        {},
        {
          responseType: "blob",
        }
      );

      // Create canvas for template with higher resolution
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      // Set canvas dimensions - increased for higher resolution
      canvas.width = 800;
      canvas.height = 900;

      // Fill white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add room name with higher resolution fonts
      ctx.fillStyle = "#000000";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.fillText(roomName, canvas.width / 2, 80);

      // Add room ID
      ctx.fillStyle = "#000000";
      ctx.font = "32px Arial";
      ctx.fillText(`Room ID: ${id_ruangan}`, canvas.width / 2, 140);

      // Load and draw QR code
      const qrImage = document.createElement("img");
      const imageBlob = new Blob([response.data], { type: "image/png" });
      const imageUrl = URL.createObjectURL(imageBlob);

      qrImage.onload = () => {
        // Draw QR code centered with higher resolution
        const qrSize = 560; // Doubled for higher resolution
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = 200; // Adjusted for new layout
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

        // No footer text - removed as requested

        // Download the canvas as image
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${id_ruangan}_QR_Template.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, "image/png");

        URL.revokeObjectURL(imageUrl);
      };

      qrImage.src = imageUrl;
    } catch (error) {
      console.error("Error downloading QR code template:", error);
    } finally {
      setDownloadLoading(false);
    }
  };

  // Check QR code when room changes
  useEffect(() => {
    const checkQRCode = async () => {
      if (room && roomDetails?.data[0]?.is_virtual !== "T") {
        const result = await checkQRCodeExists(room);
        setQrCodeExists(result.exists);
        setQrCodeUrl(result.qr_code_url);
      } else {
        setQrCodeExists(false);
        setQrCodeUrl(null);
      }
    };
    checkQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, roomDetails]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          width: "100%",
          gap: 2,
          mt: 24,
          px: {
            xs: 1,
            sm: 0,
          },
        }}
      >
        <FormControl fullWidth size={isMobile ? "small" : "medium"}>
          <InputLabel>Room Type</InputLabel>
          <Select
            value={roomType}
            label="Room Type"
            onChange={(e) => {
              setRoomType(e.target.value);
              setRoom(""); // Reset selected room when changing type
            }}
          >
            <MenuItem value="all">All Rooms</MenuItem>
            <MenuItem value="physical">Physical Rooms</MenuItem>
            <MenuItem value="virtual">Virtual Rooms</MenuItem>
          </Select>
        </FormControl>
        {rooms ? (
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>Select Room</InputLabel>
            <Select defaultValue="" value={room} label="Select Room" onChange={handleRoom}>
              {rooms.map((room: any) => (
                <MenuItem key={room.id} value={room.id_ruangan}>
                  {room.nama}
                  {room.is_virtual === "T" && " (Virtual)"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Skeleton variant="rounded" width="100%" height={isMobile ? 48 : 64} sx={{ bgcolor: "grey.700" }} />
        )}
      </Box>
      {(isLoading || (room && loading)) && !events ? (
        <Skeleton
          variant="rounded"
          width="100%"
          height={isMobile ? 96 : 128}
          sx={{
            bgcolor: "grey.700",
            mt: 48,
            mx: {
              xs: 1,
              sm: 0,
            },
          }}
        />
      ) : room && roomDetails ? (
        <>
          <Grid
            container
            spacing={isMobile ? 2 : 16}
            sx={{
              mt: 16,
              px: {
                xs: 1,
                sm: 0,
              },
            }}
          >
            {roomDetails.data[0]?.image && (
              <Grid item xs={12} md={8}>
                <Image
                  src={roomDetails.data[0]?.image ?? ""}
                  alt="Room Image"
                  style={{
                    width: "100%",
                    height: isMobile ? "200px" : "250px",
                    objectFit: "cover",
                    borderRadius: "0.75rem",
                  }}
                  width={1000}
                  height={800}
                />
              </Grid>
            )}
            {/* QR Code Container - only for physical rooms */}
            {roomDetails.data[0].is_virtual !== "T" && user?.role_name == "admin" && (
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, color: "primary.main" }}>
                    QR Code for Check-in
                  </Typography>
                  <Box
                    sx={{
                      height: isMobile ? "200px" : "250px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: qrCodeExists ? "none" : "2px dashed",
                      borderColor: "grey.300",
                      borderRadius: "0.75rem",
                      position: "relative",
                    }}
                  >
                    {qrCodeExists && qrCodeUrl ? (
                      <Image
                        src={qrCodeUrl}
                        alt={`QR Code for ${room}`}
                        style={{
                          width: "100%",
                          height: isMobile ? "200px" : "250px",
                          objectFit: "contain",
                          borderRadius: "0.75rem",
                        }}
                        width={256}
                        height={256}
                      />
                    ) : (
                      <Box sx={{ textAlign: "center" }}>
                        {qrCodeLoading ? (
                          <Box>
                            <CircularProgress />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Generating QR Code...
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <QrCode2 sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              No QR Code generated
                            </Typography>

                            <Button
                              variant="outlined"
                              startIcon={<QrCode2 />}
                              onClick={() => generateQRCode(room)}
                              size={isMobile ? "small" : "medium"}
                            >
                              Generate QR Code
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <Typography
                variant={isMobile ? "h2" : "h1"}
                sx={{
                  color: "primary.main",
                  fontSize: {
                    xs: "1.5rem",
                    sm: "1.75rem",
                    md: "2rem",
                  },
                  mb: {
                    xs: 1,
                    md: 0,
                  },
                }}
              >
                {roomDetails.data[0].nama}
              </Typography>
              <Typography
                sx={{
                  fontSize: {
                    xs: "0.875rem",
                    sm: "1rem",
                  },
                  mb: {
                    xs: 2,
                    md: 0,
                  },
                }}
              >
                For {roomDetails.data[0].remark}
              </Typography>

              {/* Virtual Room Zoom Information */}
              {roomDetails.data[0].is_virtual === "T" && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: "primary.main" }}>
                    🎥 Virtual Meeting Details
                  </Typography>

                  {roomDetails.data[0].zoom_link && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                        🔗 Zoom Link:
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "primary.main",
                            textDecoration: "underline",
                            cursor: "pointer",
                            wordBreak: "break-all",
                          }}
                          onClick={() => window.open(roomDetails.data[0].zoom_link, "_blank")}
                        >
                          {roomDetails.data[0].zoom_link}
                        </Typography>
                        <IconButton size="small" onClick={() => copyToClipboard(roomDetails.data[0].zoom_link)}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  )}

                  {/* Meeting ID and Passcode side by side */}
                  {(roomDetails.data[0].zoom_meeting_id || roomDetails.data[0].zoom_passcode) && (
                    <Box sx={{ display: "flex", gap: 2, mb: 1, flexWrap: "wrap" }}>
                      {roomDetails.data[0].zoom_meeting_id && (
                        <Box sx={{ flex: 1, minWidth: "120px" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                            Meeting ID:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.9rem",
                              }}
                            >
                              {roomDetails.data[0].zoom_meeting_id}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(roomDetails.data[0].zoom_meeting_id)}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      )}

                      {roomDetails.data[0].zoom_passcode && (
                        <Box sx={{ flex: 1, minWidth: "120px" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                            🔑 Passcode:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.9rem",
                              }}
                            >
                              {roomDetails.data[0].zoom_passcode}
                            </Typography>
                            <IconButton size="small" onClick={() => copyToClipboard(roomDetails.data[0].zoom_passcode)}>
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  gap: {
                    xs: 16,
                    md: 32,
                  },
                  my: {
                    xs: 2,
                    md: 0,
                  },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: "0.875rem",
                        sm: "1rem",
                      },
                      fontWeight: 500,
                    }}
                  >
                    Location:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: "0.875rem",
                        sm: "1rem",
                      },
                      fontWeight: 500,
                    }}
                  >
                    Capacity:
                  </Typography>
                  {roomDetails.data[0].is_virtual === "T" && (
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.875rem",
                          sm: "1rem",
                        },
                        fontWeight: 500,
                      }}
                    >
                      Type:
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: "0.875rem",
                        sm: "1rem",
                      },
                    }}
                  >
                    {roomDetails.data[0].lokasi}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: "0.875rem",
                        sm: "1rem",
                      },
                    }}
                  >
                    {roomDetails.data[0].kapasitas} participants
                  </Typography>
                  {roomDetails.data[0].is_virtual === "T" && (
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.875rem",
                          sm: "1rem",
                        },
                        color: "primary.main",
                        fontWeight: 500,
                      }}
                    >
                      Virtual Room (Zoom)
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: {
                    xs: 4,
                    sm: 8,
                  },
                  mt: {
                    xs: 2,
                    md: 16,
                  },
                }}
              >
                {roomDetails.data[0].fasilitas.map((item: string, idx: string) => (
                  <Box
                    sx={{
                      backgroundColor: "primary.main",
                      color: "#fafafa",
                      px: {
                        xs: 6,
                        sm: 10,
                      },
                      py: {
                        xs: 2,
                        sm: 4,
                      },
                      borderRadius: 2,
                      fontSize: {
                        xs: "0.75rem",
                        sm: "0.875rem",
                      },
                    }}
                    key={idx + item}
                  >
                    {item}
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
          {user?.role_name == "admin" && (
            <Box
              sx={{
                px: {
                  xs: 1,
                  sm: 0,
                },
              }}
            >
              <Button
                color="error"
                variant="contained"
                size={isMobile ? "small" : "medium"}
                sx={{
                  mt: 2,
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.875rem",
                  },
                }}
                onClick={() => setDeleteDialog(true)}
              >
                Delete Room
              </Button>
              {/* Download QR Button - on the right, only for physical rooms with existing QR */}
              {roomDetails.data[0].is_virtual !== "T" && qrCodeExists && (
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => downloadQRCodeWithTemplate(room, roomDetails.data[0].nama)}
                  size={isMobile ? "small" : "medium"}
                  disabled={downloadLoading}
                  sx={{
                    fontSize: {
                      xs: "0.75rem",
                      sm: "0.875rem",
                    },
                  }}
                >
                  {downloadLoading ? "Preparing..." : "Download QR"}
                </Button>
              )}
            </Box>
          )}
          <Dialog
            open={deleteDialog}
            onClose={() => setDeleteDialog(false)}
            fullScreen={isMobile}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: isMobile ? 0 : 2,
              },
            }}
          >
            <DialogTitle
              sx={{
                fontSize: {
                  xs: "1.1rem",
                  sm: "1.25rem",
                },
              }}
            >
              Delete Room
            </DialogTitle>
            <DialogContent
              sx={{
                px: {
                  xs: 2,
                  sm: 3,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "0.875rem",
                    sm: "1rem",
                  },
                }}
              >
                Are you sure you want to delete this room?
              </Typography>
            </DialogContent>
            <DialogActions
              sx={{
                px: {
                  xs: 2,
                  sm: 3,
                },
                gap: 1,
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
              }}
            >
              <Button onClick={() => setDeleteDialog(false)} fullWidth={isMobile} size={isMobile ? "medium" : "large"}>
                Cancel
              </Button>
              <Button
                color="error"
                onClick={handleDelete}
                variant="contained"
                fullWidth={isMobile}
                size={isMobile ? "medium" : "large"}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          <BigCalendar events={events} refreshBookings={refreshBookings} />
        </>
      ) : (
        <Typography
          align="center"
          sx={{
            my: 36,
            color: "grey.500",
            fontSize: {
              xs: "0.875rem",
              sm: "1rem",
            },
            px: {
              xs: 2,
              sm: 0,
            },
          }}
        >
          Please select room
        </Typography>
      )}
      {error && (
        <Typography
          align="center"
          sx={{
            fontSize: {
              xs: "0.875rem",
              sm: "1rem",
            },
            px: {
              xs: 2,
              sm: 0,
            },
          }}
        >
          Error fetching data
        </Typography>
      )}

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySnackbar}
        autoHideDuration={3000}
        onClose={() => setCopySnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setCopySnackbar(false)} severity="success" sx={{ width: "100%" }}>
          Copied to clipboard!
        </Alert>
      </Snackbar>

      {/* <CardEvent /> */}
    </>
  );
};

export default Room;
