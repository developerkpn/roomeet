"use client";

import ConfirmationDialog from "@/common/ConfirmationDialog";
import DatePickerComp from "@/common/DatePicker";
import NumericFieldComp from "@/common/NumericField";
import RadioComp from "@/common/Radio";
import { CardsBookSkeleton } from "@/common/skeletons/CardSkeleton";
import { TextFieldComp } from "@/common/TextField";
import TimePickerComp from "@/common/TimePicker";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Grid,
  Radio,
  TextField,
  Typography,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { format } from "date-fns";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CardRooms } from "./CardRoom";

interface DefaultVal {
  dateBook: Date;
  startTime: Date | null | undefined;
  endTime: Date | null | undefined;
  capacity: string;
  ruangan: string;
  agenda: string;
  remark: string;
  category: string;
  hour: number | undefined;
  minute: number | undefined;
  isVirtual: string;
}

interface Room {
  id_ruangan: string;
  nama: string;
  kapasitas: number;
  is_virtual?: string;
  zoom_link?: string;
  zoom_meeting_id?: string;
  zoom_passcode?: string;
}

interface BookingData {
  id_book: string;
  id_ruangan: string;
  id_user: string;
  book_date: string;
  time_start: string;
  time_end: string;
  agenda: string;
  prtcpt_ctr: number;
  remark?: string;
  category: string;
  approval: string;
  is_active: string;
  nama_ruangan: string;
  image: string;
  lokasi: string;
  kapasitas: number;
  is_virtual?: string;
  zoom_link?: string;
  zoom_meeting_id?: string;
  zoom_passcode?: string;
}

interface AvailabilityResponse {
  message: string;
  data: Room[];
}

