import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * Custom hook to encapsulate QR scanner initialization and cleanup.
 * Uses html5-qrcode for reliable browser-based QR scanning.
 *
 * @param {string} elementId - The ID of the DOM element to render the scanner into.
 * @param {function} onScanSuccess - Callback when a QR code is successfully decoded.
 * @returns {{ isScanning, startScanner, stopScanner, error, cameraAvailable }}
 */
const useQRScanner = (elementId, onScanSuccess) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);

  // Check camera availability on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameraAvailable(devices && devices.length > 0);
      })
      .catch(() => {
        setCameraAvailable(false);
      });
  }, []);

  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;
    setError(null);

    try {
      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          // Stop after first successful scan
          html5QrCode
            .stop()
            .then(() => {
              scannerRef.current = null;
              setIsScanning(false);
            })
            .catch(console.error);
        },
        () => {
          // QR code not detected in this frame — ignore
        }
      );

      setIsScanning(true);
    } catch (err) {
      setError(err?.message || 'Failed to start camera');
      setCameraAvailable(false);
      scannerRef.current = null;
    }
  }, [elementId, onScanSuccess]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Already stopped
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return { isScanning, startScanner, stopScanner, error, cameraAvailable };
};

export default useQRScanner;
