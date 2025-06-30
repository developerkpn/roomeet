"use client";

import BookForm from "@/components/book";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

const BookPage = ({ params }: { params: { bookpar: string[] } }) => {
  const [editData, setEditData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const axiosAuth = useAxiosAuth();

  useEffect(() => {
    const fetchEditData = async () => {
      if (params.bookpar && params.bookpar[1]) {
        try {
          console.log("Fetching edit data for:", params.bookpar[1]);
          const get = await axiosAuth.get(`/book/${params.bookpar[1]}`);
          console.log("Edit data fetched:", get.data);
          setEditData(get.data);
        } catch (error) {
          console.error("Error fetching edit data:", error);
          setEditData(undefined);
        }
      } else {
        setEditData(undefined);
      }
      setLoading(false);
    };

    fetchEditData();
  }, [params.bookpar, axiosAuth]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <BookForm editData={editData} />;
};

export default BookPage;
