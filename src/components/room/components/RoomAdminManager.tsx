import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import useSWR from "swr";

type RoomType = {
  id_ruangan: string;
  nama: string;
  kapasitas: number;
  lokasi: string;
  category: string;
  image?: string;
  is_active?: string;
};

const emptyRoom: RoomType = {
  id_ruangan: "",
  nama: "",
  kapasitas: 0,
  lokasi: "",
  category: "",
  image: "",
  is_active: "T",
};

const RoomAdminManager = () => {
  const axiosAuth = useAxiosAuth();
  const { data: roomsData, mutate } = useSWR("/room", (url) =>
    axiosAuth.get(url).then((res) => res.data)
  );
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomType>(emptyRoom);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  const handleOpen = (room?: RoomType) => {
    setEditMode(!!room);
    setSelectedRoom(room ? { ...room } : emptyRoom);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRoom({ ...selectedRoom, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (editMode) {
      await axiosAuth.put(`/room/${selectedRoom.id_ruangan}`, selectedRoom);
    } else {
      await axiosAuth.post("/room", selectedRoom);
    }
    mutate();
    setOpen(false);
  };

  const handleDelete = async () => {
    if (deleteDialog.id) {
      await axiosAuth.delete(`/room/${deleteDialog.id}`);
      mutate();
      setDeleteDialog({ open: false, id: null });
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h2">Room Management</Typography>
        <Button variant="contained" href="/admin/room/create">
          Add Room
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomsData?.map((room: RoomType) => (
              <TableRow key={room.id_ruangan}>
                <TableCell>{room.id_ruangan}</TableCell>
                <TableCell>{room.nama}</TableCell>
                <TableCell>{room.kapasitas}</TableCell>
                <TableCell>{room.lokasi}</TableCell>
                <TableCell>{room.category}</TableCell>
                <TableCell>{room.is_active}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(room)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() =>
                      setDeleteDialog({ open: true, id: room.id_ruangan })
                    }
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
      >
        <DialogTitle>Delete Room</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this room?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })}>
            Cancel
          </Button>
          <Button color="error" onClick={handleDelete} variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomAdminManager;
