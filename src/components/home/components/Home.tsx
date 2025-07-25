"use client";

import ConfirmationDialog from "@/common/ConfirmationDialog";
import QRScanner from "@/common/QRScanner";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { QrCodeScanner } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Grid,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import DigitalClock from "./DigitalClock";

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const axiosAuth = useAxiosAuth();
  const [counter, setCounter] = useState<number>();
  const [penalty, setPenalty] = useState();

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission !== "denied" || "granted") {
        Notification.requestPermission();
      }
    }

    const checkPenalty = async () => {
      try {
        const res = await axiosAuth.patch("/user/penalty", {
          id_user: user?.id_user,
        });
        console.log(user, "user from home");
        console.log(res.data, "res.data check penalty");
        setCounter(res.data.counter);
      } catch (error: any) {
        if (error?.response && user?.id_user) {
          console.error(error, "error fetching penalty");
          setCounter(error?.response.data.counter);
          setPenalty(error?.response.data.message);
        } else {
          console.error(error);
        }
      }
    };
    checkPenalty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id_user]);

  const ciUrl = `/book/checkin/${user?.id_user}`;
  const coUrl = `/book/checkout/${user?.id_user}`;
  const bookUrl = `/book/show?id_user=${user?.id_user}&active=T&limit=2`;

  const { data: checkin, mutate: ciMutate } = useSWR(user && ciUrl, {
    fallback: { ciUrl: [] },
  });

  const { data: checkout, mutate: coMutate } = useSWR(user && coUrl, {
    fallback: { coUrl: [] },
  });

  const { data: books, mutate: bookMutate } = useSWR(user && bookUrl, {
    fallback: { coUrl: [] },
  });

  const handleCheckIn = async (id_user: any, id_book: any) => {
    try {
      const res = await axiosAuth.patch("/book/checkin", {
        data: {
          id_user: id_user,
          id_book: id_book,
        },
      });
      ciMutate();
      coMutate();
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Error");
    }
  };

  const handleCheckOut = async (id_user: any, id_book: any) => {
    try {
      const res = await axiosAuth.patch("/book/checkout", {
        data: {
          id_user: id_user,
          id_book: id_book,
        },
      });
      coMutate();
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Error");
    }
  };

  // QR-based check-in/check-out handlers
  const handleQRCheckIn = async (room_id: string) => {
    if (!user?.id_user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const res = await axiosAuth.patch("/book/checkin", {
        id_user: user.id_user,
        room_id: room_id,
      });
      ciMutate();
      coMutate();
      bookMutate();
      toast.success(res.data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Check-in failed");
    }
  };

  const handleQRCheckOut = async (room_id: string) => {
    if (!user?.id_user) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const res = await axiosAuth.patch("/book/checkout", {
        id_user: user.id_user,
        room_id: room_id,
      });
      coMutate();
      bookMutate();
      toast.success(res.data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Check-out failed");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ my: 16 }}>
        <Typography variant="h1" sx={{ color: "primary.main" }}>
          Welcome!{" "}
          <Box component="span" sx={{ color: "white" }}>
            {user?.name}
          </Box>
        </Typography>
        {user?.role_id === process.env.NEXT_PUBLIC_ADMIN_ID && (
          <Link href="/admin">
            <Button variant="outlined">To Admin</Button>
          </Link>
        )}
        {counter && counter !== 0 ? (
          <Tooltip title="When you missed checking out 3 times, you will get penalty and be banned from creating booking  for 3 days.">
            {penalty ? (
              <Alert severity="error">{penalty}</Alert>
            ) : (
              <Alert severity="warning">{`You have missed checking out ${counter}/3 times`}</Alert>
            )}
          </Tooltip>
        ) : null}
      </Box>
      <DigitalClock />

      <Box sx={{ mb: 16 }}>
        <Typography sx={{ fontWeight: "bold", mb: 16, color: "primary.light" }}>
          Check In
        </Typography>

        {/* QR Scanner Check-in Button */}
        <Box sx={{ mb: 2 }}>
          <QRScanner
            onScan={handleQRCheckIn}
            title="Check In with QR Code"
            actionText="Check In"
          >
            {(showScanner) => (
              <Button
                variant="outlined"
                startIcon={<QrCodeScanner />}
                onClick={showScanner}
                fullWidth
                sx={{ mb: 2 }}
              >
                Scan QR to Check In
              </Button>
            )}
          </QRScanner>
        </Box>

        {checkin ? (
          checkin?.data.length !== 0 ? (
            <Grid container spacing={16}>
              {/* Loading finished and data exist */}
              {checkin?.data.map((ci: any) => (
                <Grid item xs={12} sm={6} key={ci.id_book}>
                  <Box
                    sx={{
                      px: 24,
                      py: 16,
                      backgroundColor: "background.card",
                      mt: 16,
                      borderRadius: 4,
                    }}
                  >
                    <Typography variant="h2">{ci.agenda}</Typography>
                    <Typography variant="h3">{ci.id_ruangan}</Typography>
                    <Typography variant="h3" sx={{ fontWeight: "regular" }}>
                      {`${ci.time_start} - ${ci.time_end} | ${moment(
                        ci.book_date
                      ).format("DD/MM/YYYY")}`}
                    </Typography>
                    <ConfirmationDialog
                      title="Confirm Check In"
                      desc="Are you sure you want to check in?"
                      action="Check In"
                      response={() => handleCheckIn(user?.id_user, ci.id_book)}
                      type="button"
                    >
                      {(showDialog: any) => (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={showDialog}
                        >
                          Check In
                        </Button>
                      )}
                    </ConfirmationDialog>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Loading finished and data dont exist
            <Typography sx={{ color: "grey.500" }}>
              No upcoming meeting
            </Typography>
          )
        ) : (
          // Loading UI
          <Skeleton
            variant="rounded"
            width="100%"
            height={64}
            sx={{ bgcolor: "grey.700" }}
          />
        )}
      </Box>

      <Box sx={{ mb: 16 }}>
        <Typography sx={{ fontWeight: "bold", my: 16, color: "primary.light" }}>
          Check Out
        </Typography>

        {/* QR Scanner Check-out Button */}
        <Box sx={{ mb: 2 }}>
          <QRScanner
            onScan={handleQRCheckOut}
            title="Check Out with QR Code"
            actionText="Check Out"
          >
            {(showScanner) => (
              <Button
                variant="outlined"
                startIcon={<QrCodeScanner />}
                onClick={showScanner}
                fullWidth
                sx={{ mb: 2 }}
                color="error"
              >
                Scan QR to Check Out
              </Button>
            )}
          </QRScanner>
        </Box>

        {checkout ? (
          checkout?.data.length !== 0 ? (
            <Grid container spacing={16}>
              {checkout?.data.map((co: any) => (
                <Grid item xs={12} sm={6} key={co.id_book}>
                  <Box
                    sx={{
                      px: 24,
                      py: 16,
                      backgroundColor: "background.card",
                      mt: 16,
                      borderRadius: 4,
                    }}
                  >
                    <Typography variant="h2">{co.agenda}</Typography>
                    <Typography variant="h3">{co.id_ruangan}</Typography>
                    <Typography variant="h3" sx={{ fontWeight: "regular" }}>
                      {`${co.time_start} - ${co.time_end} | ${moment(
                        co.book_date
                      ).format("DD/MM/YYYY")}`}
                    </Typography>
                    <ConfirmationDialog
                      title="Confirm Check Out"
                      desc="Are you sure you want to check out?"
                      action="Check Out"
                      response={() => handleCheckOut(user?.id_user, co.id_book)}
                      type="button"
                      color="error"
                    >
                      {(showDialog: any) => (
                        <Button
                          color="error"
                          variant="contained"
                          fullWidth
                          onClick={showDialog}
                        >
                          Check Out
                        </Button>
                      )}
                    </ConfirmationDialog>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ color: "grey.500" }}>
              Please check in first
            </Typography>
          )
        ) : (
          // Loading UI
          <Skeleton
            variant="rounded"
            width="100%"
            height={64}
            sx={{ bgcolor: "grey.700" }}
          />
        )}
      </Box>

      <Box sx={{ mb: 16 }}>
        <Typography sx={{ fontWeight: "bold", my: 16, color: "primary.light" }}>
          Nearest Meeting
        </Typography>
        {books ? (
          books?.data.length !== 0 ? (
            <Grid container spacing={16}>
              {books?.data.map((book: any) => (
                <Grid item xs={12} sm={6} key={book.id_book}>
                  <Box
                    sx={{
                      px: 24,
                      py: 16,
                      backgroundColor: "background.card",
                      mb: 16,
                      borderRadius: 4,
                    }}
                  >
                    <Grid container>
                      <Grid item xs={8}>
                        <Typography variant="h2">{book.agenda}</Typography>
                        <Typography variant="h3">{book.id_room}</Typography>
                        <Typography variant="h4" sx={{ fontWeight: "regular" }}>
                          {`${book.time_start} - ${book.time_end} | ${moment(
                            book.book_date
                          ).format("DD/MM/YYYY")}`}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography
                          align="center"
                          sx={[
                            {
                              color: "black",
                              borderRadius: 2,
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
                          ]}
                        >
                          {book.approval}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ color: "grey.500" }}>No meeting</Typography>
          )
        ) : (
          // Loading UI
          <Skeleton
            variant="rounded"
            width="100%"
            height={64}
            sx={{ bgcolor: "grey.700" }}
          />
        )}
      </Box>
    </Box>
  );
};

export default Home;
