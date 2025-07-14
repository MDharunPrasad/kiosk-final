import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Crop,
  Sun,
  Circle,
  Palette,
  Square,
  Save,
  Plus,
  Minus,
  Check
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { fabric } from 'fabric';

interface Session {
  id: string;
  name: string;
  date: string;
  type: string;
  images: string[];
  customerDetails: {
    name: string;
    location: string;
    date: string;
  };
  status: "pending" | "ready" | "completed";
  printCount?: number;
}

interface PhotoEditorProps {
  session: Session;
  onClose: () => void;
  // Accepts either (sessionId, imageIndex, dataURL) or (sessionId, imagesArray)
  onSave: (sessionId: string, arg1: number | string[], arg2?: string) => void;
  onDeleteImage?: (sessionId: string, imageIndex: number) => void;
}

export function PhotoEditor({ session, onClose, onSave, onDeleteImage }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const originalImageRef = useRef<any>(null);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<string>("select");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<string>("none");
  const [selectedBorder, setSelectedBorder] = useState<string>("none");
  const [borderWidth, setBorderWidth] = useState(10);
  const [borderColor, setBorderColor] = useState("#000000");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>(session.images);
  const [editedImages, setEditedImages] = useState<Set<number>>(new Set());
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  // Add per-image edit state
  const [imageEditStates, setImageEditStates] = useState(() => session.images.map(() => ({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    border: 'none',
    borderWidth: 10,
    borderColor: '#000000',
    frame: 'none',
  })));

  // Save current edit state before switching images
  const saveCurrentEditState = () => {
    setImageEditStates((prev) => {
      const newStates = [...prev];
      newStates[selectedImageIndex] = {
        brightness,
        contrast,
        saturation,
        border: selectedBorder,
        borderWidth,
        borderColor,
        frame: selectedFrame,
      };
      return newStates;
    });
  };

  // Restore edit state when switching images
  const restoreEditState = (index: number) => {
    const state = imageEditStates[index];
    if (!state) return;
    setBrightness(state.brightness);
    setContrast(state.contrast);
    setSaturation(state.saturation);
    setSelectedBorder(state.border);
    setBorderWidth(state.borderWidth);
    setBorderColor(state.borderColor);
    setSelectedFrame(state.frame);
  };

  // On image index change, save previous and restore new
  useEffect(() => {
    if (imageEditStates.length !== currentImages.length) {
      setImageEditStates(currentImages.map(() => ({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        border: 'none',
        borderWidth: 10,
        borderColor: '#000000',
        frame: 'none',
      })));
      return;
    }
    saveCurrentEditState();
    restoreEditState(selectedImageIndex);
    // eslint-disable-next-line
  }, [selectedImageIndex]);

  // Update edit state on each edit
  const updateEditState = (partial: Partial<typeof imageEditStates[0]>) => {
    setImageEditStates((prev) => {
      const newStates = [...prev];
      newStates[selectedImageIndex] = { ...newStates[selectedImageIndex], ...partial };
      return newStates;
    });
  };

  // Update edit functions to call updateEditState
  const applyBrightness = (value: number) => {
    setBrightness(value);
    applyImageFilter('brightness', value / 100);
    updateEditState({ brightness: value });
    if (value !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };
  const applyContrast = (value: number) => {
    setContrast(value);
    applyImageFilter('contrast', value / 100);
    updateEditState({ contrast: value });
    if (value !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };
  const applySaturation = (value: number) => {
    setSaturation(value);
    applyImageFilter('saturation', value / 100);
    updateEditState({ saturation: value });
    if (value !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };
  const applyBorder = (borderType: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded) return;

    const existingBorder = canvas.getObjects().find((obj: any) => obj.id === 'border');
    if (existingBorder) {
      canvas.remove(existingBorder);
    }

    if (borderType === 'none') {
      setSelectedBorder('none');
      canvas.renderAll();
      return;
    }

    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (!mainImage) return;

    const imageBounds = mainImage.getBoundingRect();
    let strokeDashArray: number[] = [];

    switch (borderType) {
      case 'solid':
        strokeDashArray = [];
        break;
      case 'dashed':
        strokeDashArray = [15, 15];
        break;
      case 'dotted':
        strokeDashArray = [3, 6];
        break;
      case 'double':
        strokeDashArray = [];
        break;
    }

    const border = new fabric.Rect({
      left: imageBounds.left - borderWidth/2,
      top: imageBounds.top - borderWidth/2,
      width: imageBounds.width + borderWidth,
      height: imageBounds.height + borderWidth,
      fill: 'transparent',
      stroke: borderColor,
      strokeWidth: borderWidth,
      strokeDashArray: strokeDashArray,
      selectable: false,
      id: 'border'
    });

    canvas.add(border);
    canvas.renderAll();
    setSelectedBorder(borderType);
    updateEditState({ border: borderType });
    
    // Mark image as edited
    setEditedImages(prev => new Set(prev).add(selectedImageIndex));
  };

  const applyFrame = (frameType: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded) return;

    const existingFrame = canvas.getObjects().find((obj: any) => obj.id === 'frame');
    if (existingFrame) {
      canvas.remove(existingFrame);
    }

    if (frameType === 'none') {
      setSelectedFrame('none');
      canvas.renderAll();
      return;
    }

    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (!mainImage) return;

    let frame;
    const frameSize = 20;
    const imageBounds = mainImage.getBoundingRect();

    switch (frameType) {
      case 'classic':
        frame = new fabric.Rect({
          left: imageBounds.left - frameSize,
          top: imageBounds.top - frameSize,
          width: imageBounds.width + frameSize * 2,
          height: imageBounds.height + frameSize * 2,
          fill: '#8B4513',
          stroke: '#654321',
          strokeWidth: 2,
          selectable: false,
          id: 'frame'
        });
        break;
      case 'modern':
        frame = new fabric.Rect({
          left: imageBounds.left - frameSize/2,
          top: imageBounds.top - frameSize/2,
          width: imageBounds.width + frameSize,
          height: imageBounds.height + frameSize,
          fill: 'transparent',
          stroke: '#333333',
          strokeWidth: frameSize,
          selectable: false,
          id: 'frame'
        });
        break;
      case 'vintage':
        frame = new fabric.Rect({
          left: imageBounds.left - frameSize,
          top: imageBounds.top - frameSize,
          width: imageBounds.width + frameSize * 2,
          height: imageBounds.height + frameSize * 2,
          fill: '#D2691E',
          stroke: '#A0522D',
          strokeWidth: 3,
          selectable: false,
          id: 'frame',
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.3)',
            blur: 10,
            offsetX: 5,
            offsetY: 5
          })
        });
        break;
      case 'polaroid':
        frame = new fabric.Rect({
          left: imageBounds.left - frameSize,
          top: imageBounds.top - frameSize,
          width: imageBounds.width + frameSize * 2,
          height: imageBounds.height + frameSize * 3,
          fill: '#FFFFFF',
          stroke: '#E5E5E5',
          strokeWidth: 1,
          selectable: false,
          id: 'frame'
        });
        break;
    }

    if (frame) {
      canvas.add(frame);
      canvas.sendToBack(frame);
      canvas.renderAll();
      setSelectedFrame(frameType);
      
      // Mark image as edited
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  const cancelCrop = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const cropRect = canvas.getObjects().find((obj: any) => obj.id === 'cropRect');
    if (cropRect) {
      canvas.remove(cropRect);
      canvas.renderAll();
    }
    setIsCropping(false);
  };

  const enableCropping = () => {
    setIsCropping(true);
  };

  const adjustValue = (type: 'brightness' | 'contrast' | 'saturation', increment: boolean) => {
    const step = 10;
    let currentValue = 0;
    let setter: (value: number) => void;
    
    switch (type) {
      case 'brightness':
        currentValue = brightness;
        setter = setBrightness;
        break;
      case 'contrast':
        currentValue = contrast;
        setter = setContrast;
        break;
      case 'saturation':
        currentValue = saturation;
        setter = setSaturation;
        break;
    }
    
    const newValue = increment 
      ? Math.min(100, currentValue + step)
      : Math.max(-100, currentValue - step);
    
    setter(newValue);
    applyImageFilter(type, newValue / 100);
    
    // Mark image as edited
    setEditedImages(prev => new Set(prev).add(selectedImageIndex));
  };

  const applyImageFilter = (filterType: string, value: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded) return;

    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (!mainImage) return;

    const existingFilters = mainImage.filters || [];
    const otherFilters = existingFilters.filter((filter: any) => {
      return !(
        (filterType === 'brightness' && filter instanceof fabric.Image.filters.Brightness) ||
        (filterType === 'contrast' && filter instanceof fabric.Image.filters.Contrast) ||
        (filterType === 'saturation' && filter instanceof fabric.Image.filters.Saturation)
      );
    });

    let newFilter;
    switch (filterType) {
      case 'brightness':
        newFilter = new fabric.Image.filters.Brightness({ brightness: value });
        break;
      case 'contrast':
        newFilter = new fabric.Image.filters.Contrast({ contrast: value });
        break;
      case 'saturation':
        newFilter = new fabric.Image.filters.Saturation({ saturation: value });
        break;
    }

    if (newFilter) {
      mainImage.filters = [...otherFilters, newFilter];
      mainImage.applyFilters();
      canvas.renderAll();
    }
  };

  const resetImage = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setSelectedFrame('none');
    setSelectedBorder('none');
    setIsCropping(false);
    
    if (currentImages[selectedImageIndex]) {
      loadImageToCanvas(currentImages[selectedImageIndex]);
    }
    
    // Remove from edited images
    setEditedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(selectedImageIndex);
      return newSet;
    });
  };

  const saveCurrentImage = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isImageLoaded) return;

    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
      });

      onSave(session.id, selectedImageIndex, dataURL);
      setShowSaveDialog(true);
      
      // Mark image as edited
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed due to image security restrictions.');
    }
  };

  const saveAllImages = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isImageLoaded) return;

    try {
      const allImages: string[] = [];
      for (let i = 0; i < currentImages.length; i++) {
        // Restore edit state for this image
        const state = imageEditStates[i];
        await loadImageToCanvas(currentImages[i]);
        setBrightness(state.brightness);
        setContrast(state.contrast);
        setSaturation(state.saturation);
        setSelectedBorder(state.border);
        setBorderWidth(state.borderWidth);
        setBorderColor(state.borderColor);
        setSelectedFrame(state.frame);
        // Apply all edits
        applyImageFilter('brightness', state.brightness / 100);
        applyImageFilter('contrast', state.contrast / 100);
        applyImageFilter('saturation', state.saturation / 100);
        if (state.border !== 'none') {
          applyBorder(state.border);
        }
        // Wait for canvas to update
        await new Promise((resolve) => setTimeout(resolve, 50));
        const dataURL = canvas.toDataURL({
          format: "png",
          quality: 1,
        });
        allImages.push(dataURL);
        // Remove border/frame for next image
        const borderObj = canvas.getObjects().find((obj: any) => obj.id === 'border');
        if (borderObj) canvas.remove(borderObj);
        const frameObj = canvas.getObjects().find((obj: any) => obj.id === 'frame');
        if (frameObj) canvas.remove(frameObj);
      }
      onSave(session.id, allImages);
    } catch (error) {
      console.error('Save all failed:', error);
      alert('Save failed due to image security restrictions.');
    }
  };

  const confirmDeleteImage = () => {
    if (imageToDelete !== null && onDeleteImage) {
      const newImages = currentImages.filter((_, index) => index !== imageToDelete);
      setCurrentImages(newImages);
      
      // Update edited images set
      const newEditedImages = new Set<number>();
      editedImages.forEach(index => {
        if (index < imageToDelete) {
          newEditedImages.add(index);
        } else if (index > imageToDelete) {
          newEditedImages.add(index - 1);
        }
      });
      setEditedImages(newEditedImages);
      
      if (selectedImageIndex >= newImages.length) {
        setSelectedImageIndex(Math.max(0, newImages.length - 1));
      } else if (selectedImageIndex >= imageToDelete) {
        setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
      }
      
      onDeleteImage(session.id, imageToDelete);
      setShowDeleteDialog(false);
      setImageToDelete(null);
      
      if (newImages.length > 0) {
        const newIndex = selectedImageIndex >= newImages.length ? newImages.length - 1 : selectedImageIndex;
        setTimeout(() => loadImageToCanvas(newImages[newIndex]), 100);
      }
    }
  };

  const loadImageToCanvas = async (imageUrl: string) => {
    setIsImageLoaded(false);
    setImageLoadError(null);
    console.log('Loading image into canvas:', imageUrl);

    // Set canvas size
    if (canvasRef.current) {
      canvasRef.current.width = 800;
      canvasRef.current.height = 600;
    }

    // Initialize fabric canvas if not already
    let canvas = fabricCanvasRef.current;
    if (!canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "#fff",
        selection: false,
        preserveObjectStacking: true,
        width: 800,
        height: 600,
      });
      fabricCanvasRef.current = fabricCanvas;
      canvas = fabricCanvas;
      setFabricLoaded(true);
    } else {
      canvas.setWidth(800);
      canvas.setHeight(600);
    }

    // Remove all objects from canvas
    canvas.clear();

    if (!imageUrl) {
      setImageLoadError('No image URL provided.');
      return;
    }

    // Detect blob/data URLs
    const isBlobOrData = imageUrl.startsWith('blob:') || imageUrl.startsWith('data:');
    console.log('Image type:', isBlobOrData ? 'blob/data' : 'http(s)');

    // Fallback function
    const tryDrawWithHTMLImageElement = (url) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, 800, 600);
        let scale = Math.min(800 / img.width, 600 / img.height);
        let w = img.width * scale;
        let h = img.height * scale;
        let x = (800 - w) / 2;
        let y = (600 - h) / 2;
        ctx.drawImage(img, x, y, w, h);
        setImageLoadError(null);
        setIsImageLoaded(true);
      };
      img.onerror = function() {
        setImageLoadError('HTMLImageElement also failed to load this image.');
        setIsImageLoaded(false);
      };
      img.src = url;
    };

    if (isBlobOrData) {
      // Always use HTMLImageElement for blob/data URLs
      tryDrawWithHTMLImageElement(imageUrl);
      return;
    }

    // Loader function for http(s) URLs
    const loadImage = (url, options) => {
      fabric.Image.fromURL(url, (img) => {
        if (!img) {
          setImageLoadError('Failed to load image in fabric. Trying fallback...');
          tryDrawWithHTMLImageElement(url);
          return;
        }
        // Fit image to canvas
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.min(scaleX, scaleY);
        img.set({
          left: (canvas.width - img.width * scale) / 2,
          top: (canvas.height - img.height * scale) / 2,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          id: "mainImage",
        });
        canvas.add(img);
        canvas.sendToBack(img);
        canvas.renderAll();
        setIsImageLoaded(true);
      }, options);
    };

    // Use fabric.js for http(s) URLs
    loadImage(imageUrl, { crossOrigin: "anonymous" });
  };

  // Load the initial image when the component mounts or selectedImageIndex/currentImages changes
  useEffect(() => {
    if (currentImages[selectedImageIndex]) {
      loadImageToCanvas(currentImages[selectedImageIndex]);
    }
    // eslint-disable-next-line
  }, [selectedImageIndex, currentImages]);

  // Frame and border options
  const frameOptions = [
    { value: 'none', label: 'None' },
    { value: 'classic', label: 'Classic' },
    { value: 'modern', label: 'Modern' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'polaroid', label: 'Polaroid' },
  ];
  const borderOptions = [
    { value: 'none', label: 'None' },
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
    { value: 'double', label: 'Double' },
  ];

  if (!fabricLoaded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading Photo Editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-[95vw] h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">Photo Editor - {session.customerDetails.name}</h2>
          <div className="flex items-center gap-2">
            <Button 
              onClick={saveAllImages} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!isImageLoaded}
            >
              <Save className="h-4 w-4 mr-2" />
              Save All Images
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Toolbar */}
          <div className="w-64 border-r border-border p-4 overflow-y-auto bg-gray-50 dark:bg-slate-700">
            <div className="space-y-6">
              {/* Crop Tool */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Crop className="h-4 w-4 mr-2" />
                  Crop
                </h3>
                {!isCropping ? (
                  <Button 
                    onClick={enableCropping} 
                    className="w-full" 
                    variant="outline"
                    disabled={!isImageLoaded}
                  >
                    Start Cropping
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button onClick={applyCrop} className="w-full bg-green-600 hover:bg-green-700">
                      Apply Crop
                    </Button>
                    <Button onClick={cancelCrop} className="w-full" variant="outline">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Brightness */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Sun className="h-4 w-4 mr-2" />
                  Brightness
                </h3>
                <div className="space-y-2">
                  <Input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => applyBrightness(Number(e.target.value))}
                    className="w-full"
                    disabled={!isImageLoaded}
                  />
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustValue('brightness', false)}
                      disabled={!isImageLoaded || brightness <= -100}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="text-sm text-center flex-1">{brightness}%</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustValue('brightness', true)}
                      disabled={!isImageLoaded || brightness >= 100}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contrast */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Circle className="h-4 w-4 mr-2" />
                  Contrast
                </h3>
                <div className="space-y-2">
                  <Input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => applyContrast(Number(e.target.value))}
                    className="w-full"
                    disabled={!isImageLoaded}
                  />
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustValue('contrast', false)}
                      disabled={!isImageLoaded || contrast <= -100}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="text-sm text-center flex-1">{contrast}%</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustValue('contrast', true)}
                      disabled={!isImageLoaded || contrast >= 100}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Saturation */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Saturation
                </h3>
                <div className="space-y-2">
                  <Input
                    type="range"
                    min="-100"
                    max="100"
                    value={saturation}
                    onChange={(e) => applySaturation(Number(e.target.value))}
                    className="w-full"
                    disabled={!isImageLoaded}
                  />
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustValue('saturation', false)}
                      disabled={!isImageLoaded || saturation <= -100}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="text-sm text-center flex-1">{saturation}%</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustValue('saturation', true)}
                      disabled={!isImageLoaded || saturation >= 100}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Frames */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Square className="h-4 w-4 mr-2" />
                  Frames
                </h3>
                <div className="space-y-2">
                  {frameOptions.map((frame) => (
                    <Button
                      key={frame.value}
                      variant={selectedFrame === frame.value ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => applyFrame(frame.value)}
                      disabled={!isImageLoaded}
                    >
                      {frame.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Borders */}
              <div>
                <h3 className="font-semibold mb-3">Borders</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    {borderOptions.map((border) => (
                      <Button
                        key={border.value}
                        variant={selectedBorder === border.value ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => applyBorder(border.value)}
                        disabled={!isImageLoaded}
                      >
                        {border.label}
                      </Button>
                    ))}
                  </div>
                  
                  {selectedBorder !== 'none' && (
                    <>
                      <div>
                        <label className="text-sm font-medium">Border Width</label>
                        <Input
                          type="range"
                          min="1"
                          max="50"
                          value={borderWidth}
                          onChange={(e) => {
                            setBorderWidth(Number(e.target.value));
                            if (selectedBorder !== 'none') {
                              applyBorder(selectedBorder);
                            }
                          }}
                          className="w-full"
                          disabled={!isImageLoaded}
                        />
                        <div className="text-sm text-center">{borderWidth}px</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Border Color</label>
                        <Input
                          type="color"
                          value={borderColor}
                          onChange={(e) => {
                            setBorderColor(e.target.value);
                            if (selectedBorder !== 'none') {
                              applyBorder(selectedBorder);
                            }
                          }}
                          className="w-full h-10"
                          disabled={!isImageLoaded}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-600 p-4">
            <div className="bg-white rounded-lg shadow-lg relative flex items-center justify-center" style={{ minWidth: 400, minHeight: 300, maxWidth: 800, maxHeight: 600 }}>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-gray-300 rounded-lg bg-white"
                aria-label="Photo editing canvas"
              />
              <div className="absolute top-2 left-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded shadow">
                <div>Image URL: {currentImages[selectedImageIndex]}</div>
                {imageLoadError && <div className="text-red-500">Error: {imageLoadError}</div>}
              </div>
              {imageLoadError && currentImages[selectedImageIndex] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={() => tryDrawWithHTMLImageElement(currentImages[selectedImageIndex])}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Try drawing with HTMLImageElement
                  </Button>
                  <div className="text-xs text-yellow-700 mt-2">If this works, fabric.js cannot load this image (CORS or browser issue). Consider using a different loader for these images.</div>
                </div>
              )}
              {!isImageLoaded && !imageLoadError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading image...</p>
                  </div>
                </div>
              )}
            </div>
            {/* Save, Reset, and Save All Images buttons below canvas */}
            <div className="mt-6 flex gap-4">
              <Button
                onClick={saveCurrentImage}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 flex items-center"
                disabled={!isImageLoaded}
                aria-label="Save Changes"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={resetImage}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50 px-6 py-2 flex items-center"
                disabled={!isImageLoaded}
                aria-label="Reset Image"
              >
                <X className="h-4 w-4 mr-2" />
                Reset Image
              </Button>
              <Button
                onClick={saveAllImages}
                className="bg-emerald-600 hover:bg-emerald-700 px-6 py-2 flex items-center"
                disabled={!isImageLoaded}
                aria-label="Save All Images"
              >
                <Save className="h-4 w-4 mr-2" />
                Save All Images
              </Button>
            </div>
          </div>

          {/* Right Image Grid */}
          <div className="w-80 border-l border-border p-4 bg-gray-50 dark:bg-slate-700 overflow-y-auto">
            <h3 className="font-semibold mb-4">Photos ({currentImages.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {currentImages.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index
                      ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                      : "border-gray-300 hover:border-blue-400 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <div className="w-full h-32 aspect-[4/3] bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Edited Badge */}
                  {editedImages.has(index) && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Edited
                    </div>
                  )}
                  
                  {/* Delete button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-80 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageToDelete(index);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <span className="text-white font-semibold">Editing</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Success Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Image Saved Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              The current image has been saved. You can continue editing other images or close the editor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSaveDialog(false)}>
              Continue Editing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The image will be permanently deleted from the session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteImage}>
              Delete Permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}