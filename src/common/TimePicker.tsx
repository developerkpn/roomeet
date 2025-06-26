"use client";

import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Control, Controller } from "react-hook-form";

interface DatePickerProps {
  name: string;
  label: string;
  control: Control<any> | undefined;
  rules?: object;
  disabled?: boolean;
  sx?: object;
  valueOvr?: Date;
  onChangeOvr?: (value: any) => void;
}

export default function TimePickerComp({
  name,
  label,
  control,
  rules,
  disabled,
  sx,
  valueOvr,
  onChangeOvr,
}: DatePickerProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tempHour, setTempHour] = useState<number | null>(null);
  const [tempMinute, setTempMinute] = useState<number | null>(null);

  // Generate hours 6-22
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  // Generate minutes 0, 15, 30, 45
  const minutes = [0, 15, 30, 45];

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return "";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const createDateFromHourMinute = (hour: number, minute: number) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const applyTimeSelection = (hour: number, minute: number, onChange: any) => {
    const newDate = createDateFromHourMinute(hour, minute);
    if (onChangeOvr) {
      onChangeOvr(newDate);
    }
    onChange(newDate);

    // Close popover with a small delay to ensure selection is visible
    setTimeout(() => {
      setAnchorEl(null);
      setTempHour(null);
      setTempMinute(null);
    }, 100);
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={valueOvr}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const currentValue = valueOvr || value;
        const displayValue = formatTime(currentValue);

        const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
          setAnchorEl(event.currentTarget);
          if (currentValue) {
            setTempHour(currentValue.getHours());
            setTempMinute(currentValue.getMinutes());
          } else {
            // Don't set default values - let user explicitly select both
            setTempHour(null);
            setTempMinute(null);
          }
        };

        const handleClose = () => {
          setAnchorEl(null);
          setTempHour(null);
          setTempMinute(null);
        };

        const handleHourSelect = (hour: number) => {
          setTempHour(hour);
          // If minute is already selected, apply the time immediately
          if (tempMinute !== null) {
            applyTimeSelection(hour, tempMinute, onChange);
          }
        };

        const handleMinuteSelect = (minute: number) => {
          setTempMinute(minute);
          // If hour is already selected, apply the time immediately
          if (tempHour !== null) {
            applyTimeSelection(tempHour, minute, onChange);
          }
        };

        const open = Boolean(anchorEl);

        return (
          <Box sx={sx}>
            <FormControl fullWidth error={!!error}>
              <InputLabel>{label}</InputLabel>
              <Select
                value={displayValue}
                label={label}
                disabled={disabled}
                onClick={handleOpen}
                open={false} // Prevent default dropdown
                renderValue={() => displayValue || "Select time"}
                sx={{ minWidth: 200 }}
              >
                {/* Empty MenuItem to prevent console warnings */}
                <MenuItem value="" style={{ display: "none" }} />
              </Select>
              {error && <FormHelperText>{error.message}</FormHelperText>}
            </FormControl>

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                sx: {
                  p: 2,
                  minWidth: 300,
                  maxHeight: 400,
                },
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Select {label}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" gutterBottom>
                    Hour
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                    {hours.map((hour) => (
                      <MenuItem
                        key={hour}
                        selected={tempHour === hour}
                        onClick={() => handleHourSelect(hour)}
                        sx={{
                          minHeight: 36,
                          justifyContent: "center",
                          fontWeight: tempHour === hour ? "bold" : "normal",
                        }}
                      >
                        {hour.toString().padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" gutterBottom>
                    Minute
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                    {minutes.map((minute) => (
                      <MenuItem
                        key={minute}
                        selected={tempMinute === minute}
                        onClick={() => handleMinuteSelect(minute)}
                        sx={{
                          minHeight: 36,
                          justifyContent: "center",
                          fontWeight: tempMinute === minute ? "bold" : "normal",
                        }}
                      >
                        {minute.toString().padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Popover>
          </Box>
        );
      }}
    />
  );
}
