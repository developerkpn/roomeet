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
          const date = new Date(item.book_date);

          return {
            title: `${item.agenda} (${item.approval.toUpperCase()})`,
            start: new Date(date.setHours(startHour, startMinute)),
            end: new Date(date.setHours(endHour, endMinute)),
            allDay: false,
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
      <Box sx={{ display: "flex", justifyContent: "end", mt: 24 }}>
        {rooms ? (
          <FormControl fullWidth>
            <InputLabel>Select Room</InputLabel>
            <Select
              defaultValue=""
              value={room}
              label="Approval"
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
            height={64}
            sx={{ bgcolor: "grey.700" }}
          />
        )}
      </Box>
      {isLoading && loading && events ? (
        <Skeleton
          variant="rounded"
          width="100%"
          height={128}
          sx={{ bgcolor: "grey.700", mt: 48 }}
        />
      ) : room && roomDetails ? (
        <>
          <Grid container spacing={16} sx={{ mt: 16 }}>
            <Grid item xs={12} md={8}>
              <Image
                src={roomDetails.data[0].image}
                alt="Room Image"
                style={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                  borderRadius: "0.75rem",
                }}
                width={1000}
                height={800}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h1" sx={{ color: "primary.main" }}>
                {roomDetails.data[0].nama}
              </Typography>
              <Typography>For {roomDetails.data[0].remark}</Typography>
              <Box sx={{ display: "flex", gap: 32 }}>
                <Box>
                  <Typography>Location:</Typography>
                  <Typography>Capacity:</Typography>
                </Box>
                <Box>
                  <Typography>{roomDetails.data[0].lokasi}</Typography>
                  <Typography>
                    {roomDetails.data[0].kapasitas} participants
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 8, mt: 16 }}>
                {roomDetails.data[0].fasilitas.map(
                  (item: string, idx: string) => (
                    <Box
                      sx={{
                        backgroundColor: "primary.main",
                        color: "#fafafa",
                        px: 10,
                        py: 4,
                        borderRadius: 2,
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
          <Button
            color="error"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setDeleteDialog(true)}
          >
            Delete Room
          </Button>
          <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogContent>
              Are you sure you want to delete this room?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button color="error" onClick={handleDelete} variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          <BigCalendar events={events} />
        </>
      ) : (
        <Typography align="center" sx={{ my: 36, color: "grey.500" }}>
          Please select room
        </Typography>
      )}
      {error && <Typography align="center">Error fetching data</Typography>}
      {/* <CardEvent /> */}
    </>
  );
};

export default Room;
