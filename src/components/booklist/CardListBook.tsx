"use client";

import ConfirmationDialog from "@/common/ConfirmationDialog";
import { CardsListBookSkeleton } from "@/common/skeletons/CardSkeleton";
import { axiosAuth } from "@/lib/axios";
import { useAuthStore } from "@/lib/store/auth";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Grid, IconButton, Typography } from "@mui/material";
import axios, { AxiosError } from "axios";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";

interface CardListBookProp {
  agendaTitle: string;
  room: string;
  startTime: string;
  endTime: string;
  bookDate: string;
  status: string;
  id_book: string;
  id_ticket: string;
  id_room: string;
  approval: string;
  mutate: any;
  is_active: string;
}

interface AgendaDatas {
  id_book: string;
  id_ticket: string;
  id_user: string;
  id_room: string;
  nama_ruangan: string;
  agenda: string;
  is_active: string;
  time_start: string;
  time_end: string;
  book_date: string;
  approval: string;
  status: string;
}

function CardListBook({
  agendaTitle,
  startTime,
  endTime,
  bookDate,
  is_active,
  room,
  id_book,
  id_ticket,
  id_room,
  approval,
  mutate,
}: CardListBookProp) {
  const [actions, setActions] = useState(false);

  useEffect(() => {
    const time = moment(`${bookDate} ${startTime}`, "YYYY-MM-DD HH:mm");

    const checkTime = () => {
      const now = moment();
      setActions(now.isBefore(time));
    };

    checkTime();
  }, [bookDate, startTime]);

  const handleDelete = async (id_book: string) => {
    try {
      await axiosAuth.delete(`/book/${id_book}`);
      mutate();
      toast.success(`Success canceling ${id_ticket}`);
    } catch (error) {
      const errors = error as AxiosError;
      if (axios.isAxiosError(error)) {
        const data = errors.response?.data as { message: string };
        toast.error(data.message);
      } else {
        toast.error("error");
      }
      console.error(error);
    }
  };

  return (
    <Grid item xs={12} sm={6}>
      <Box sx={{ px: 24, py: 24, bgcolor: "background.card", borderRadius: 4 }}>
        <Grid container>
          <Grid item xs={8}>
            <Typography variant="h3" sx={{ color: "primary.light" }}>
              {agendaTitle}
            </Typography>
            <Typography variant="h4">{room}</Typography>
            <Typography>{`${moment(bookDate).format(
              "DD/MM/YYYY"
            )}`}</Typography>
            <Typography>{`${startTime} - ${endTime}`}</Typography>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
              justifyContent: "space-between",
            }}
          >
            <Typography
              align="center"
              sx={[
                {
                  color: "black",
                  borderRadius: 2,
                  width: "100%",
                },
                approval === "pending" && {
                  backgroundColor: "warning.main",
                },
                approval === "rejected" && {
                  backgroundColor: "error.main",
                },
                approval === "approved" && {
                  backgroundColor: "success.main",
                },
                approval === "canceled" && {
                  backgroundColor: "black",
                  color: "#fafafa",
                },
                approval === "finished" && {
                  backgroundColor: "grey.500",
                  color: "#fafafa",
                },
              ]}
            >
              {approval}
            </Typography>
            {(approval === "pending" || approval === "approved") &&
              is_active === "T" &&
              actions && (
                <Box sx={{ display: "flex", gap: 8 }}>
                  <Link href={`/dashboard/book/${id_room}/${id_book}`}>
                    <IconButton
                      sx={{
                        bgcolor: "secondary.main",
                        color: "#202020",
                        "&:hover": {
                          bgcolor: "secondary.light",
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Link>
                  <ConfirmationDialog
                    title="Submit Book"
                    desc="Are you sure you want to delete?"
                    action="Delete"
                    response={() => handleDelete(id_book)}
                    type="button"
                    color="error"
                  >
                    {(showDialog: any) => (
                      <IconButton
                        sx={{
                          bgcolor: "error.main",
                          color: "#fafafa",
                          "&:hover": {
                            bgcolor: "error.light",
                          },
                        }}
                        onClick={showDialog}
                      >
                        <ClearIcon />
                      </IconButton>
                    )}
                  </ConfirmationDialog>
                </Box>
              )}
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
}

export function CardsListBook({ date, status }: any) {
  const user = useAuthStore((state) => state.user);
  const url = `/book/show?id_user=${user?.id_user}&book_date=${date}&status=${status}`;
  const {
    data: agendas,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR(user && url, {
    suspense: true,
    fallback: {
      [url]: [],
    },
  });
  const agendasData: Array<CardListBookProp> = agendas
    ? agendas?.data?.map((item: AgendaDatas) => ({
        agendaTitle: item.agenda,
        room: item.nama_ruangan,
        startTime: item.time_start,
        endTime: item.time_end,
        bookDate: item.book_date,
        status: item.status,
        id_book: item.id_book,
        id_ticket: item.id_ticket,
        id_room: item.id_room,
        approval: item.approval,
        is_active: item.is_active,
      }))
    : [];
  console.log(agendas);
  console.log(isValidating);
  console.log("TANGGAL", date);

  return (
    <Box sx={{ px: 16 }}>
      <Grid container spacing={16}>
        {!isLoading &&
          agendasData &&
          agendasData.map((item) => (
            <CardListBook
              {...item}
              mutate={mutate}
              key={item.id_book + item.id_room}
            />
          ))}
      </Grid>
      {isLoading && !agendasData && <CardsListBookSkeleton />}
    </Box>
  );
}
