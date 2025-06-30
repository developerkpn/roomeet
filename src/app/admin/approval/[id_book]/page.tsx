"use client";

import ApprovalAction from "@/components/admin/ApprovalAction";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Box, Skeleton, Typography } from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Approval = ({ params }: { params: { id_book: string } }) => {
  const [book, setBook] = useState<any>();
  const axiosAuth = useAxiosAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const get = await axiosAuth.get(`/book/${params.id_book}`);
        console.log(get.data, "get.data");
        setBook(get.data);
      } catch (error: any) {
        if (error?.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Server Error");
          console.log(error);
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id_book]);

  return (
    <>
      {book ? (
        <>
          <Typography
            sx={[
              {
                mb: 16,
              },
              book.approval === "pending" && {
                color: "warning.main",
              },
              book.approval === "rejected" && {
                color: "error.main",
              },
              book.approval === "approved" && {
                color: "success.main",
              },
              book.approval === "canceled" && {
                color: "grey.500",
              },
              book.approval === "finished" && {
                color: "grey.500",
              },
            ]}
          >{`Approval - ${book.approval}`}</Typography>
          <Typography>{book.id_ticket}</Typography>
          <Typography variant="h1" sx={{ color: "primary.light" }}>
            {book.agenda}
          </Typography>
          <Typography variant="h2">{book.id_ruangan}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <PeopleAltIcon />
            <Typography>{book.prtcpt_ctr} participants</Typography>
          </Box>
          <Box sx={{ my: 16 }}>
            <Typography>
              {moment(book.book_date).format("dddd, DD/MM/YYYY")}
            </Typography>
            <Typography>{`${book.time_start.slice(
              0,
              5
            )} - ${book.time_end.slice(0, 5)}`}</Typography>
          </Box>
          <Typography sx={{ mb: 16 }}>
            Created by:
            <br />
            {book.username}
          </Typography>
          <Typography>Remark:</Typography>
          <Typography sx={{ mb: 16 }}>
            {book.remark ? book.remark : "---"}
          </Typography>
          {book.reject_note && (
            <Box>
              <Typography sx={{ color: "error.light" }}>
                Reject Note:
              </Typography>
              <Typography>{book.reject_note}</Typography>
            </Box>
          )}
          {book.approval === "pending" ? (
            <ApprovalAction id_book={params.id_book} props={book} />
          ) : null}
        </>
      ) : (
        <Skeleton
          variant="rounded"
          width="100%"
          height={96}
          sx={{ bgcolor: "grey.700" }}
        />
      )}
    </>
  );
};
export default Approval;
