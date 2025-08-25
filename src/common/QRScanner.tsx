"use client";

import { Close, QrCodeScanner } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import QrScanner from "qr-scanner";
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
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const showScanner = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setCameraError(null);
    stopCamera();
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    console.log("Starting QR scanner...");

    try {
      // Check if QrScanner is available
      if (typeof QrScanner === "undefined") {
        throw new Error("QrScanner library not loaded");
      }

      // Check browser compatibility first
      if (!QrScanner.hasCamera()) {
        throw new Error("No camera available on this device");
      }

      // First set isScanning to true to render the video element
      setIsScanning(true);

      // Wait for the video element to be rendered
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("Video element ref:", videoRef.current);

      if (!videoRef.current) {
        throw new Error("Video element not found after rendering");
      }

      if (qrScannerRef.current) {
        console.log("QR Scanner already exists, stopping it first");
        await qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }

      console.log("Creating new QR scanner instance...");

      // Initialize QR scanner - it will handle camera access internally
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanResult(result.data);
        },
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
        }
      );

      console.log("QR scanner instance created, checking cameras...");
      const cameras = await QrScanner.listCameras(true);
      console.log("Available cameras:", cameras);

      console.log("Starting QR scanner...");
      await qrScannerRef.current.start();
      console.log("QR Scanner started successfully");

      toast("Camera started! Point at QR code", {
        icon: "📷",
      });
    } catch (error: any) {
      console.error("QR Scanner error:", error);
      console.error("Error stack:", error.stack);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
      });

      let errorMessage = "Camera access failed";

      if (error.name === "NotAllowedError") {
        errorMessage = "Camera permission denied. Please allow camera access and try again.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "No camera found on this device.";
      } else if (error.name === "NotSupportedError") {
        errorMessage = "Camera not supported by this browser.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setCameraError(errorMessage);
      toast.error(errorMessage);
      setIsScanning(false);
    }
  };

  const handleScanResult = (roomId: string) => {
    onScan(roomId);
    handleClose();
  };

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
          <Box display="flex" justifyContent="space-between" alignItems="center">
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                <Button variant="outlined" startIcon={<QrCodeScanner />} onClick={startCamera} size="large" fullWidth>
                  Start Camera Scanner
                </Button>
              </Box>
            ) : (
              <Box>
                <Box sx={{ position: "relative", display: "inline-block" }}>
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
                  {isScanning && (
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: "white",
                        bgcolor: "rgba(0,0,0,0.7)",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      Scanning for QR codes...
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {cameraError && (
              <Typography variant="body2" color="error" sx={{ mt: 1, p: 1, bgcolor: "error.light", borderRadius: 1 }}>
                {cameraError}
              </Typography>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary">
            {isScanning
              ? "The scanner will automatically detect QR codes when they appear in the camera view."
              : "Point the camera at a QR code to scan it."}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QRScanner;
