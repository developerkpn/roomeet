"use client";

import MenuIcon from "@mui/icons-material/Menu";
import { Box, Fab, Popover } from "@mui/material";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavMenu from "./NavMenu";

const NavButton = ({ admin }: any) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    handleClose();
  }, [pathname]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1000,
        // Ensure it doesn't interfere with scrolling
        pointerEvents: "auto",
      }}
    >
      <Fab
        color="primary"
        aria-label="menu"
        onClick={handleClick}
        sx={{
          // Ensure proper touch target size
          width: 56,
          height: 56,
        }}
      >
        <MenuIcon />
      </Fab>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        sx={{
          zIndex: 1301, // Higher than the fab button
        }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: "80vh", // Prevent modal from being too tall
              overflow: "auto",
            },
          },
        }}
      >
        <NavMenu admin={admin} />
      </Popover>
    </Box>
  );
};

export default NavButton;
