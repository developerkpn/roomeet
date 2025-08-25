"use client";
import NumericFieldComp from "@/common/NumericField";
import RadioComp from "@/common/Radio";
import SelectComp from "@/common/Select";
import { TextFieldComp } from "@/common/TextField";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Radio,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface RoomFormData {
  nama: string;
  kapasitas: number;
  lokasi: string;
  category: string;
  image: FileList | null;
  is_active: string;
  is_virtual: string;
  zoom_link: string;
  zoom_meeting_id: string;
  zoom_passcode: string;
  facilities: number[];
}

interface Facility {
  id_fasilitas: number;
  nama: string;
}

export default function CreateRoomPage() {
  const [loading, setLoading] = useState(false);
  const [isVirtual, setIsVirtual] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>([]);
  const router = useRouter();
  const axiosAuth = useAxiosAuth();

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      nama: "",
      kapasitas: 0,
      lokasi: "",
      category: "",
      image: null,
      is_active: "T",
      is_virtual: "F",
      zoom_link: "",
      zoom_meeting_id: "",
      zoom_passcode: "",
      facilities: [],
    } as RoomFormData,
  });

  // Fetch facilities on component mount
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axiosAuth.get("/room/facilities");
        setFacilities(response.data.data);
      } catch (error) {
        console.error("Error fetching facilities:", error);
        toast.error("Failed to load facilities");
      }
    };
    fetchFacilities();
  }, [axiosAuth]);

  const watchIsVirtual = watch("is_virtual");

  const onSubmit = async (values: RoomFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nama", values.nama);
      formData.append("kapasitas", values.kapasitas.toString());
      formData.append("lokasi", values.lokasi);
      formData.append("category", values.category);
      formData.append("is_active", values.is_active);
      formData.append("is_virtual", values.is_virtual);
      formData.append("zoom_link", values.zoom_link || "");
      formData.append("zoom_meeting_id", values.zoom_meeting_id || "");
      formData.append("zoom_passcode", values.zoom_passcode || "");

      // Add selected facilities
      if (selectedFacilities.length > 0) {
        formData.append("facilities", selectedFacilities.join(","));
      }

      if (values.image && values.image.length > 0) {
        formData.append("image", values.image[0]);
      }

      const response = await axiosAuth.post("/room", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(`Room created successfully with ID: ${response.data.id_ruangan}`);
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

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: "100%" }}>
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
          <SelectComp name="category" label="Category" control={control} rules={{ required: "Category is required" }}>
            <MenuItem value="INT">Internal</MenuItem>
            <MenuItem value="EXT">External</MenuItem>
            <MenuItem value="ALL">All (Internal & External)</MenuItem>
          </SelectComp>
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

        <Box sx={{ mb: 12 }}>
          <RadioComp
            name="is_virtual"
            label="Room Type"
            rules={{ required: "Select room type" }}
            control={control}
            onChangeOvr={(value: any) => {
              setIsVirtual(value === "T");
            }}
          >
            <FormControlLabel value="F" control={<Radio />} label="Physical Room" />
            <FormControlLabel value="T" control={<Radio />} label="Virtual Room (Zoom)" />
          </RadioComp>
        </Box>

        {watchIsVirtual === "T" && (
          <>
            <Box sx={{ mb: 12 }}>
              <TextFieldComp
                control={control}
                label="Zoom Meeting Link"
                name="zoom_link"
                rules={{
                  required: watchIsVirtual === "T" ? "Zoom link is required for virtual rooms" : false,
                  pattern: {
                    value: /^https?:\/\/.*/,
                    message: "Please enter a valid URL starting with http:// or https://",
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 12 }}>
              <TextFieldComp
                control={control}
                label="Zoom Meeting ID"
                name="zoom_meeting_id"
                rules={{
                  required: watchIsVirtual === "T" ? "Meeting ID is required for virtual rooms" : false,
                }}
              />
            </Box>

            <Box sx={{ mb: 12 }}>
              <TextFieldComp control={control} label="Zoom Passcode (Optional)" name="zoom_passcode" />
            </Box>
          </>
        )}

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
          <SelectComp name="is_active" label="Status" control={control} rules={{ required: "Status is required" }}>
            <MenuItem value="T">Active</MenuItem>
            <MenuItem value="F">Inactive</MenuItem>
          </SelectComp>
        </Box>

        <Box sx={{ display: "flex", gap: 8, justifyContent: "end" }}>
          <Button variant="text" onClick={() => router.push("/admin/room")} disabled={loading}>
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
