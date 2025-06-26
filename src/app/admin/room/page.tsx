"use client";
import Room from "@/components/room";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => router.push("/admin/room/create")}
        >
          Add Room
        </Button>
      </Box>
      <Room />
    </>
  );
}
