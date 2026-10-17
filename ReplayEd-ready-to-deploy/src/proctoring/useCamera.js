import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useCamera Hook
 *
 * Manages webcam lifecycle for local proctoring:
 * - Requests 640x480 video stream via navigator.mediaDevices.getUserMedia
 * - Tracks permission states: 'idle' | 'asking' | 'granted' | 'denied' | 'error'
 * - Cleans up active tracks on unmount or explicit stop
 * - Respects VITE_REQUIRE_CAMERA configuration flag
 */
export function useCamera() {
  const [stream, setStream] = useState(null);
  const [permissionState, setPermissionState] = useState('idle'); // idle | asking | granted | denied | error
  const [error, setError] = useState(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);

  const requireCamera = import.meta.env.VITE_REQUIRE_CAMERA !== 'false';

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
      streamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const requestCamera = useCallback(async () => {
    // Check browser mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState('error');
      setError('Camera API is not supported in this browser. Please use Google Chrome.');
      return null;
    }

    setPermissionState('asking');
    setError(null);

    try {
      // Clean up any existing stream before requesting a fresh one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false, // Video-only; audio handled separately if needed
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionState('granted');
      setError(null);

      // Attach stream to videoRef if element already mounted
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }

      return mediaStream;
    } catch (err) {
      console.warn('[useCamera] getUserMedia failed:', err.name, err.message);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setError('Camera access was denied. Please allow camera permissions in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionState('error');
        setError('No camera device detected on this system. Please connect a webcam.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setPermissionState('error');
        setError('Camera is currently in use by another application. Please close other apps and retry.');
      } else {
        setPermissionState('error');
        setError(`Unable to access camera: ${err.message || 'Unknown error'}`);
      }
      return null;
    }
  }, []);

  // Cleanup all tracks on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    stream,
    permissionState,
    error,
    videoRef,
    requestCamera,
    stopCamera,
    requireCamera,
  };
}