export default function BookFormSingle({
  editData,
}: {
  editData: BookingData | undefined;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const axiosAuth = useAxiosAuth();
  const form = useForm({
    mode: "onChange",
    defaultValues: {
      dateBook: new Date(),
      startTime: null,
      endTime: null,
      capacity: "",
      ruangan: "",
      agenda: "",
      remark: "",
      category: "",
      hour: 0,
      minute: 0,
      isVirtual: "false",
    } as DefaultVal,
  });

  const handleSubmit = form.handleSubmit;
  const register = form.register;
  const setValue = form.setValue;
  const formState = form.formState;

  const [roomId, setRoomid] = useState<string>("");
  const [endTime, setEndTime] = useState<Date | null | undefined>();
  const [startTime, setStartTime] = useState<Date | null | undefined>();
  const [hour, setHour] = useState<number>(0);
  const [minute, setMinute] = useState<number>(0);
  const [available, setAvailable] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(!!editData);
  const [changed, setChanged] = useState(true);
  const [penalty, setPenalty] = useState<string | undefined>();
  const [isVirtual, setIsVirtual] = useState(false);

  useEffect(() => {
    const checkPenalty = async () => {
      try {
        const res = await axiosAuth.patch("/user/penalty", {
          id_user: user?.id_user,
        });
        if (res.data.changed) {
          toast.success(res.data.message);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const data = error.response?.data as { message: string };
          setPenalty(data.message);
        } else {
          console.error(error);
        }
      }
    };
    checkPenalty();

    if (isEdit && editData) {
      form.reset({
        dateBook: moment(editData.book_date).toDate(),
        startTime: moment(editData.time_start, "HH:mm").toDate(),
        endTime: moment(editData.time_end, "HH:mm").toDate(),
        capacity: editData.prtcpt_ctr.toString(),
        ruangan: "",
        agenda: editData.agenda,
        remark: editData.remark || "",
        category: editData.category || "",
        isVirtual: editData.is_virtual === "T" ? "true" : "false",
      });

      // Set the virtual room state as well
      setIsVirtual(editData.is_virtual === "T");

      setStartTime(moment(editData.time_start, "HH:mm").toDate());
      setEndTime(moment(editData.time_end, "HH:mm").toDate());

      const tempHour = moment(editData.time_end, "HH:mm").diff(
        moment(editData.time_start, "HH:mm"),
        "hours"
      );
      const tempMinute =
        moment(editData.time_end, "HH:mm").diff(
          moment(editData.time_start, "HH:mm"),
          "minutes"
        ) % 60;

      setHour(tempHour);
      setMinute(tempMinute);

      // For edit mode, don't show rooms initially
      setAvailable(false);
      setChanged(true);
    }
    // console.log(form.getValues());
  }, [editData, form, isEdit, axiosAuth, user?.id_user]);

  console.log("edit data", editData);
  console.log("isEdit", isEdit);
  console.log("formatted edit", form.getValues());

  const selectRoom = (idRoom: string) => {
    setRoomid(idRoom);
    setValue("ruangan", idRoom);
    form.clearErrors("ruangan");
  };

  const onSubmit = async (values: DefaultVal) => {
    setLoading(true);
    const payload = {
      id_ruangan: values.ruangan,
      id_user: user?.id_user,
      book_date: format(values.dateBook, "Y-L-d"),
      time_start: format(values.startTime as Date, "HH:mm"),
      time_end: format(values.endTime as Date, "HH:mm"),
      agenda: values.agenda,
      participant: Number(values.capacity) || 0,
      category: values.category,
      remark: values.remark,
    };
    console.log(payload);
    try {
      const res = !isEdit
        ? await axiosAuth.post("/book", { data: payload })
        : await axiosAuth.patch(`/book/${editData?.id_book}`, {
            data: payload,
          });
      toast.success("Don't forget to check in on the starting time!");
      router.replace(`/dashboard/book/success/${res.data.id_ticket}`);
    } catch (error) {
      const errors = error as AxiosError;
      if (axios.isAxiosError(error)) {
        const data = errors.response?.data as { message: string };
        toast.error(data.message);
      } else {
        toast.error("error");
      }
      console.error(error);
      setLoading(false);
    }
  };

  const checkAvail = async (values: DefaultVal) => {
    setChanged(false);
    setRoomid("");
    form.setValue("ruangan", "");
    form.setValue("hour", hour);
    form.setValue("minute", minute);
    const valid = await form.trigger([
      "dateBook",
      "startTime",
      "endTime",
      "capacity",
      "category",
      "hour",
      "minute",
    ]);
    // console.log(hour, minute);

    // console.log(form.getValues());

    if (valid) {
      const payload = {
        book_date: format(values.dateBook as Date, "Y-L-d"),
        time_start: format(values.startTime as Date, "HH:mm"),
        time_end: format(values.endTime as Date, "HH:mm"),
        participant: Number(values.capacity) || 0,
        category: values.category,
        id_book: editData?.id_book || "",
        is_virtual: values.isVirtual === "true",
      };
      console.log(payload);

      try {
        const res = await axiosAuth.post("/room/search-avail", {
          data: payload,
        });
        if (res.data.data.length === 0) {
          toast.error("Ruangan tidak tersedia");
        } else {
          toast.success(res.data.message);
          setAvailable(true);
          const tempRooms = res.data.data;
          setRooms(tempRooms);
          console.log(tempRooms);

          // In edit mode, automatically select the current room if available
          if (isEdit && editData && editData.id_ruangan) {
            const currentRoom = tempRooms.find(
              (room: Room) => room.id_ruangan === editData.id_ruangan
            );
            if (currentRoom) {
              setRoomid(editData.id_ruangan);
              form.setValue("ruangan", editData.id_ruangan);
              form.clearErrors("ruangan");
              console.log("Auto-selected current room:", editData.id_ruangan);
            }
          }
        }
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
    }
  };

  return (
    <>
      <Typography variant="h1" sx={{ color: "primary.light" }}>
        {isEdit ? "Edit Book" : "Add New Book"}
      </Typography>
      <form>
        <Grid container spacing={16}>
          <Grid item xs={12} md={6}>
            {penalty && <Alert severity="error">{penalty}</Alert>}
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 8, py: 24 }}
            >
              <DatePickerComp
                name="dateBook"
                label="Booking Date"
                control={form.control}
                rules={{
                  required: "Field required",
                  validate: {
                    minDate: (value: any) =>
                      new Date(value).setHours(0, 0, 0, 0) >=
                        new Date().setHours(0, 0, 0, 0) ||
                      "Booking date can't be in the past",
                    max30Days: (value: any) => {
                      const diffDays = moment(value).diff(moment(), "days");
                      if (diffDays > 30) {
                        return "Date must be within 30 days from today";
                      }
                    },
                  },
                }}
                onChange={(value: any) => {
                  setChanged(true);
                  form.setValue("dateBook", value);
                  // Re-validate start time when date changes
                  form.trigger("startTime");
                }}
              />
              <Box sx={{ display: "flex", gap: 8 }}>
                <TimePickerComp
                  name="startTime"
                  label="Start Time"
                  control={form.control}
                  rules={{
                    required: "Field required",
                    validate: {
                      notInPast: (value: any) => {
                        if (!value) return true; // Allow empty for now, required validation will handle it

                        const selectedDate = form.getValues("dateBook");
                        const now = new Date();

                        // If booking date is today, check if time is in the past
                        if (
                          selectedDate &&
                          new Date(selectedDate).setHours(0, 0, 0, 0) ===
                            now.setHours(0, 0, 0, 0)
                        ) {
                          const selectedDateTime = new Date(value);
                          const currentTime = new Date();

                          return (
                            selectedDateTime >= currentTime ||
                            "Start time can't be in the past"
                          );
                        }

                        return true; // Future dates are always valid
                      },
                    },
                  }}
                  onChangeOvr={(value) => {
                    const tempStartTime = value;
                    const tempHour = moment(endTime).diff(
                      moment(value),
                      "hours"
                    );
                    const tempMinute =
                      moment(endTime).diff(moment(value), "minutes") % 60;

                    setStartTime(tempStartTime);
                    setHour(tempHour);
                    setMinute(tempMinute);
                    setChanged(true);
                  }}
                />
                <TimePickerComp
                  name="endTime"
                  label="End Time"
                  control={form.control}
                  rules={{
                    required: "Field required",
                  }}
                  onChangeOvr={(value) => {
                    const tempEndTime = value;
                    const tempHour = moment(value).diff(
                      moment(startTime),
                      "hours"
                    );
                    const tempMinute =
                      moment(value).diff(moment(startTime), "minutes") % 60;

                    setEndTime(tempEndTime);
                    setHour(tempHour);
                    setMinute(tempMinute);
                    setChanged(true);
                  }}
                />
                <input {...register("ruangan")} hidden={true} />
              </Box>
              <Box sx={{ display: "flex", gap: 8 }}>
                <Box sx={{ display: "flex", gap: 8 }}>
                  <TextField
                    disabled
                    type="number"
                    value={hour}
                    label="Hour"
                    variant="outlined"
                    error={!!formState.errors.hour}
                    helperText={
                      formState.errors.hour ? formState.errors.hour.message : ""
                    }
                    {...register("hour", {
                      min: {
                        value: 0,
                        message: "Duration error",
                      },
                    })}
                  />
                  <TextField
                    disabled
                    type="number"
                    value={minute}
                    label="Minute"
                    variant="outlined"
                    error={!!formState.errors.minute}
                    helperText={
                      formState.errors.minute
                        ? formState.errors.minute.message
                        : ""
                    }
                    {...register("minute", {
                      validate: {
                        minimum: (value: any) => {
                          if (form.getValues("hour") === 0) {
                            return value > 0 || "Duration error";
                          } else {
                            return value >= 0 || "Duration error";
                          }
                        },
                      },
                    })}
                  />
                </Box>
                <NumericFieldComp
                  control={form.control}
                  name="capacity"
                  label="Capacity"
                  type="string"
                  min={1}
                  max={100}
                  rules={{
                    required: "Insert capacity",
                    validate: {
                      minValue: (value: string) => {
                        const num = Number(value);
                        return num >= 1 || "Minimum value 1";
                      },
                      maxValue: (value: string) => {
                        const num = Number(value);
                        return num <= 100 || "Maximum value 100";
                      },
                      isNumber: (value: string) => {
                        return (
                          !isNaN(Number(value)) || "Must be a valid number"
                        );
                      },
                    },
                  }}
                  onChangeOvr={() => setChanged(true)}
                />
                <input
                  {...register("ruangan", { required: "Please input" })}
                  hidden={true}
                />
              </Box>
              <RadioComp
                name="category"
                label="Category"
                rules={{ required: "Select category" }}
                control={form.control}
                onChangeOvr={() => setChanged(true)}
              >
                <FormControlLabel
                  value="INT"
                  control={<Radio />}
                  label="Internal"
                />
                <FormControlLabel
                  value="EXT"
                  control={<Radio />}
                  label="External"
                />
              </RadioComp>
              <RadioComp
                name="isVirtual"
                label="Room Type"
                rules={{ required: "Select room type" }}
                control={form.control}
                onChangeOvr={(value: any) => {
                  setIsVirtual(value === "true");
                  setChanged(true);
                }}
              >
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="Physical Room"
                />
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="Virtual Room (Zoom)"
                />
              </RadioComp>
              <Button
                variant="outlined"
                onClick={() => checkAvail(form.getValues())}
                disabled={!!penalty}
              >
                Check Available Room
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            {available ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  py: 24,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>Rooms:</Typography>
                  {isEdit && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setAvailable(false);
                        setChanged(true);
                        setRoomid("");
                        form.setValue("ruangan", "");
                      }}
                      sx={{ mb: 1 }}
                    >
                      ← Back to Form
                    </Button>
                  )}
                </Box>
                <Suspense fallback={<CardsBookSkeleton />}>
                  <CardRooms
                    selectedId={roomId}
                    clickCard={selectRoom}
                    errorData={!!formState.errors?.ruangan}
                    filterId={rooms}
                  />
                </Suspense>
                <TextFieldComp
                  control={form.control}
                  name="agenda"
                  label="Agenda"
                  rules={{
                    required: "Field required",
                    maxLength: {
                      value: 26,
                      message: "Maximum character is 26",
                    },
                  }}
                />
                <TextFieldComp
                  multiline={true}
                  rows={5}
                  control={form.control}
                  name="remark"
                  label="Remark"
                />
                {loading ? (
                  <Button type="submit" variant="contained" disabled>
                    Loading...
                  </Button>
                ) : (
                  <>
                    <ConfirmationDialog
                      title={isEdit ? "Update Booking" : "Submit Book"}
                      desc={
                        isEdit
                          ? "Are you sure you want to update this booking?"
                          : "Are you sure you want to submit?"
                      }
                      action={isEdit ? "Update" : "Submit"}
                      response={handleSubmit(onSubmit)}
                      type="submit"
                    >
                      {(showDialog: any) => (
                        <Button
                          onClick={async () => {
                            const valid = await form.trigger();
                            if (valid) {
                              showDialog();
                            }
                          }}
                          variant="contained"
                          disabled={changed}
                        >
                          {changed
                            ? "Please check room"
                            : isEdit
                            ? "Update Booking"
                            : "Submit"}
                        </Button>
                      )}
                    </ConfirmationDialog>
                  </>
                )}
              </Box>
            ) : (
              <Box sx={{ py: 24 }}>
                {isEdit && editData && editData.nama_ruangan ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "primary.main", mb: 2 }}
                    >
                      Currently Booked Room
                    </Typography>
                    <Box
                      sx={{
                        border: 2,
                        borderColor: "primary.main",
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: 3,
                      }}
                    >
                      {/* Room Image */}
                      {editData.image && (
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: 200,
                          }}
                        >
                          <Image
                            src={editData.image}
                            alt={editData.nama_ruangan}
                            fill
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      )}

                      {/* Room Details */}
                      <Box sx={{ p: 3, mt: 5 }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: "bold",
                            mb: 2,
                            color: "primary.main",
                          }}
                        >
                          {editData.nama_ruangan}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>📍 Location: {editData.lokasi}</span>
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <span>
                              👥 Capacity: {editData.kapasitas} people
                            </span>
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "grey.300",
                        fontStyle: "italic",
                        mt: 2,
                        textAlign: "center",
                      }}
                    >
                      This is your currently booked room. Click &quot;Check
                      Available Room&quot; below to see other options if you
                      want to change your room.
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ color: "grey.500", textAlign: "center" }}>
                    Please check available room first
                  </Typography>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </form>
    </>
  );
}
