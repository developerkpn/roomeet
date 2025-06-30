import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import useFetch from "@/lib/hooks/useFetch";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import useSWR from "swr";
import BigCalendar from "./BigCalendar";

const Room = () => {
  const [room, setRoom] = useState("");
  const [events, setEvents] = useState();
  const [rooms, setRooms] = useState<any>();
  const axiosAuth = useAxiosAuth();
  const [deleteDialog, setDeleteDialog] = useState(false);

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

  const { data: roomDetails, loading } = useFetch<any>(
    room ? `/room/fas?id_room=${room}` : ""
  );

  useEffect(() => {
    const getRooms = async () => {
      const get = await axiosAuth.get("/room");
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
  }, [books, axiosAuth]);

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

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
          mt: 24,
          px: {
            xs: 1,
            sm: 0,
          },
        }}
      >
        {rooms ? (
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>Select Room</InputLabel>
            <Select
              defaultValue=""
              value={room}
              label="Select Room"
              onChange={handleRoom}
            >
              {rooms.map((room: any) => (
                <MenuItem key={room.id} value={room.id_ruangan}>
                  {room.nama}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Skeleton
            variant="rounded"
            width="100%"
            height={isMobile ? 48 : 64}
            sx={{ bgcolor: "grey.700" }}
          />
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
            <Grid item xs={12} md={8}>
              <Image
                src={roomDetails.data[0].image}
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
                {roomDetails.data[0].fasilitas.map(
                  (item: string, idx: string) => (
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
                  )
                )}
              </Box>
            </Grid>
          </Grid>
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
          </Box>
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
              <Button
                onClick={() => setDeleteDialog(false)}
                fullWidth={isMobile}
                size={isMobile ? "medium" : "large"}
              >
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
          <BigCalendar events={events} />
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
      {/* <CardEvent /> */}
    </>
  );
};

export default Room;
