"use client";

import { useAuthStore } from "@/lib/store/useAuthStore";
import BackspaceIcon from "@mui/icons-material/Backspace";
import PersonIcon from "@mui/icons-material/Person";
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

const AdminPage = () => {
  const user = useAuthStore((state) => state.user);
  const [date, setDate] = useState<any>("");
  const [status, setStatus] = useState<any>("all");
  const [dateVal, setDateVal] = useState<any>(null);
  const url = `/book?book_date=${date}&approval=${
    status === "all" ? "" : status
  }`;
  const { data: books } = useSWR(user && url, {
    fallback: { url: [] },
  });

  const handleDate = (value: Date | null) => {
    const d = moment(value).format("YYYY-MM-DD");
    setDateVal(value);
    setDate(d);
  };

  const handleStatus = (e: SelectChangeEvent<any>) => {
    const s = e.target.value;
    setStatus(s);
  };

  return (
    <>
      <Box
        sx={{
          pb: 16,
        }}
      >
        <Box sx={{ display: "flex", gap: 16, my: 16 }}>
          <Typography variant="h1" sx={{ color: "primary.light" }}>
            Admin Page
          </Typography>
          <Link href="/dashboard">
            <Button variant="outlined">Dashboard</Button>
          </Link>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DatePicker
              value={dateVal}
              label="Search Date"
              onChange={handleDate}
              sx={{ flex: "1" }}
            />
            <IconButton
              aria-label="clear"
              onClick={() => {
                setDate("");
                setDateVal(null);
              }}
            >
              <BackspaceIcon />
            </IconButton>
          </Box>
          <FormControl fullWidth>
            <InputLabel>Approval Status</InputLabel>
            <Select
              defaultValue="all"
              value={status}
              label="Approval"
              onChange={handleStatus}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="canceled">Canceled</MenuItem>
              <MenuItem value="finished">Finished</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 16,
          flexDirection: "column",
          px: 16,
          maxHeight: "70vh",
          overflow: "auto",
        }}
      >
        {!books ? (
          <Skeleton
            variant="rounded"
            width="100%"
            height={96}
            sx={{ bgcolor: "grey.700" }}
          />
        ) : (
          <Grid container spacing={16}>
            {books?.data.map((book: any) => (
              <Grid item xs={12} md={6} key={book.id}>
                <Box
                  sx={{ pb: 24, bgcolor: "background.card", borderRadius: 4 }}
                >
                  <Box
                    sx={[
                      {
                        color: "black",
                        mb: 16,
                        px: 12,
                        py: 8,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                      },
                      book.approval === "pending" && {
                        backgroundColor: "warning.main",
                      },
                      book.approval === "rejected" && {
                        backgroundColor: "error.main",
                      },
                      book.approval === "approved" && {
                        backgroundColor: "success.main",
                      },
                      book.approval === "canceled" && {
                        backgroundColor: "black",
                        color: "#fafafa",
                      },
                      book.approval === "finished" && {
                        backgroundColor: "grey.500",
                        color: "#fafafa",
                      },
                    ]}
                  >
                    <Typography>Status: {book.approval}</Typography>
                  </Box>
                  <Grid container spacing={8} sx={{ px: 24 }}>
                    <Grid item xs={7}>
                      <Typography>{book.id_ticket}</Typography>
                      <Typography variant="h3" sx={{ color: "primary.light" }}>
                        {book.agenda}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 8,
                        }}
                      >
                        <PersonIcon />
                        <Typography>{book.username}</Typography>
                      </Box>
                      <Typography sx={{ color: "error.light" }}>
                        {book.reject_note && `${book.reject_note}`}
                      </Typography>
                    </Grid>
                    <Grid item xs={5} sx={{ textAlign: "right" }}>
                      <Typography>{book.id_ruangan}</Typography>
                      <Typography>
                        {moment(book.book_date).format("DD-MM-YYYY")}
                      </Typography>
                      <Typography>{`${book.time_start.slice(
                        0,
                        5
                      )} - ${book.time_end.slice(0, 5)}`}</Typography>
                      <Box sx={{ textAlign: "right", mt: 24 }}>
                        <Link href={`/admin/approval/${book.id_book}`}>
                          <Button variant="contained">Details</Button>
                        </Link>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
};
export default AdminPage;
