"use client";
import { Box, Skeleton, Typography } from "@mui/material";
import * as date from "date-fns";
import { useState, useEffect } from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

export default function DigitalClock() {
  const rightNow = new Date();
  const [hour, setHour] = useState<any>("");
  const [minute, setMinute] = useState<any>("");
  const [second, setSecond] = useState<any>("");
  const [dateNow, setDate] = useState<any>("");

  useEffect(() => {
    const dateSet = setInterval(() => {
      setHour(date.format(rightNow, "HH"));
      setMinute(date.format(rightNow, "mm"));
      setSecond(date.format(rightNow, "ss"));
      setDate(date.format(rightNow, "eeee, do MMMM yyyy"));
    }, 1000);

    return () => {
      clearInterval(dateSet);
    };
  }, [hour, minute, second, rightNow]);

  return (
    <Box sx={{ my: 16 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: 4 }}>
        {dateNow ? (
          <Typography paragraph sx={{ m: 0, display: "flex", alignItems: "center" }}>
            {/* <CalendarTodayIcon sx={{ mr: 8 }} /> */}
            {dateNow}
          </Typography>
        ) : (
          <Skeleton variant="rounded" width={216} height={48} sx={{ bgcolor: "grey.700" }} />
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 4, width: "100%", justifyContent: "center" }}>
        {hour ? (
          <Typography sx={{ fontSize: "64pt", textAlign: "center" }}>{hour}</Typography>
        ) : (
          <Skeleton variant="rounded" width={96} height={96} sx={{ bgcolor: "grey.700", my: 8 }} />
        )}
        <p className="text-[64pt] text-center text-neutral-50 my-0">:</p>
        {minute ? (
          <Typography sx={{ fontSize: "64pt", textAlign: "center" }}>{minute}</Typography>
        ) : (
          <Skeleton variant="rounded" width={96} height={96} sx={{ bgcolor: "grey.700", my: 8 }} />
        )}
      </Box>
    </Box>
  );
}
