"use client";
import NumericFieldComp from "@/common/NumericField";
import { TextFieldComp } from "@/common/TextField";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface EditRoomFormData {
  kapasitas: number;
  facilities: number[];
}

interface Facility {
  id_fasilitas: number;
  nama: string;
}

interface RoomData {
  id_ruangan: string;
  nama: string;
  kapasitas: number;
  lokasi: string;
  category: string;
  is_virtual: string;
}

export default function EditRoomPage() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>([]);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const router = useRouter();
  const params = useParams();
  const axiosAuth = useAxiosAuth();
  const roomId = params.id as string;

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      kapasitas: 0,
      facilities: [],
    } as EditRoomFormData,
  });

  // Fetch room data and facilities on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Fetch room details
        const roomResponse = await axiosAuth.get(`/room/${roomId}`);
        const room = roomResponse.data;
        setRoomData(room);
        setValue("kapasitas", room.kapasitas);

        // Fetch all facilities
        const facilitiesResponse = await axiosAuth.get("/room/facilities");
        setFacilities(facilitiesResponse.data.data);

        // Fetch room's current facilities
        const roomFacResponse = await axiosAuth.get(`/room/fas?id_room=${roomId}`);
        const roomFacilities = roomFacResponse.data.data[0]?.fasilitas || [];
        
        // Map facility names to IDs
        const facilityIds = facilitiesResponse.data.data
          .filter((fac: Facility) => roomFacilities.includes(fac.nama))
          .map((fac: Facility) => fac.id_fasilitas);
        
        setSelectedFacilities(facilityIds);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load room data");
        router.push("/admin/room");
      } finally {
        setLoadingData(false);
      }
    };
    
    if (roomId) {
      fetchData();
    }
  }, [axiosAuth, roomId, setValue, router]);

  const onSubmit = async (values: EditRoomFormData) => {
    setLoading(true);
    try {
      const payload = {
        kapasitas: values.kapasitas,
        facilities: selectedFacilities,
      };

      const response = await axiosAuth.patch(`/room/${roomId}`, payload);
      
      toast.success("Room updated successfully");
      router.push("/admin/room");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update room");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!roomData) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Room not found
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box>
        <Typography variant="h1" sx={{ color: "primary.light" }}>
          Edit Room: {roomData.nama}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          You can only edit room capacity and facilities. Other details cannot be modified.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: "100%" }}>
        <Box sx={{ mb: 12 }}>
          <NumericFieldComp
            control={control}
            name="kapasitas"
            label="Capacity"
            type="number"
            min={1}
            max={100}
            rules={{
              required: "Capacity is required",
              min: { value: 1, message: "Minimum capacity is 1" },
              max: { value: 100, message: "Maximum capacity is 100" },
            }}
          />
        </Box>

        <Box sx={{ mb: 12 }}>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Room Facilities
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)', // 1 column on extra small screens
              sm: 'repeat(2, 1fr)', // 2 columns on small screens
              md: 'repeat(3, 1fr)', // 3 columns on medium screens
              lg: 'repeat(4, 1fr)', // 4 columns on large screens
              xl: 'repeat(5, 1fr)'  // 5 columns on extra large screens
            }, 
            gap: 2 
          }}>
            {facilities.map((facility) => (
              <FormControlLabel
                key={facility.id_fasilitas}
                control={
                  <Checkbox
                    checked={selectedFacilities.includes(facility.id_fasilitas)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFacilities([...selectedFacilities, facility.id_fasilitas]);
                      } else {
                        setSelectedFacilities(selectedFacilities.filter((id) => id !== facility.id_fasilitas));
                      }
                    }}
                  />
                }
                label={facility.nama}
                sx={{
                  margin: 0, // Remove default margin
                  '& .MuiFormControlLabel-label': {
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 8, justifyContent: "end" }}>
          <Button variant="text" onClick={() => router.push("/admin/room")} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Update Room"}
          </Button>
        </Box>
      </Box>
    </>
  );
}