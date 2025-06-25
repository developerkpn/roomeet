import axios from "@/lib/axios";
import { useAuthStore } from "@/lib/store/auth";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  anchorEl: HTMLButtonElement | null;
  handleClose: () => void;
}

export default function UserMenu({ anchorEl, handleClose }: UserMenuProps) {
  const user = useAuthStore((state: any) => state.user);
  const clearAuth = useAuthStore((state: any) => state.clearAuth);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/user/logout", {}, { withCredentials: true });
    } catch {}
    clearAuth();
    router.replace("/login");
  };

  return (
    <Menu
      id="avatar-appbar"
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 30, horizontal: -120 }}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      keepMounted
    >
      <MenuItem sx={{ width: "10rem" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <IconButton>
            <Avatar>{user?.username?.slice(0, 2).toUpperCase()}</Avatar>
          </IconButton>
          <Typography>{user?.name?.split(" ")[0]}</Typography>
        </Box>
      </MenuItem>
      <MenuItem
        onClick={() =>
          "Notification" in window && Notification.requestPermission()
        }
      >
        Notif Settings
      </MenuItem>
      <MenuItem onClick={handleLogout} sx={{ width: "10rem" }}>
        Logout
      </MenuItem>
      {/* <MenuItem onClick={handleUserInfo} sx={{ width: '10rem' }}>
          Edit User Info
        </MenuItem> */}
    </Menu>
  );
}
