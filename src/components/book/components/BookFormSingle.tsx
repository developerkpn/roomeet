"use client";

import ConfirmationDialog from "@/common/ConfirmationDialog";
import DatePickerComp from "@/common/DatePicker";
import NumericFieldComp from "@/common/NumericField";
import RadioComp from "@/common/Radio";
import { CardsBookSkeleton } from "@/common/skeletons/CardSkeleton";
import { TextFieldComp } from "@/common/TextField";
import TimePickerComp from "@/common/TimePicker";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useAuthStore } from "@/lib/store/auth";
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
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { CardRooms } from "./CardRoom";

interface DefaultVal {
  dateBook: Date;
  startTime: Date | null | undefined;
  endTime: Date | null | undefined;
  capacity: number;
  ruangan: string;
  agenda: string;
  remark: string;
  category: string;
  hour: number | undefined;
  minute: number | undefined;
}

export default function BookFormSingle({ editData }: { editData: any }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const axiosAuth = useAxiosAuth();
  const form = useForm({
    mode: "onChange",
    defaultValues: {
      dateBook: new Date(),
      startTime: null,
      endTime: null,
      capacity: 0,
      ruangan: "",
      agenda: "",
      remark: "",
      category: "",
      hour: 0,
      minute: 0,
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
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(!!editData);
  const [changed, setChanged] = useState(true);
  const [penalty, setPenalty] = useState();

  useEffect(() => {
    const checkPenalty = async () => {
      try {
        const res = await axiosAuth.patch("/user/penalty", {
          id_user: user?.id_user,
        });
        if (res.data.changed) {
          toast.success(res.data.message);
        }
      } catch (error: any) {
        if (error?.response && user?.id_user) {
          console.error(error);
          setPenalty(error?.response.data.message);
        } else {
          console.error(error);
        }
      }
    };
    checkPenalty();

    if (isEdit) {
      form.reset({
        dateBook: moment(editData.book_date).toDate(),
        startTime: moment(editData.time_start, "hh:mm").toDate(),
        endTime: moment(editData.time_end, "hh:mm").toDate(),
        capacity: editData.prtcpt_ctr,
        ruangan: editData.id_ruangan,
        agenda: editData.agenda,
        remark: editData.remark,
        category: editData.category,
      });

      setStartTime(form.getValues("startTime"));
      setEndTime(form.getValues("endTime"));

      const tempHour = moment(form.getValues("endTime")).diff(
        moment(form.getValues("startTime")),
        "hours"
      );
      const tempMinute =
        moment(form.getValues("endTime")).diff(
          moment(form.getValues("startTime")),
          "minutes"
        ) % 60;

      setHour(tempHour);
      setMinute(tempMinute);
    }
    // console.log(form.getValues());
  }, [editData, form, isEdit, axiosAuth, user?.id_user]);

  console.log("edit data", editData);
  console.log("formatted edit", form.getValues());

  const settings = {
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    variableWidth: true,
  };

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
      participant: values.capacity,
      category: values.category,
      remark: values.remark,
    };
    console.log(payload);
    try {
      const res = !isEdit
        ? await axiosAuth.post("/book", { data: payload })
        : await axiosAuth.patch(`/book/${editData.id_book}`, { data: payload });
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
        participant: values.capacity,
        category: values.category,
        id_book: editData?.id_book,
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
                  type="number"
                  min={0}
                  max={100}
                  rules={{
                    required: "Insert capacity",
                    min: { value: 1, message: "Minimum value 1" },
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
                <Typography>Rooms:</Typography>
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
                      title="Submit Book"
                      desc="Are you sure you want to submit?"
                      action="Submit"
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
                          {changed ? "Please check room" : "Submit"}
                        </Button>
                      )}
                    </ConfirmationDialog>
                  </>
                )}
              </Box>
            ) : (
              <Typography
                sx={{ py: 24, color: "grey.500", textAlign: "center" }}
              >
                Please check available room first
              </Typography>
            )}
          </Grid>
        </Grid>
      </form>
    </>
  );
}
