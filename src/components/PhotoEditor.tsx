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
  Check,
  RotateCw,
  RotateCcw,
  Settings,
  Type,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Filter // Add Filter icon
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

// Dynamic import for fabric
let fabric: any;

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
  onSave: (sessionId: string, imageIndex: number, editedImageUrl: string) => void;
  onDeleteImage?: (sessionId: string, imageIndex: number) => void;
}

export function PhotoEditor({ session, onClose, onSave, onDeleteImage }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const originalImageRef = useRef<any>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTool, setActiveTool] = useState<string>("");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<string>("none");
  const [selectedBorder, setSelectedBorder] = useState<string>("none");
  const [selectedFilter, setSelectedFilter] = useState<string>("none"); // Add this line
  const [borderWidth, setBorderWidth] = useState(10);
  const [borderColor, setBorderColor] = useState("#000000");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [currentImages, setCurrentImages] = useState<string[]>(session.images);
  const [editedImages, setEditedImages] = useState<Set<number>>(new Set());
  
  // Watermark states
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkColor, setWatermarkColor] = useState("#000000");
  const [watermarkSize, setWatermarkSize] = useState(20);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);

  // Filter options with preview icons
  const filterOptions = [
    { value: "none", label: "None", preview: "🔆", color: "#ffffff" },
    { value: "blackwhite", label: "Black & White", preview: "⚫", color: "#808080" },
    { value: "sepia", label: "Sepia", preview: "🟤", color: "#8B4513" },
    { value: "cyberpunk", label: "Cyberpunk", preview: "🟣", color: "#8A2BE2" },
    { value: "vivid", label: "Vivid", preview: "🌈", color: "#FF6B6B" },
    { value: "warm", label: "Warm", preview: "🟠", color: "#FFA500" },
    { value: "cool", label: "Cool", preview: "🔵", color: "#4169E1" },
    { value: "hdr", label: "HDR", preview: "✨", color: "#FFD700" }
  ];

  // Frame options with preview icons
  const frameOptions = [
    { value: "none", label: "None", preview: "⬜" },
    { value: "classic", label: "Classic", preview: "🟫" },
    { value: "modern", label: "Modern", preview: "⬛" },
    { value: "vintage", label: "Vintage", preview: "🟤" },
    { value: "polaroid", label: "Polaroid", preview: "⬜" },
    { value: "ornate", label: "Ornate", preview: "🎨" }
  ];

  // Border options with preview icons
  const borderOptions = [
    { value: "none", label: "None", preview: "⬜" },
    { value: "solid", label: "Solid", preview: "▬" },
    { value: "dashed", label: "Dashed", preview: "▭" },
    { value: "dotted", label: "Dotted", preview: "⋯" },
    { value: "double", label: "Double", preview: "=" },
    { value: "rounded", label: "Rounded", preview: "◯" }
  ];

  // Tool categories - Updated to include Filter
  const toolCategories = [
    { id: "crop", label: "Crop", icon: Crop },
    { id: "adjustment", label: "Adjustment", icon: Settings },
    { id: "filter", label: "Filter", icon: Filter },
    { id: "frame", label: "Frame", icon: Square },
    { id: "border", label: "Border", icon: Circle },
    { id: "watermark", label: "Watermark", icon: Type }
  ];

  // Load fabric.js dynamically
  useEffect(() => {
    const loadFabric = async () => {
      try {
        const fabricModule = await import('fabric');
        fabric = fabricModule.fabric || fabricModule.default || fabricModule;
        setFabricLoaded(true);
      } catch (error) {
        console.error('Failed to load fabric.js:', error);
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
        script.onload = () => {
          fabric = (window as any).fabric;
          setFabricLoaded(true);
        };
        document.head.appendChild(script);
      }
    };

    loadFabric();
  }, []);

  // Convert image to base64 to avoid CORS issues
  const convertImageToBase64 = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (imageUrl.startsWith('data:')) {
        resolve(imageUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const base64 = canvas.toDataURL('image/png');
            resolve(base64);
          } catch (error) {
            console.warn('CORS issue detected, using original URL:', error);
            resolve(imageUrl);
          }
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      
      img.onerror = () => {
        console.warn('Failed to load image for conversion, using original URL');
        resolve(imageUrl);
      };
      
      img.src = imageUrl;
    });
  };

  useEffect(() => {
    if (canvasRef.current && fabricLoaded && fabric) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
      });

      fabricCanvasRef.current = canvas;

      if (currentImages.length > 0) {
        loadImageToCanvas(currentImages[selectedImageIndex]);
      }

      return () => {
        canvas.dispose();
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout);
        }
      };
    }
  }, [fabricLoaded]);

  useEffect(() => {
    if (fabricCanvasRef.current && currentImages[selectedImageIndex] && fabricLoaded) {
      loadImageToCanvas(currentImages[selectedImageIndex]);
    }
  }, [selectedImageIndex, fabricLoaded, currentImages]);

  const loadImageToCanvas = async (imageUrl: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric) return;

    setIsImageLoaded(false);
    
    try {
      const base64Image = await convertImageToBase64(imageUrl);
      
      fabric.Image.fromURL(base64Image, (img: any) => {
        if (!img) {
          console.error('Failed to load image');
          return;
        }

        canvas.clear();
        
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const scale = Math.min(canvasWidth / img.width!, canvasHeight / img.height!) * 0.8;
        
        img.scale(scale);
        img.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center'
        });
        
        img.setCoords();
        img.selectable = false;
        img.evented = false;
        img.id = 'mainImage';
        
        originalImageRef.current = img;
        
        canvas.add(img);
        canvas.sendToBack(img);
        canvas.renderAll();
        
        setIsImageLoaded(true);
        
        setBrightness(0);
        setContrast(0);
        setSaturation(0);
        setSelectedFrame('none');
        setSelectedBorder('none');
        setSelectedFilter('none'); // Reset filter when loading new image
        setIsCropping(false);
      }, { crossOrigin: 'anonymous' });
      
    } catch (error) {
      console.error('Error loading image:', error);
      setIsImageLoaded(false);
    }
  };

  const toggleTool = (toolId: string) => {
    if (activeTool === toolId) {
      setActiveTool("");
    } else {
      setActiveTool(toolId);
    }
  };

  // Filter functions
  const applyFilter = (filterType: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded) return;

    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (!mainImage) return;

    try {
      // Remove ALL existing filters and start fresh
      const existingFilters = mainImage.filters || [];
      
      // Keep only adjustment filters (brightness, contrast, saturation) - remove all artistic filters
      const adjustmentFilters = existingFilters.filter((filter: any) => {
        return (
          (fabric.Image?.filters?.Brightness && filter instanceof fabric.Image.filters.Brightness) ||
          (fabric.Image?.filters?.Contrast && filter instanceof fabric.Image.filters.Contrast) ||
          (fabric.Image?.filters?.Saturation && filter instanceof fabric.Image.filters.Saturation)
        );
      });

      if (filterType === 'none') {
        // Keep only adjustment filters, remove all artistic filters
        mainImage.filters = adjustmentFilters;
        mainImage.applyFilters();
        canvas.renderAll();
        setSelectedFilter('none');
        return;
      }

      // Start with adjustment filters and add the new artistic filter
      let newFilters = [...adjustmentFilters];

      switch (filterType) {
        case 'blackwhite':
          if (fabric.Image?.filters?.Grayscale) {
            newFilters.push(new fabric.Image.filters.Grayscale());
          }
          break;
          
        case 'sepia':
          if (fabric.Image?.filters?.Sepia) {
            newFilters.push(new fabric.Image.filters.Sepia());
          }
          break;
          
        case 'cyberpunk':
          // Cyberpunk effect: High contrast + Purple tint
          if (fabric.Image?.filters?.Contrast) {
            // Remove existing contrast from adjustments and add cyberpunk contrast
            newFilters = newFilters.filter(f => !(fabric.Image?.filters?.Contrast && f instanceof fabric.Image.filters.Contrast));
            newFilters.push(new fabric.Image.filters.Contrast({ contrast: 0.3 }));
          }
          if (fabric.Image?.filters?.ColorMatrix) {
            newFilters.push(new fabric.Image.filters.ColorMatrix({
              matrix: [
                1.2, 0, 0.8, 0, 0,
                0, 0.8, 1.2, 0, 0,
                0.8, 0, 1.2, 0, 0,
                0, 0, 0, 1, 0
              ]
            }));
          }
          break;
          
        case 'vivid':
          // Vivid effect: Increased saturation and slight contrast
          if (fabric.Image?.filters?.Saturation) {
            // Remove existing saturation from adjustments and add vivid saturation
            newFilters = newFilters.filter(f => !(fabric.Image?.filters?.Saturation && f instanceof fabric.Image.filters.Saturation));
            newFilters.push(new fabric.Image.filters.Saturation({ saturation: 0.4 }));
          }
          if (fabric.Image?.filters?.Contrast) {
            // Remove existing contrast from adjustments and add vivid contrast
            newFilters = newFilters.filter(f => !(fabric.Image?.filters?.Contrast && f instanceof fabric.Image.filters.Contrast));
            newFilters.push(new fabric.Image.filters.Contrast({ contrast: 0.2 }));
          }
          break;
          
        case 'warm':
          // Warm effect: Orange/yellow tint
          if (fabric.Image?.filters?.ColorMatrix) {
            newFilters.push(new fabric.Image.filters.ColorMatrix({
              matrix: [
                1.2, 0.1, 0, 0, 0,
                0.1, 1.1, 0, 0, 0,
                0, 0, 0.8, 0, 0,
                0, 0, 0, 1, 0
              ]
            }));
          }
          break;
          
        case 'cool':
          // Cool effect: Blue tint
          if (fabric.Image?.filters?.ColorMatrix) {
            newFilters.push(new fabric.Image.filters.ColorMatrix({
              matrix: [
                0.8, 0, 0.1, 0, 0,
                0, 0.9, 0.1, 0, 0,
                0.1, 0.1, 1.2, 0, 0,
                0, 0, 0, 1, 0
              ]
            }));
          }
          break;
          
        case 'hdr':
          // HDR effect: Enhanced contrast and gamma
          if (fabric.Image?.filters?.Gamma) {
            newFilters.push(new fabric.Image.filters.Gamma({ 
              gamma: [1, 0.8, 0.8] 
            }));
          }
          if (fabric.Image?.filters?.Contrast) {
            // Remove existing contrast from adjustments and add HDR contrast
            newFilters = newFilters.filter(f => !(fabric.Image?.filters?.Contrast && f instanceof fabric.Image.filters.Contrast));
            newFilters.push(new fabric.Image.filters.Contrast({ contrast: 0.25 }));
          }
          if (fabric.Image?.filters?.Brightness) {
            // Remove existing brightness from adjustments and add HDR brightness
            newFilters = newFilters.filter(f => !(fabric.Image?.filters?.Brightness && f instanceof fabric.Image.filters.Brightness));
            newFilters.push(new fabric.Image.filters.Brightness({ brightness: 0.1 }));
          }
          break;
      }

      // Apply the new filter set
      mainImage.filters = newFilters;
      mainImage.applyFilters();
      canvas.renderAll();
      setSelectedFilter(filterType);
      
      if (filterType !== 'none') {
        setEditedImages(prev => new Set(prev).add(selectedImageIndex));
      }
    } catch (error) {
      console.error('Error applying filter:', error);
      // Fallback to simpler filters if advanced filters are not available
      if (filterType === 'blackwhite') {
        // Simple grayscale fallback
        mainImage.filters = [new fabric.Image.filters.Grayscale()];
        mainImage.applyFilters();
        canvas.renderAll();
        setSelectedFilter(filterType);
      }
    }
  };

  // Crop functions
  const enableCropping = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded) return;

    setIsCropping(true);
    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    
    if (mainImage) {
      const imageBounds = mainImage.getBoundingRect();
      
      const cropRect = new fabric.Rect({
        left: imageBounds.left + imageBounds.width / 4,
        top: imageBounds.top + imageBounds.height / 4,
        width: imageBounds.width / 2,
        height: imageBounds.height / 2,
        fill: 'transparent',
        stroke: '#ff0000',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        selectable: true,
        id: 'cropRect'
      });

      canvas.add(cropRect);
      canvas.setActiveObject(cropRect);
      canvas.renderAll();
    }
  };

  const applyCrop = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isImageLoaded) return;

    const cropRect = canvas.getObjects().find((obj: any) => obj.id === 'cropRect');
    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');

    if (cropRect && mainImage) {
      const cropBounds = cropRect.getBoundingRect();
      
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCanvas.width = cropBounds.width;
        tempCanvas.height = cropBounds.height;
        
        cropRect.visible = false;
        canvas.renderAll();
        
        const cleanCanvas = canvas.toCanvasElement();
        
        tempCtx.drawImage(
          cleanCanvas,
          cropBounds.left,
          cropBounds.top,
          cropBounds.width,
          cropBounds.height,
          0,
          0,
          cropBounds.width,
          cropBounds.height
        );
        
        const croppedDataURL = tempCanvas.toDataURL('image/png');
        
        fabric.Image.fromURL(croppedDataURL, (newImg: any) => {
          canvas.clear();
          
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          const newScale = Math.min(canvasWidth / newImg.width!, canvasHeight / newImg.height!) * 0.8;
          
          newImg.scale(newScale);
          newImg.set({
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            id: 'mainImage'
          });
          
          canvas.add(newImg);
          canvas.renderAll();
          
          originalImageRef.current = newImg;
          setIsCropping(false);
          
          setEditedImages(prev => new Set(prev).add(selectedImageIndex));
        });
      }
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

  const rotateImage = (direction: 'left' | 'right') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isImageLoaded) return;

    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (mainImage) {
      const currentAngle = mainImage.angle || 0;
      const newAngle = direction === 'right' ? currentAngle + 90 : currentAngle - 90;
      
      mainImage.set('angle', newAngle);
      canvas.renderAll();
      
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  // Adjustment functions
  const applyBrightness = (value: number) => {
    setBrightness(value);
    applyImageFilter('brightness', value / 100);
    if (value !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  const applyContrast = (value: number) => {
    setContrast(value);
    applyImageFilter('contrast', value / 100);
    if (value !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  const applySaturation = (value: number) => {
    setSaturation(value);
    applyImageFilter('saturation', value / 100);
    if (value !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  const applyImageFilter = (filterType: string, value: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded) return;

    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (!mainImage) return;

    const existingFilters = mainImage.filters || [];
    
    // Remove the specific adjustment filter being updated
    const otherFilters = existingFilters.filter((filter: any) => {
      return !(
        (filterType === 'brightness' && fabric.Image?.filters?.Brightness && filter instanceof fabric.Image.filters.Brightness) ||
        (filterType === 'contrast' && fabric.Image?.filters?.Contrast && filter instanceof fabric.Image.filters.Contrast) ||
        (filterType === 'saturation' && fabric.Image?.filters?.Saturation && filter instanceof fabric.Image.filters.Saturation)
      );
    });

    let newFilter;
    switch (filterType) {
      case 'brightness':
        if (fabric.Image?.filters?.Brightness && value !== 0) {
          newFilter = new fabric.Image.filters.Brightness({ brightness: value });
        }
        break;
      case 'contrast':
        if (fabric.Image?.filters?.Contrast && value !== 0) {
          newFilter = new fabric.Image.filters.Contrast({ contrast: value });
        }
        break;
      case 'saturation':
        if (fabric.Image?.filters?.Saturation && value !== 0) {
          newFilter = new fabric.Image.filters.Saturation({ saturation: value });
        }
        break;
    }

    // Add the new filter if it exists, otherwise just use the other filters
    mainImage.filters = newFilter ? [...otherFilters, newFilter] : otherFilters;
    mainImage.applyFilters();
    canvas.renderAll();
    
    // If we have a selected filter, reapply it to maintain the artistic effect
    if (selectedFilter && selectedFilter !== 'none') {
      setTimeout(() => applyFilter(selectedFilter), 50);
    }
  };

  // Frame functions
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
      case 'ornate':
        frame = new fabric.Rect({
          left: imageBounds.left - frameSize,
          top: imageBounds.top - frameSize,
          width: imageBounds.width + frameSize * 2,
          height: imageBounds.height + frameSize * 2,
          fill: '#FFD700',
          stroke: '#B8860B',
          strokeWidth: 4,
          selectable: false,
          id: 'frame',
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.4)',
            blur: 15,
            offsetX: 3,
            offsetY: 3
          })
        });
        break;
    }

    if (frame) {
      canvas.add(frame);
      canvas.sendToBack(frame);
      canvas.renderAll();
      setSelectedFrame(frameType);
      
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  // Border functions
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
      case 'rounded':
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
      rx: borderType === 'rounded' ? 20 : 0,
      ry: borderType === 'rounded' ? 20 : 0,
      selectable: false,
      id: 'border'
    });

    canvas.add(border);
    canvas.renderAll();
    setSelectedBorder(borderType);
    
    setEditedImages(prev => new Set(prev).add(selectedImageIndex));
  };

  // Watermark functions
  const addTextWatermark = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded || !watermarkText.trim()) return;

    const existingWatermark = canvas.getObjects().find((obj: any) => obj.id === 'watermark');
    if (existingWatermark) {
      canvas.remove(existingWatermark);
    }

    const textWatermark = new fabric.Text(watermarkText, {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      fontFamily: 'Arial',
      fontSize: watermarkSize,
      fill: watermarkColor,
      opacity: watermarkOpacity,
      originX: 'center',
      originY: 'center',
      selectable: true,
      id: 'watermark'
    });

    canvas.add(textWatermark);
    canvas.renderAll();
    
    setEditedImages(prev => new Set(prev).add(selectedImageIndex));
  };

  const addImageWatermark = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabric || !isImageLoaded) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      fabric.Image.fromURL(imageUrl, (img: any) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const existingWatermark = canvas.getObjects().find((obj: any) => obj.id === 'watermark');
        if (existingWatermark) {
          canvas.remove(existingWatermark);
        }

        img.scale(0.2);
        img.set({
          left: canvas.getWidth() - 100,
          top: canvas.getHeight() - 100,
          opacity: watermarkOpacity,
          selectable: true,
          id: 'watermark'
        });

        canvas.add(img);
        canvas.renderAll();
        
        setEditedImages(prev => new Set(prev).add(selectedImageIndex));
      });
    };
    
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const resetImage = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setSelectedFrame('none');
    setSelectedBorder('none');
    setSelectedFilter('none'); // Add filter reset
    setIsCropping(false);
    
    if (currentImages[selectedImageIndex]) {
      loadImageToCanvas(currentImages[selectedImageIndex]);
    }
    
    setEditedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(selectedImageIndex);
      return newSet;
    });
  };

  const saveCurrentImage = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isImageLoaded) return;

    // Check if crop rectangle is present, and apply crop if so
    const cropRect = canvas.getObjects().find((obj) => obj.id === 'cropRect');
    if (cropRect) {
      const mainImage = canvas.getObjects().find((obj) => obj.id === 'mainImage');
      if (mainImage) {
        const cropBounds = cropRect.getBoundingRect();
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCanvas.width = cropBounds.width;
          tempCanvas.height = cropBounds.height;
          // Remove crop rectangle from canvas before rendering
          canvas.remove(cropRect);
          canvas.renderAll();
          const cleanCanvas = canvas.toCanvasElement();
          tempCtx.drawImage(
            cleanCanvas,
            cropBounds.left,
            cropBounds.top,
            cropBounds.width,
            cropBounds.height,
            0,
            0,
            cropBounds.width,
            cropBounds.height
          );
          const croppedDataURL = tempCanvas.toDataURL('image/png');
          // Replace main image with cropped image synchronously
          fabric.Image.fromURL(croppedDataURL, (newImg) => {
            canvas.clear();
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            const newScale = Math.min(canvasWidth / newImg.width, canvasHeight / newImg.height) * 0.8;
            newImg.scale(newScale);
            newImg.set({
              left: canvasWidth / 2,
              top: canvasHeight / 2,
              originX: 'center',
              originY: 'center',
              selectable: false,
              evented: false,
              id: 'mainImage',
            });
            canvas.add(newImg);
            canvas.renderAll();
            originalImageRef.current = newImg;
            setIsCropping(false);
            setEditedImages((prev) => new Set(prev).add(selectedImageIndex));
            // Now save the cropped image
            try {
              const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
              onSave(session.id, selectedImageIndex, dataURL);
              setShowSaveDialog(true);
              setEditedImages((prev) => new Set(prev).add(selectedImageIndex));
            } catch (error) {
              console.error('Save failed:', error);
              alert('Save failed due to image security restrictions.');
            }
          }, { crossOrigin: 'anonymous' });
          return; // Don't run the rest of saveCurrentImage, as save is handled in callback
        }
      }
    } else {
      // No crop rectangle, save as usual
      try {
        const dataURL = canvas.toDataURL({
          format: 'png',
          quality: 1,
        });
        onSave(session.id, selectedImageIndex, dataURL);
        setShowSaveDialog(true);
        setEditedImages((prev) => new Set(prev).add(selectedImageIndex));
      } catch (error) {
        console.error('Save failed:', error);
        alert('Save failed due to image security restrictions.');
      }
    }
  };

  const saveAllImages = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isImageLoaded) return;

    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
      });

      onSave(session.id, selectedImageIndex, dataURL);
      alert('All changes saved successfully!');
    } catch (error) {
      console.error('Save all failed:', error);
      alert('Save failed due to image security restrictions.');
    }
  };

  const confirmDeleteImage = () => {
    if (imageToDelete !== null && onDeleteImage) {
      const newImages = currentImages.filter((_, index) => index !== imageToDelete);
      setCurrentImages(newImages);
      
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
              onClick={saveAllImages} // Fix: Add the actual function
              className="bg-green-600 hover:bg-green-700"
              disabled={!isImageLoaded}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Now
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Toolbar */}
          <div className="w-80 border-r border-border p-4 overflow-y-auto bg-gray-50 dark:bg-slate-700">
            <div className="space-y-4">
              {/* Tool Categories */}
              {toolCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    className={`w-full justify-between p-4 h-auto ${
                      activeTool === category.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleTool(category.id)}
                  >
                    <div className="flex items-center gap-3">
                      <category.icon className="h-5 w-5" />
                      <span className="font-medium">{category.label}</span>
                    </div>
                    {activeTool === category.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  
                  {/* Tool Content */}
                  {activeTool === category.id && (
                    <div className="p-4 bg-white dark:bg-slate-800 border-t">
                      {/* Filter Tools */}
                      {category.id === 'filter' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {filterOptions.map((filter) => (
                              <Button
                                key={filter.value}
                                variant={selectedFilter === filter.value ? "default" : "outline"}
                                className="h-16 flex flex-col items-center justify-center p-2 text-xs"
                                onClick={() => applyFilter(filter.value)}
                                disabled={!isImageLoaded}
                                style={{
                                  borderColor: selectedFilter === filter.value ? filter.color : undefined
                                }}
                              >
                                <span className="text-lg mb-1">{filter.preview}</span>
                                <span className="text-[10px] leading-tight text-center">{filter.label}</span>
                              </Button>
                            ))}
                          </div>
                          
                          {selectedFilter !== 'none' && (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                <Filter className="h-3 w-3 inline mr-1" />
                                Filter "{filterOptions.find(f => f.value === selectedFilter)?.label}" applied
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Crop Tools */}
                      {category.id === 'crop' && (
                        <div className="space-y-3">
                          {!isCropping ? (
                            <Button 
                              onClick={enableCropping} 
                              className="w-full" 
                              variant="outline"
                              disabled={!isImageLoaded}
                            >
                              <Crop className="h-4 w-4 mr-2" />
                              Crop Image
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
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => rotateImage('left')} 
                              variant="outline" 
                              className="flex-1"
                              disabled={!isImageLoaded}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Rotate Left
                            </Button>
                            <Button 
                              onClick={() => rotateImage('right')} 
                              variant="outline" 
                              className="flex-1"
                              disabled={!isImageLoaded}
                            >
                              <RotateCw className="h-4 w-4 mr-2" />
                              Rotate Right
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Adjustment Tools */}
                      {category.id === 'adjustment' && (
                        <div className="space-y-4">
                          {/* Brightness */}
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              <Sun className="h-4 w-4 inline mr-2" />
                              Brightness: {brightness}%
                            </label>
                            <Input
                              type="range"
                              min="-100"
                              max="100"
                              value={brightness}
                              onChange={(e) => applyBrightness(Number(e.target.value))}
                              className="w-full"
                              disabled={!isImageLoaded}
                            />
                          </div>

                          {/* Contrast */}
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              <Circle className="h-4 w-4 inline mr-2" />
                              Contrast: {contrast}%
                            </label>
                            <Input
                              type="range"
                              min="-100"
                              max="100"
                              value={contrast}
                              onChange={(e) => applyContrast(Number(e.target.value))}
                              className="w-full"
                              disabled={!isImageLoaded}
                            />
                          </div>

                          {/* Saturation */}
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              <Palette className="h-4 w-4 inline mr-2" />
                              Saturation: {saturation}%
                            </label>
                            <Input
                              type="range"
                              min="-100"
                              max="100"
                              value={saturation}
                              onChange={(e) => applySaturation(Number(e.target.value))}
                              className="w-full"
                              disabled={!isImageLoaded}
                            />
                          </div>
                        </div>
                      )}

                      {/* Frame Tools */}
                      {category.id === 'frame' && (
                        <div className="grid grid-cols-3 gap-2">
                          {frameOptions.map((frame) => (
                            <Button
                              key={frame.value}
                              variant={selectedFrame === frame.value ? "default" : "outline"}
                              className="h-16 flex flex-col items-center justify-center p-2"
                              onClick={() => applyFrame(frame.value)}
                              disabled={!isImageLoaded}
                            >
                              <span className="text-2xl mb-1">{frame.preview}</span>
                              <span className="text-xs">{frame.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Border Tools */}
                      {category.id === 'border' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            {borderOptions.map((border) => (
                              <Button
                                key={border.value}
                                variant={selectedBorder === border.value ? "default" : "outline"}
                                className="h-16 flex flex-col items-center justify-center p-2"
                                onClick={() => applyBorder(border.value)}
                                disabled={!isImageLoaded}
                              >
                                <span className="text-2xl mb-1">{border.preview}</span>
                                <span className="text-xs">{border.label}</span>
                              </Button>
                            ))}
                          </div>
                          
                          {selectedBorder !== 'none' && (
                            <div className="space-y-3 pt-3 border-t">
                              <div>
                                <label className="text-sm font-medium">Border Width: {borderWidth}px</label>
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
                            </div>
                          )}
                        </div>
                      )}

                      {/* Watermark Tools */}
                      {category.id === 'watermark' && (
                        <div className="space-y-4">
                          {/* Text Watermark */}
                          <div className="space-y-3">
                            <h4 className="font-medium flex items-center">
                              <Type className="h-4 w-4 mr-2" />
                              Text Watermark
                            </h4>
                            <Input
                              placeholder="Enter watermark text"
                              value={watermarkText}
                              onChange={(e) => setWatermarkText(e.target.value)}
                              disabled={!isImageLoaded}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs">Size: {watermarkSize}px</label>
                                <Input
                                  type="range"
                                  min="12"
                                  max="72"
                                  value={watermarkSize}
                                  onChange={(e) => setWatermarkSize(Number(e.target.value))}
                                  disabled={!isImageLoaded}
                                />
                              </div>
                              <div>
                                <label className="text-xs">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                                <Input
                                  type="range"
                                  min="0.1"
                                  max="1"
                                  step="0.1"
                                  value={watermarkOpacity}
                                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                                  disabled={!isImageLoaded}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs">Color</label>
                              <Input
                                type="color"
                                value={watermarkColor}
                                onChange={(e) => setWatermarkColor(e.target.value)}
                                className="w-full h-8"
                                disabled={!isImageLoaded}
                              />
                            </div>
                            <Button
                              onClick={addTextWatermark}
                              className="w-full"
                              disabled={!isImageLoaded || !watermarkText.trim()}
                            >
                              Add Text Watermark
                            </Button>
                          </div>

                          {/* Image Watermark */}
                          <div className="space-y-3 pt-3 border-t">
                            <h4 className="font-medium flex items-center">
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Image Watermark
                            </h4>
                            <Button
                              onClick={() => watermarkInputRef.current?.click()}
                              variant="outline"
                              className="w-full"
                              disabled={!isImageLoaded}
                            >
                              Choose Image
                            </Button>
                            <input
                              ref={watermarkInputRef}
                              type="file"
                              accept="image/*"
                              onChange={addImageWatermark}
                              className="hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-slate-600 p-4">
            <div className="bg-white rounded-lg shadow-lg relative">
              <canvas ref={canvasRef} className="border border-gray-300 rounded-lg" />
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading image...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Save Changes and Reset Buttons below canvas */}
            <div className="mt-4 flex gap-3">
              <Button 
                onClick={saveCurrentImage} // Fix: Add the actual function
                className="bg-green-600 hover:bg-green-700 px-8 py-2"
                disabled={!isImageLoaded}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button 
                onClick={resetImage} 
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-2"
                disabled={!isImageLoaded}
              >
                Reset Image
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
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-[1.02] ${
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