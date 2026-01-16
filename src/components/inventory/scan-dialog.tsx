
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { scanItem, type ScanItemOutput } from '@/ai/flows/scan-item-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, ScanLine, RefreshCcw, Video } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (data: ScanItemOutput) => void;
}

export function ScanDialog({ open, onOpenChange, onScanSuccess }: ScanDialogProps) {
  const isMobile = useIsMobile();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (!open || imagePreview) return;
  
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera not supported");
        setHasCameraPermission(false);
        return;
      }
  
      setHasCameraPermission(null);
  
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCameraPermission(true);
        } else {
          cleanupCamera();
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
      }
    };
  
    if (open) {
      startCamera();
    } else {
      cleanupCamera();
    }
  
    return () => {
      cleanupCamera();
    };
  }, [open, imagePreview, cleanupCamera]);


  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setImagePreview(dataUrl);
        cleanupCamera(); // Turn off camera after capture
      }
    }
  };
  
  const handleRetake = () => {
    setImagePreview(null);
    setLoading(false);
  };


  const handleScan = async () => {
    if (!imagePreview) return;
    setLoading(true);
    try {
      const result = await scanItem({ photoDataUri: imagePreview });
      onScanSuccess(result);
      handleOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: 'Could not extract item details. Please try again or add manually.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setImagePreview(null);
      setLoading(false);
      setHasCameraPermission(null);
      cleanupCamera();
    }
    onOpenChange(isOpen);
  }

  const DialogComponent = isMobile ? Sheet : Dialog;
  const DialogContentComponent = isMobile ? SheetContent : DialogContent;
  const HeaderComponent = isMobile ? SheetHeader : DialogHeader;
  const TitleComponent = isMobile ? SheetTitle : DialogTitle;
  const DescriptionComponent = isMobile ? SheetDescription : DialogDescription;
  const FooterComponent = isMobile ? SheetFooter : DialogFooter;


  const content = (
    <>
      <div className="flex justify-center items-center h-64 border-2 border-dashed border-muted rounded-lg bg-card overflow-hidden relative">
        <canvas ref={canvasRef} className="hidden"></canvas>
        {imagePreview ? (
          <img src={imagePreview} alt="Item preview" className="h-full w-full object-contain" />
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {hasCameraPermission !== true && (
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-muted-foreground bg-card/80 p-4">
                  {hasCameraPermission === null ? (
                    <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                  ) : (
                    <>
                      <Video className="mx-auto h-12 w-12" />
                      <p className="mt-2 font-semibold">Camera Access Required</p>
                      <p className="text-sm">Please allow camera access to use this feature.</p>
                    </>
                  )}
                </div>
            )}
          </>
        )}
      </div>
      {hasCameraPermission === false && open && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Camera Access Denied</AlertTitle>
            <AlertDescription>
              Please enable camera permissions in your browser settings to use this feature.
            </AlertDescription>
          </Alert>
      )}
    </>
  );

  const footerContent = (
      <div className={cn("grid gap-2 w-full", imagePreview ? "grid-cols-2" : "grid-cols-1")}>
          {imagePreview ? (
            <>
              <Button variant="outline" onClick={handleRetake} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button onClick={handleScan} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                {loading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </>
          ) : (
             <Button onClick={handleCapture} disabled={hasCameraPermission !== true}>
               <Camera className="mr-2 h-4 w-4" />
               Capture
             </Button>
          )}
      </div>
  );


  return (
    <DialogComponent open={open} onOpenChange={handleOpenChange}>
      <DialogContentComponent className={cn(isMobile ? 'flex flex-col' : 'sm:max-w-md', 'bg-card')}>
        <HeaderComponent>
          <TitleComponent className="font-headline">Scan with AI</TitleComponent>
          <DescriptionComponent>
            {imagePreview ? 'Review the captured image or retake.' : 'Point your camera at the item and capture an image.'}
          </DescriptionComponent>
        </HeaderComponent>
        <div className={cn(isMobile ? 'flex-grow flex flex-col justify-center' : 'mt-4')}>
          {content}
        </div>
        <FooterComponent className={cn(isMobile ? 'mt-auto' : 'sm:justify-between pt-4')}>
          {footerContent}
        </FooterComponent>
      </DialogContentComponent>
    </DialogComponent>
  );
}
