import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PlaceIcon from "@mui/icons-material/Place";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { Badge, Box, Button, Chip, Typography } from "@mui/material";
import Image from "next/image";

interface RoomInfo {
  id: string;
  name: string;
  capacity: number;
  location: string;
  facility: Array<string>;
  image: string;
  isVirtual?: boolean;
  zoomLink?: string;
  zoomMeetingId?: string;
  zoomPasscode?: string;
}

interface RoomData {
  id: string;
  id_ruangan: string;
  nama: string;
  kapasitas: string;
  lokasi: string;
  image: string;
  fasilitas: Array<string>;
  is_virtual?: string;
  zoom_link?: string;
  zoom_meeting_id?: string;
  zoom_passcode?: string;
}

interface CardProp {
  roomInfo: RoomInfo;
  selectedId: string;
  clickCard: (id: string) => void;
  error: boolean;
}

export const CardRoom = ({ roomInfo, selectedId, clickCard, error }: CardProp) => {
  function onClickCard(id: string) {
    clickCard(id);
  }
  return (
    <Badge
      badgeContent={<CheckBadgeIcon className="h-8 w-8 p-0" />}
      color="primary"
      invisible={!(roomInfo.id === selectedId)}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      sx={{
        width: "100%",
        "& .MuiBadge-badge": {
          border: `4px solid #202020`,
          right: 10,
          top: 10,
          height: 40,
          width: 40,
        },
      }}
    >
      <Button
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          justifyContent: "start",
          width: "100%",
          height: "280px", // Reduced height for more compact cards
          p: 0,
          ...(roomInfo.id === selectedId && {
            borderWidth: "4px",
            borderStyle: "solid",
            borderColor: "primary.main",
          }),
          ...(error && {
            borderWidth: "4px",
            borderStyle: "solid",
            borderColor: "error.main",
          }),
        }}
        onClick={() => onClickCard(roomInfo.id)}
        variant="contained"
        color="warning"
      >
        {/* Fixed Image Section */}
        <Box sx={{ width: "100%", height: "120px", flexShrink: 0 }}>
          <Image
            src={roomInfo.image}
            alt="Room Image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "0.75rem 0.75rem 0 0",
            }}
            width={300}
            height={160}
          />
        </Box>

        {/* Content Section - Fixed Height with Flex Layout */}
        <Box
          sx={{
            px: 16,
            py: 8,
            textAlign: "left",
            height: "160px", // Reduced content height
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Header Section with Name and Badge */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
              minHeight: "32px", // Reduced header height
              gap: 2, // Add gap between name and badge
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                flex: 1,
                mr: 1, // Add margin to create space before badge
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.2,
              }}
            >
              {roomInfo.name}
            </Typography>
            {roomInfo.isVirtual && (
              <Chip
                icon={<VideoCallIcon />}
                label="Virtual"
                size="small"
                color="primary"
                variant="filled"
                sx={{ flexShrink: 0 }} // Prevent badge from shrinking
              />
            )}
          </Box>

          {/* Room Details Section */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PeopleAltIcon fontSize="small" />
              <Typography variant="body2">{roomInfo.capacity} people</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PlaceIcon fontSize="small" />
              <Typography
                variant="body2"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {roomInfo.isVirtual ? "Online" : roomInfo.location}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Button>
    </Badge>
  );
};

export const CardRooms = ({
  selectedId,
  clickCard,
  filterId,
  errorData,
}: {
  selectedId: string;
  clickCard: (id: string) => void;
  filterId?: any;
  errorData: boolean;
}) => {
  const roomData: Array<RoomInfo> =
    filterId
      ?.sort((a: any, b: any) => a.kapasitas - b.kapasitas)
      .map((item: RoomData) => {
        return {
          id: item.id_ruangan,
          name: item.nama,
          capacity: item.kapasitas,
          location: item.lokasi,
          facility: item.fasilitas || [],
          image: item.image,
          isVirtual: item.is_virtual === "T",
          zoomLink: item.zoom_link,
          zoomMeetingId: item.zoom_meeting_id,
          zoomPasscode: item.zoom_passcode,
        };
      }) || [];

  return (
    <Box
      sx={{
        display: "flex",
        overflowX: "auto",
        gap: 2,
        py: 2,
        px: 1,
        // Enable smooth scrolling
        scrollBehavior: "smooth",
        // Hide scrollbar on webkit browsers (Safari, Chrome)
        "&::-webkit-scrollbar": {
          height: 8,
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "grey.200",
          borderRadius: 1,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "grey.400",
          borderRadius: 1,
          "&:hover": {
            backgroundColor: "grey.500",
          },
        },
        // For Firefox
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(0,0,0,0.3) rgba(0,0,0,0.1)",
      }}
    >
      {roomData?.map((item) => (
        <Box
          key={item.id}
          sx={{
            minWidth: "320px", // Slightly increased width for better spacing
            maxWidth: "320px",
            height: "320px", // Reduced height to match new card height + badge space
            pt: 18,
            pb: 16,
            pr: 16,
            display: "flex",
            alignItems: "stretch", // Ensures cards stretch to full height
          }}
        >
          <CardRoom roomInfo={item} selectedId={selectedId} clickCard={clickCard} error={errorData} />
        </Box>
      ))}
    </Box>
  );
};
