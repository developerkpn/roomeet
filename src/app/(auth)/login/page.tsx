"use client";
import { PasswordWithEyes } from "@/common/PasswordWithEyes";
import { TextFieldComp } from "@/common/TextField";
import axios from "@/lib/axios";
import { useSWReg } from "@/lib/provider/SWRegProvider";
import { useAuthStore } from "@/lib/store/auth";
import {
  Box,
  Button,
  CircularProgress,
  Link as MuiLink,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface LoginInput {
  username: string;
  password: string;
}

interface Payload {
  username: string;
  password: string;
  subscription?: any;
  callbackUrl: string;
  redirect: boolean;
}

const base64ToUint8Array = (base64: any) => {
  console.log(base64);
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  console.log(b64);

  const rawData = window.atob(b64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useRouter();

  const SW = useSWReg();
  const SWReg = SW?.SWReg;
  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginUser = async (values: LoginInput) => {
    setLoading(true);
    let sub = null;
    try {
      if ("Notification" in window) {
        if (SWReg && Notification?.permission === "granted") {
          sub = await SWReg?.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64ToUint8Array(
              process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
            ),
          });
        }
      }
      let payload: any = {
        username: values.username,
        password: values.password,
        subscription: sub && JSON.stringify({ sub }),
      };
      if (payload.subscription === null) {
        delete payload.subscription;
      }
      const res = await axios.post("/user/login", payload, {
        withCredentials: true,
      });
      if (res?.status === 200 && res.data?.data) {
        setAccessToken(res.data.data.accessToken);
        setUser(res.data.data);
        if (res.data.data.role_id === process.env.NEXT_PUBLIC_USER_ID) {
          navigate.push("/dashboard");
        } else if (res.data.data.role_id === process.env.NEXT_PUBLIC_ADMIN_ID) {
          navigate.push("/admin");
        } else {
          setLoading(false);
          toast("Please try again");
        }
      } else if (res?.status === 401) {
        toast.error(res.data?.message || "Error");
        setLoading(false);
      } else {
        toast.error("❌ Failed to login");
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Server Error");
      setLoading(false);
    }
  };

  return (
    <>
      <Box>
        <Typography variant="h1" sx={{ color: "primary.light" }}>
          ROOMEET
        </Typography>
        <Typography variant="h2">Login</Typography>
      </Box>
      <Box
        component="form"
        onSubmit={handleSubmit(loginUser)}
        sx={{ width: "100%" }}
      >
        <Box sx={{ mb: 12 }}>
          <TextFieldComp
            control={control}
            label="Email / Username"
            name="username"
            rules={{ required: "Field required" }}
          />
        </Box>
        <Box sx={{ mb: 12 }}>
          <PasswordWithEyes
            control={control}
            label="Password"
            name="password"
            rules={{ required: "Field required" }}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "end" }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress /> : "Login"}
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <MuiLink href="/forgot-pass" component={Link}>
          Forgot Password?
        </MuiLink>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <MuiLink href="/register" component={Link}>
          Create Account
        </MuiLink>
      </Box>
    </>
  );
}
