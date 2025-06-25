import AddIcon from "@mui/icons-material/Add";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import HomeIcon from "@mui/icons-material/Home";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";

const NavMenu = ({ admin }: any) => {
  const router = useRouter();

  return (
    <Paper>
      <MenuList>
        {admin
          ? [
              <MenuItem key="admin-home" onClick={() => router.push("/admin")}>
                <ListItemIcon sx={{ fontSize: "1.5rem" }}>
                  <HomeIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "1.3rem",
                    color: "primary.main",
                  }}
                >
                  Home
                </ListItemText>
              </MenuItem>,
              <MenuItem
                key="admin-room"
                onClick={() => router.push("/admin/room")}
              >
                <ListItemIcon sx={{ fontSize: "1.5rem" }}>
                  <MeetingRoomIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "1.3rem",
                    color: "primary.main",
                  }}
                >
                  Rooms
                </ListItemText>
              </MenuItem>,
            ]
          : [
              <MenuItem
                key="user-home"
                onClick={() => router.push("/dashboard")}
              >
                <ListItemIcon sx={{ fontSize: "1.5rem" }}>
                  <HomeIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "1.3rem",
                    color: "primary.main",
                  }}
                >
                  Home
                </ListItemText>
              </MenuItem>,
              <MenuItem
                key="user-booklist"
                onClick={() => router.push("/dashboard/booklist")}
              >
                <ListItemIcon sx={{ fontSize: "1.5rem" }}>
                  <BookmarkIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "1.3rem",
                    color: "primary.main",
                  }}
                >
                  My Book List
                </ListItemText>
              </MenuItem>,
              <MenuItem
                key="user-room"
                divider
                onClick={() => router.push("/dashboard/room")}
              >
                <ListItemIcon sx={{ fontSize: "1.5rem" }}>
                  <MeetingRoomIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "1.3rem",
                    color: "primary.main",
                  }}
                >
                  Rooms
                </ListItemText>
              </MenuItem>,
              <MenuItem
                key="user-book"
                onClick={() => router.push("/dashboard/book")}
              >
                <ListItemIcon sx={{ fontSize: "1.5rem" }}>
                  <AddIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "1.3rem",
                    color: "primary.main",
                  }}
                >
                  New Book
                </ListItemText>
              </MenuItem>,
            ]}
      </MenuList>
    </Paper>
  );
};
export default NavMenu;
