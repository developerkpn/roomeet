"use client";

import { Close, QrCodeScanner } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface QRScannerProps {
  onScan: (roomId: string) => void;
  title: string;
  actionText: string;
  children: (showScanner: () => void) => React.ReactNode;
}

const QRScanner = ({ onScan, title, actionText, children }: QRScannerProps) => {
  const [open, setOpen] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const showScanner = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setManualInput("");
    setCameraError(null);
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      // Check if navigator.mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported by this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScanning(true);
      toast("Camera started! Point at QR code or use manual input below", {
        icon: "📷",
      });
    } catch (error: any) {
      console.error("Camera error:", error);
      let errorMessage = "Camera access failed";

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Camera permission denied. Please allow camera access and try again.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on this device.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Camera not supported by this browser.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      handleClose();
    } else {
      toast.error("Please enter a room ID");
    }
  };

  const handleScanResult = (roomId: string) => {
    onScan(roomId);
    handleClose();
  };

  // Simple QR detection (in real implementation, you'd use a QR library like qr-scanner)
  const simulateQRScan = () => {
    // This is a placeholder - in real implementation you'd integrate with a QR scanning library
    toast("Point camera at QR code (or use manual input below)", {
      icon: "📷",
    });
  };

  useEffect(() => {
    if (isScanning) {
      simulateQRScan();
    }
  }, [isScanning]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <>
      {children(showScanner)}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" color="text.primary">
              {title}
            </Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            {!isScanning ? (
              <Button
                variant="outlined"
                startIcon={<QrCodeScanner />}
                onClick={startCamera}
                size="large"
                sx={{ mb: 2 }}
              >
                Scan QR Code
              </Button>
            ) : (
              <Box>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    backgroundColor: "#000",
                  }}
                />
                <Button variant="text" onClick={stopCamera} sx={{ mt: 1 }}>
                  Stop Camera
                </Button>
              </Box>
            )}

            {cameraError && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 1, p: 1, bgcolor: "error.light", borderRadius: 1 }}
              >
                {cameraError}
              </Typography>
            )}
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 2 }}
          >
            {cameraError
              ? "Enter room ID manually:"
              : "Or enter room ID manually:"}
          </Typography>

          <TextField
            fullWidth
            label="Room ID"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value.toUpperCase())}
            placeholder="e.g., ROOM001"
            size="small"
            sx={{
              mb: 2,
              "& .MuiInputBase-root": {
                bgcolor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                },
                "&.Mui-focused": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                },
              },
              "& .MuiInputLabel-root": {
                color: "text.secondary",
                fontSize: "0.875rem",
                "&.Mui-focused": {
                  color: "primary.main",
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: "primary.main",
                },
              "& .MuiInputBase-input": {
                color: "text.primary",
                fontSize: "0.875rem",
                "&::placeholder": {
                  color: "text.disabled",
                  opacity: 0.6,
                },
              },
            }}
          />

          <Typography variant="caption" color="text.secondary">
            Scan the QR code on the room door or enter the room ID manually.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleManualSubmit}
            variant="contained"
            disabled={!manualInput.trim()}
          >
            {actionText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QRScanner;
