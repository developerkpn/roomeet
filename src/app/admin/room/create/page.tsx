"use client";
import NumericFieldComp from "@/common/NumericField";
import SelectComp from "@/common/Select";
import { TextFieldComp } from "@/common/TextField";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface RoomFormData {
  nama: string;
  kapasitas: number;
  lokasi: string;
  category: string;
  image: FileList | null;
  is_active: string;
}

export default function CreateRoomPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const axiosAuth = useAxiosAuth();

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      nama: "",
      kapasitas: 0,
      lokasi: "",
      category: "",
      image: null,
      is_active: "T",
    } as RoomFormData,
  });

  const onSubmit = async (values: RoomFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nama", values.nama);
      formData.append("kapasitas", values.kapasitas.toString());
      formData.append("lokasi", values.lokasi);
      formData.append("category", values.category);
      formData.append("is_active", values.is_active);

      if (values.image && values.image.length > 0) {
        formData.append("image", values.image[0]);
      }

      const response = await axiosAuth.post("/room", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(
        `Room created successfully with ID: ${response.data.id_ruangan}`
      );
      router.push("/admin/room");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box>
        <Typography variant="h1" sx={{ color: "primary.light" }}>
          Create Room
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
          Room ID will be automatically generated
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ width: "100%" }}
      >
        <Box sx={{ mb: 12 }}>
          <TextFieldComp
            control={control}
            label="Room Name"
            name="nama"
            rules={{ required: "Room name is required" }}
          />
        </Box>

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
          <TextFieldComp
            control={control}
            label="Location (include floor number for auto-ID generation)"
            name="lokasi"
            rules={{ required: "Location is required" }}
          />
        </Box>

        <Box sx={{ mb: 12 }}>
          <SelectComp
            name="category"
            label="Category"
            control={control}
            rules={{ required: "Category is required" }}
          >
            <MenuItem value="INT">Internal</MenuItem>
            <MenuItem value="EXT">External</MenuItem>
          </SelectComp>
        </Box>

        <Box sx={{ mb: 12 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
            Room Image
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                // Update form value manually since react-hook-form doesn't handle file inputs well
                setValue("image", files);
              }
            }}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </Box>

        <Box sx={{ mb: 12 }}>
          <SelectComp
            name="is_active"
            label="Status"
            control={control}
            rules={{ required: "Status is required" }}
          >
            <MenuItem value="T">Active</MenuItem>
            <MenuItem value="F">Inactive</MenuItem>
          </SelectComp>
        </Box>

        <Box sx={{ display: "flex", gap: 8, justifyContent: "end" }}>
          <Button
            variant="text"
            onClick={() => router.push("/admin/room")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Create Room"}
          </Button>
        </Box>
      </Box>
    </>
  );
}
