import { Badge, Box, Button, Typography, Chip } from "@mui/material";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PlaceIcon from "@mui/icons-material/Place";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import useSWR from "swr";
import { CardsBookSkeleton } from "@/common/skeletons/CardSkeleton";
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
        <Image
          src={roomInfo.image}
          alt="Image"
          style={{
            width: "100%",
            height: "40%",
            objectFit: "cover",
            borderRadius: "0.75rem 0.75rem 0 0",
          }}
          width={100}
          height={50}
        />
        <Box sx={{ px: 16, py: 8, textAlign: "left" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: "bold" }}>
              {roomInfo.name}
            </Typography>
            {roomInfo.isVirtual && (
              <Chip
                icon={<VideoCallIcon />}
                label="Virtual"
                size="small"
                color="primary"
                variant="filled"
              />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PeopleAltIcon />
            <Typography>{roomInfo.capacity} people</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PlaceIcon />
            <Typography>{roomInfo.isVirtual ? "Online" : roomInfo.location}</Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, pt: 6 }}>
            {roomInfo.facility.map((item, idx) => (
              <Box
                sx={{
                  backgroundColor: "grey.900",
                  color: "#fafafa",
                  px: 6,
                  py: 2,
                  borderRadius: 1,
                }}
                key={idx + item}
              >
                {item}
              </Box>
            ))}
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
  const {
    data: rooms,
    error,
    isLoading,
  } = useSWR("/room/fas", { suspense: true, fallback: { "/room/fas": [] } });
  console.log(filterId);

  const roomData: Array<RoomInfo> = rooms?.data
    ?.sort((a: any, b: any) => a.kapasitas - b.kapasitas)
    .filter((item: RoomData) =>
      filterId ? filterId.some((fid: any) => fid.id_ruangan === item.id_ruangan) : true
    )
    .slice(0, 3)
    .map((item: RoomData) => {
      return {
        id: item.id_ruangan,
        name: item.nama,
        capacity: item.kapasitas,
        location: item.lokasi,
        facility: item.fasilitas,
        image: item.image,
        isVirtual: item.is_virtual === 'T',
        zoomLink: item.zoom_link,
        zoomMeetingId: item.zoom_meeting_id,
        zoomPasscode: item.zoom_passcode,
      };
    });

  return (
    <>
      {!isLoading && (
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
                minWidth: "300px", // Fixed width to ensure cards don't shrink
                maxWidth: "300px",
                pt: 18, 
                pb: 32, 
                pr: 16 
              }}
            >
              <CardRoom
                roomInfo={item}
                selectedId={selectedId}
                clickCard={clickCard}
                error={errorData}
              />
            </Box>
          ))}
        </Box>
      )}
      {isLoading && <CardsBookSkeleton />}
    </>
  );
};
