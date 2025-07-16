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
  Filter
} from "lucide-react";
// Import React Icons for filters and frames
import { 
  FaRegCircle, 
  FaSquare, 
  FaRegSquare, 
  FaBorderAll,
  FaPalette,
  FaEye,
  FaFire,
  FaSnowflake,
  FaSun,
  FaMoon,
  FaGem,
  FaImage,
  FaCamera,
  FaDesktop,
  FaMobile
} from 'react-icons/fa';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HexColorPicker } from "react-colorful";

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
  editedImages?: number[];
  originalImages?: string[];
}

interface PhotoEditorProps {
  session: Session;
  onClose: () => void;
  onSave: (sessionId: string, imageIndex: number, editedImageUrl: string) => void;
  onDeleteImage?: (sessionId: string, imageIndex: number) => void;
  initialSelectedIndex?: number;
}

export function PhotoEditor({ 
  session, 
  onClose, 
  onSave, 
  onDeleteImage, 
  initialSelectedIndex = 0 
}: PhotoEditorProps) {
  // Canvas and fabric refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const originalImageRef = useRef<any>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  // Core state variables - Make sure these are declared at the top
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialSelectedIndex); // This line must be present
  const [activeTool, setActiveTool] = useState<string>("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>(session.images);
  const [editedImages, setEditedImages] = useState<Set<number>>(
    new Set(session.editedImages || [])
  );
  // Add frameSize state
  const [frameSize, setFrameSize] = useState(20);

  // Adjustment state
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  // Tool state
  const [isCropping, setIsCropping] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<string>("none");
  const [selectedBorder, setSelectedBorder] = useState<string>("none");
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [borderWidth, setBorderWidth] = useState(10);
  const [borderColor, setBorderColor] = useState("#000000");

  // Dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Watermark states
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkColor, setWatermarkColor] = useState("#000000");
  const [watermarkSize, setWatermarkSize] = useState(20);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);
  const [watermarkImageOpacity, setWatermarkImageOpacity] = useState(0.5);

  // Filter options with React Icons
  const filterOptions = [
    { value: "none", label: "None", icon: FaRegCircle, color: "#ffffff" },
    { value: "blackwhite", label: "Black & White", icon: FaRegSquare, color: "#808080" },
    { value: "sepia", label: "Sepia", icon: FaEye, color: "#8B4513" },
    { value: "cyberpunk", label: "Cyberpunk", icon: FaGem, color: "#8A2BE2" },
    { value: "vivid", label: "Vivid", icon: FaPalette, color: "#FF6B6B" },
    { value: "warm", label: "Warm", icon: FaSun, color: "#FFA500" },
    { value: "cool", label: "Cool", icon: FaSnowflake, color: "#4169E1" },
    { value: "hdr", label: "HDR", icon: FaFire, color: "#FFD700" }
  ];

  // Frame options with React Icons
  const frameOptions = [
    { value: "none", label: "None", icon: FaRegSquare },
    { value: "classic", label: "Classic", icon: FaSquare },
    { value: "modern", label: "Modern", icon: FaDesktop },
    { value: "vintage", label: "Vintage", icon: FaCamera },
    { value: "polaroid", label: "Polaroid", icon: FaImage },
    { value: "ornate", label: "Ornate", icon: FaGem }
  ];

  // Border options with React Icons
  const borderOptions = [
    { value: "none", label: "None", icon: FaRegCircle },
    { value: "solid", label: "Solid", icon: FaBorderAll },
    { value: "dashed", label: "Dashed", icon: FaSquare },
    { value: "dotted", label: "Dotted", icon: Circle },
    // { value: "double", label: "Double", icon: FaDesktop },
    { value: "rounded", label: "Rounded", icon: FaRegCircle }
  ];

  // Tool categories
  const toolCategories = [
    { id: "crop", label: "Crop", icon: Crop },
    { id: "adjustment", label: "Adjustment", icon: Settings },
    { id: "filter", label: "Filter", icon: Filter },
    { id: "frame", label: "Frame", icon: Square },
    { id: "border", label: "Border", icon: Circle },
    { id: "watermark", label: "Watermark", icon: Type }
  ];

  // Store per-image canvas state
  const [canvasStates, setCanvasStates] = useState<{ [index: number]: any }>({});

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  // Track previous image index for auto-save
  const prevImageIndexRef = useRef(selectedImageIndex);

  // Auto-save canvas state before switching images, and auto-restore on switch
  useEffect(() => {
    const prevIndex = prevImageIndexRef.current;
    if (fabricCanvasRef.current && prevIndex !== selectedImageIndex) {
      // Save current canvas state for previous image (after all edits)
      setCanvasStates(prev => ({ ...prev, [prevIndex]: fabricCanvasRef.current!.toJSON() }));
    }
    prevImageIndexRef.current = selectedImageIndex;
    // On switch, restore state if exists (and only restore, do not re-apply edits)
    if (fabricCanvasRef.current && canvasStates[selectedImageIndex]) {
      fabricCanvasRef.current.loadFromJSON(canvasStates[selectedImageIndex], () => {
        fabricCanvasRef.current.renderAll();
      });
    } else if (fabricCanvasRef.current && currentImages[selectedImageIndex]) {
      loadImageToCanvas(currentImages[selectedImageIndex]);
    }
    setUndoStack([]);
    setRedoStack([]);
  }, [selectedImageIndex, canvasStates, currentImages]);

  // Push current state to undo stack only if main image is present, using deep copy
  const pushUndo = useCallback(() => {
    if (fabricCanvasRef.current) {
      const current = JSON.parse(JSON.stringify(fabricCanvasRef.current.toJSON()));
      const hasMainImage = (fabricCanvasRef.current.getObjects().find((obj: any) => obj.id === 'mainImage'));
      if (hasMainImage && (undoStack.length === 0 || JSON.stringify(undoStack[undoStack.length - 1]) !== JSON.stringify(current))) {
        console.log('Pushing to undoStack:', current);
        setUndoStack(prev => [...prev, current]);
        setRedoStack([]); // Clear redo stack on new action
      }
    }
  }, [undoStack]);

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

  // Initialize canvas
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

  // Update currentImages state when session.images changes
  useEffect(() => {
    setCurrentImages(session.images);
    setEditedImages(new Set(session.editedImages || []));
  }, [session.images, session.editedImages]);

  // Load image when selectedImageIndex changes
  useEffect(() => {
    if (fabricCanvasRef.current && currentImages[selectedImageIndex] && fabricLoaded) {
      loadImageToCanvas(currentImages[selectedImageIndex]);
    }
  }, [selectedImageIndex, fabricLoaded, currentImages]);

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
        setSelectedFilter('none');
        setIsCropping(false);
        // Push initial state to undo stack if this is the first load for this image
        setUndoStack(prev => prev.length === 0 ? [canvas.toJSON()] : prev);
      }, { crossOrigin: 'anonymous' });
      
    } catch (error) {
      console.error('Error loading image:', error);
      setIsImageLoaded(false);
    }
  };

  // Updated save functions
  const saveCurrentImage = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !isImageLoaded) return;

    // If we're in cropping mode, apply the crop first
    if (isCropping) {
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

            // Remove any existing frame or border objects
            // (in case they were present before cropping)
            canvas.getObjects().filter((obj: any) => obj.id === 'frame' || obj.id === 'border' || obj.id === 'innerBorder').forEach((obj: any) => canvas.remove(obj));

            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            // Center the cropped image on the canvas, keep its cropped size and aspect ratio
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
            setSelectedBorder('none'); // Reset border after crop

            // After applying crop, save the image
            setTimeout(() => {
              const finalDataURL = canvas.toDataURL({
                format: "png",
                quality: 1,
              });

              // Update local currentImages state immediately
              setCurrentImages(prev => {
                const newImages = [...prev];
                newImages[selectedImageIndex] = finalDataURL;
                return newImages;
              });

              // Save canvas state for this image
              setCanvasStates(prev => ({ ...prev, [selectedImageIndex]: canvas.toJSON() }));

              // Call the parent's save handler
              onSave(session.id, selectedImageIndex, finalDataURL);
              setShowSaveDialog(true);
              
              // Mark this image as edited
              setEditedImages(prev => new Set(prev).add(selectedImageIndex));
            }, 100);
          });
          return;
        }
      }
    }

    // Normal save functionality
    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
      });

      // Update local currentImages state immediately
      setCurrentImages(prev => {
        const newImages = [...prev];
        newImages[selectedImageIndex] = dataURL;
        return newImages;
      });

      // Save canvas state for this image
      setCanvasStates(prev => ({ ...prev, [selectedImageIndex]: canvas.toJSON() }));

      // Call the parent's save handler
      onSave(session.id, selectedImageIndex, dataURL);
      setShowSaveDialog(true);
      
      // Mark this image as edited
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed due to image security restrictions.');
    }
  };

  // Premium Save All: sequentially process and save each image with watermark/edits
  const saveAllImages = async () => {
    if (!fabricCanvasRef.current || !fabricLoaded) return;
    const canvas = fabricCanvasRef.current;
    const prevIndex = selectedImageIndex;
    let updatedImages = [...currentImages];
    setShowSaveDialog(true);
    // Save current canvas state for the current image before batch export
    setCanvasStates(prev => ({ ...prev, [selectedImageIndex]: canvas.toJSON() }));
    for (let i = 0; i < currentImages.length; i++) {
      if (canvasStates[i]) {
        await new Promise(res => {
          canvas.loadFromJSON(canvasStates[i], () => {
            canvas.renderAll();
            res(undefined);
          });
        });
        await new Promise(res => setTimeout(res, 100));
      } else {
        await loadImageToCanvas(currentImages[i]);
        await new Promise(res => setTimeout(res, 100));
      }
      // Re-apply current text watermark if present
      if (watermarkText.trim() !== "") {
        const existingText = canvas.getObjects().find((obj) => obj.id === 'textWatermark');
        if (existingText) canvas.remove(existingText);
        const textWatermark = new fabric.Text(watermarkText, {
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          fontFamily: 'Arial',
          fontSize: watermarkSize,
          fill: watermarkColor,
          opacity: watermarkOpacity,
          selectable: false,
          evented: false,
          id: 'textWatermark'
        });
        canvas.add(textWatermark);
      }
      // Re-apply current image watermark if present
      const imageWatermarkObj = canvas.getObjects().find((obj) => obj.id === 'imageWatermark');
      if (imageWatermarkObj && imageWatermarkObj.type === 'image' && imageWatermarkObj.getSrc) {
        fabric.Image.fromURL(imageWatermarkObj.getSrc(), (img) => {
          img.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            opacity: watermarkImageOpacity,
            selectable: false,
            evented: false,
            id: 'imageWatermark'
          });
          canvas.add(img);
          canvas.renderAll();
        });
      }
      canvas.renderAll();
      await new Promise(res => setTimeout(res, 100));
      const dataURL = canvas.toDataURL({ format: "png", quality: 1 });
      updatedImages[i] = dataURL;
      onSave(session.id, i, dataURL);
    }
    setCurrentImages(updatedImages);
    setEditedImages(new Set(Array.from({ length: updatedImages.length }, (_, i) => i)));
    setSelectedImageIndex(prevIndex);
    setShowSaveDialog(false);
    onClose();
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
    pushUndo();
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded) return;

    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (!mainImage) return;

    try {
      const existingFilters = mainImage.filters || [];
      const adjustmentFilters = existingFilters.filter((filter: any) => {
        return (
          (fabric.Image?.filters?.Brightness && filter instanceof fabric.Image.filters.Brightness) ||
          (fabric.Image?.filters?.Contrast && filter instanceof fabric.Image.filters.Contrast) ||
          (fabric.Image?.filters?.Saturation && filter instanceof fabric.Image.filters.Saturation)
        );
      });

      if (filterType === 'none') {
        mainImage.filters = adjustmentFilters;
        mainImage.applyFilters();
        canvas.renderAll();
        setSelectedFilter('none');
        return;
      }

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
          if (fabric.Image?.filters?.Contrast) {
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
          if (fabric.Image?.filters?.Saturation) {
            newFilters = newFilters.filter(f => !(fabric.Image?.filters?.Saturation && f instanceof fabric.Image.filters.Saturation));
            newFilters.push(new fabric.Image.filters.Saturation({ saturation: 0.4 }));
          }
          if (fabric.Image?.filters?.Contrast) {
            newFilters = newFilters.filter(f => !(fabric.Image?.filters?.Contrast && f instanceof fabric.Image.filters.Contrast));
            newFilters.push(new fabric.Image.filters.Contrast({ contrast: 0.2 }));
          }
          break;
          
        case 'warm':
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
          if (fabric.Image?.filters?.Gamma) {
            newFilters.push(new fabric.Image.filters.Gamma({ 
              gamma: [1, 0.8, 0.8] 
            }));
          }
          if (fabric.Image?.filters?.Contrast) {
            newFilters = newFilters.filter(f => !(fabric.Image?.filters?.Contrast && f instanceof fabric.Image.filters.Contrast));
            newFilters.push(new fabric.Image.filters.Contrast({ contrast: 0.25 }));
          }
          if (fabric.Image?.filters?.Brightness) {
            newFilters = newFilters.filter(f => !(fabric.Image?.filters?.Brightness && f instanceof fabric.Image.filters.Brightness));
            newFilters.push(new fabric.Image.filters.Brightness({ brightness: 0.1 }));
          }
          break;
      }

      mainImage.filters = newFilters;
      mainImage.applyFilters();
      canvas.renderAll();
      setSelectedFilter(filterType);
      
      if (filterType !== 'none') {
        setEditedImages(prev => new Set(prev).add(selectedImageIndex));
      }
    } catch (error) {
      console.error('Error applying filter:', error);
      if (filterType === 'blackwhite') {
        mainImage.filters = [new fabric.Image.filters.Grayscale()];
        mainImage.applyFilters();
        canvas.renderAll();
        setSelectedFilter(filterType);
      }
    }
  };

  // Crop functions
  const enableCropping = () => {
    pushUndo();
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
        stroke: '#009c00ff', // Changed from '#ff0000' to dark green
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

  const cancelCrop = () => {
    pushUndo();
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
    pushUndo();
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

  // Adjustment functions with increment/decrement
  const adjustBrightness = (increment: boolean) => {
    pushUndo();
    const newValue = increment ? Math.min(brightness + 5, 100) : Math.max(brightness - 5, -100);
    setBrightness(newValue);
    applyImageFilter('brightness', newValue / 100);
    if (newValue !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  const adjustContrast = (increment: boolean) => {
    pushUndo();
    const newValue = increment ? Math.min(contrast + 5, 100) : Math.max(contrast - 5, -100);
    setContrast(newValue);
    applyImageFilter('contrast', newValue / 100);
    if (newValue !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  const adjustSaturation = (increment: boolean) => {
    pushUndo();
    const newValue = increment ? Math.min(saturation + 5, 100) : Math.max(saturation - 5, -100);
    setSaturation(newValue);
    applyImageFilter('saturation', newValue / 100);
    if (newValue !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  const applyBrightness = (value: number) => {
    pushUndo();
    setBrightness(value);
    applyImageFilter('brightness', value / 100);
    if (value !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  const applyContrast = (value: number) => {
    pushUndo();
    setContrast(value);
    applyImageFilter('contrast', value / 100);
    if (value !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  const applySaturation = (value: number) => {
    pushUndo();
    setSaturation(value);
    applyImageFilter('saturation', value / 100);
    if (value !== 0) {
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  const applyImageFilter = (filterType: string, value: number) => {
    pushUndo();
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded) return;

    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (!mainImage) return;

    const existingFilters = mainImage.filters || [];
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

    mainImage.filters = newFilter ? [...otherFilters, newFilter] : otherFilters;
    mainImage.applyFilters();
    canvas.renderAll();
    
    // If we have a selected filter, reapply it to maintain the artistic effect
    if (selectedFilter && selectedFilter !== 'none') {
      setTimeout(() => applyFilter(selectedFilter), 50);
    }
  };

  // Frame functions (improved centering)
  const applyFrame = (frameType: string) => {
    pushUndo();
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded) return;

    // Remove existing frame(s)
    canvas.getObjects().filter((obj: any) => obj.id === 'frame').forEach((obj: any) => canvas.remove(obj));

    if (frameType === 'none') {
      setSelectedFrame('none');
      canvas.renderAll();
      return;
    }

    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (!mainImage) return;

    // Get the exact bounds of the main image
    const imageBounds = mainImage.getBoundingRect(true);
    const frameWidth = frameSize; // Use state
    
    let frameRect;
    
    switch (frameType) {
      case 'classic':
        frameRect = new fabric.Rect({
          left: imageBounds.left - frameWidth,
          top: imageBounds.top - frameWidth,
          width: imageBounds.width + (frameWidth * 2),
          height: imageBounds.height + (frameWidth * 2),
          fill: '#8B4513',
          stroke: '#654321',
          strokeWidth: 2,
          selectable: true, // Make frame movable/resizable
          evented: true,    // Make frame movable/resizable
          id: 'frame'
        });
        break;
      case 'modern':
        frameRect = new fabric.Rect({
          left: imageBounds.left - frameWidth,
          top: imageBounds.top - frameWidth,
          width: imageBounds.width + (frameWidth * 2),
          height: imageBounds.height + (frameWidth * 2),
          fill: '#2c3e50',
          stroke: '#34495e',
          strokeWidth: 1,
          selectable: true, // Make frame movable/resizable
          evented: true,    // Make frame movable/resizable
          id: 'frame'
        });
        break;
      case 'vintage':
        frameRect = new fabric.Rect({
          left: imageBounds.left - frameWidth,
          top: imageBounds.top - frameWidth,
          width: imageBounds.width + (frameWidth * 2),
          height: imageBounds.height + (frameWidth * 2),
          fill: '#d4af37',
          stroke: '#b8860b',
          strokeWidth: 3,
          selectable: true, // Make frame movable/resizable
          evented: true,    // Make frame movable/resizable
          id: 'frame'
        });
        break;
      case 'polaroid':
        frameRect = new fabric.Rect({
          left: imageBounds.left - frameWidth,
          top: imageBounds.top - frameWidth,
          width: imageBounds.width + (frameWidth * 2),
          height: imageBounds.height + (frameWidth * 3), // Extra space at bottom
          fill: '#ffffff',
          stroke: '#cccccc',
          strokeWidth: 1,
          selectable: true, // Make frame movable/resizable
          evented: true,    // Make frame movable/resizable
          id: 'frame'
        });
        break;
      case 'ornate':
        frameRect = new fabric.Rect({
          left: imageBounds.left - frameWidth,
          top: imageBounds.top - frameWidth,
          width: imageBounds.width + (frameWidth * 2),
          height: imageBounds.height + (frameWidth * 2),
          fill: '#ffd700',
          stroke: '#ff8c00',
          strokeWidth: 4,
          selectable: true, // Make frame movable/resizable
          evented: true,    // Make frame movable/resizable
          id: 'frame'
        });
        break;
    }

    if (frameRect) {
      canvas.add(frameRect);
      canvas.sendToBack(frameRect); // Frame always behind
      canvas.bringToFront(mainImage); // Image always above frame
      canvas.renderAll();
      setSelectedFrame(frameType);
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
    }
  };

  // Border functions (improved centering)
  const applyBorder = (borderType: string) => {
    // Ensure pushUndo is called BEFORE any canvas mutation
    pushUndo();
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || !isImageLoaded) return;

    // Remove existing border(s)
    canvas.getObjects().filter((obj: any) => obj.id === 'border' || obj.id === 'innerBorder').forEach((obj: any) => canvas.remove(obj));

    if (borderType === 'none') {
      setSelectedBorder('none');
      canvas.renderAll();
      setEditedImages(prev => new Set(prev).add(selectedImageIndex));
      return;
    }

    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (!mainImage) return;

    // Get the exact bounds of the main image
    const imageBounds = mainImage.getBoundingRect(true);
    // Use the center of the image bounds for the border
    const centerX = imageBounds.left + imageBounds.width / 2;
    const centerY = imageBounds.top + imageBounds.height / 2;

    let borderRect;
    let strokeDashArray: number[] | undefined;

    switch (borderType) {
      case 'solid':
        strokeDashArray = undefined;
        break;
      case 'dashed':
        strokeDashArray = [10, 5];
        break;
      case 'dotted':
        strokeDashArray = [2, 3];
        break;
      case 'double':
        strokeDashArray = undefined;
        break;
      case 'rounded':
        strokeDashArray = undefined;
        break;
    }

    borderRect = new fabric.Rect({
      left: centerX,
      top: centerY,
      originX: 'center',
      originY: 'center',
      width: imageBounds.width + borderWidth,
      height: imageBounds.height + borderWidth,
      fill: 'transparent',
      stroke: borderColor,
      strokeWidth: borderWidth,
      strokeDashArray: strokeDashArray,
      rx: borderType === 'rounded' ? 10 : 0,
      ry: borderType === 'rounded' ? 10 : 0,
      selectable: true, // Make border movable/resizable
      evented: true,    // Make border movable/resizable
      id: 'border'
    });

    if (borderType === 'double') {
      // Create inner border for double effect
      const innerBorder = new fabric.Rect({
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        width: imageBounds.width - borderWidth,
        height: imageBounds.height - borderWidth,
        fill: 'transparent',
        stroke: borderColor,
        strokeWidth: Math.max(1, borderWidth / 3),
        selectable: false,
        evented: false,
        id: 'innerBorder'
      });
      canvas.add(innerBorder);
    }

    canvas.add(borderRect);
    // Always bring main image to front after adding border
    canvas.bringToFront(mainImage);
    canvas.renderAll();
    setSelectedBorder(borderType);
    setEditedImages(prev => new Set(prev).add(selectedImageIndex));
  };

  // Watermark functions
  const addTextWatermark = () => {
    pushUndo();
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric || watermarkText.trim() === "" || !isImageLoaded) return;
    // Remove existing text watermark if any
    const existingTextWatermark = canvas.getObjects().find((obj: any) => obj.id === 'textWatermark');
    if (existingTextWatermark) {
      canvas.remove(existingTextWatermark);
    }

    const textWatermark = new fabric.Text(watermarkText, {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      fontFamily: 'Arial',
      fontSize: watermarkSize,
      fill: watermarkColor,
      opacity: watermarkOpacity, // <-- ensure opacity is set
      selectable: true,
      evented: true,
      id: 'textWatermark'
    });

    canvas.add(textWatermark);
    canvas.setActiveObject(textWatermark);
    canvas.renderAll();
    
    setEditedImages(prev => new Set(prev).add(selectedImageIndex));
  };

  const addImageWatermark = (e: React.ChangeEvent<HTMLInputElement>) => {
    pushUndo();
    const file = e.target.files?.[0];
    if (!file || !fabric || !isImageLoaded) return;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgSrc = event.target?.result as string;
      
      fabric.Image.fromURL(imgSrc, (img: any) => {
        // Set fixed initial size (small)
        const fixedSize = 100;
        const scale = fixedSize / Math.max(img.width!, img.height!);
        
        img.scale(scale);
        img.set({
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          opacity: watermarkImageOpacity,
          selectable: true,
          evented: true,
          id: 'imageWatermark'
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        
        setEditedImages(prev => new Set(prev).add(selectedImageIndex));
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  // Reset function
  const resetImage = () => {
    pushUndo();
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setSelectedFrame('none');
    setSelectedBorder('none');
    setSelectedFilter('none');
    setIsCropping(false);
    
    if (currentImages[selectedImageIndex]) {
      loadImageToCanvas(currentImages[selectedImageIndex]);
    }
    
    setEditedImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(selectedImageIndex);
      return newSet;
    });
    setTimeout(() => {
      syncToolStateWithCanvas();
    }, 100);
  };

  const confirmDeleteImage = () => {
    if (imageToDelete !== null && onDeleteImage) {
      onDeleteImage(session.id, imageToDelete);
      setShowDeleteDialog(false);
      setImageToDelete(null);
    }
  };

  const handleDeleteImageClick = (index: number) => {
    setImageToDelete(index);
    setShowDeleteDialog(true);
  };

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      // Optional: Implement auto-save logic here
    }, 5000); // 5 seconds

    setAutoSaveTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [brightness, contrast, saturation, selectedFilter, selectedFrame, selectedBorder]);

  // Live update watermark size
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric) return;
    const textWatermark = canvas.getObjects().find((obj) => obj.id === 'textWatermark');
    if (textWatermark) {
      textWatermark.set({ fontSize: watermarkSize });
      canvas.renderAll();
    }
  }, [watermarkSize]);

  // Live update watermark opacity
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric) return;
    const textWatermark = canvas.getObjects().find((obj) => obj.id === 'textWatermark');
    if (textWatermark) {
      textWatermark.set({ opacity: watermarkOpacity });
      canvas.renderAll();
    }
  }, [watermarkOpacity]);

  // Live update watermark color
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric) return;
    const textWatermark = canvas.getObjects().find((obj) => obj.id === 'textWatermark');
    if (textWatermark) {
      textWatermark.set({ fill: watermarkColor });
      canvas.renderAll();
    }
  }, [watermarkColor]);

  // Live update image watermark opacity
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !fabric) return;
    const imageWatermark = canvas.getObjects().find((obj) => obj.id === 'imageWatermark');
    if (imageWatermark) {
      imageWatermark.set({ opacity: watermarkImageOpacity });
      canvas.renderAll();
    }
  }, [watermarkImageOpacity]);

  // Helper to sync React tool state with canvas objects and re-apply to canvas
  const syncToolStateWithCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    // Border
    const borderObj = canvas.getObjects().find((obj: any) => obj.id === 'border');
    if (borderObj) {
      // Determine border type from strokeDashArray and rx/ry
      let borderType = 'solid';
      if (borderObj.strokeDashArray && borderObj.strokeDashArray.length) {
        if (borderObj.strokeDashArray[0] === 10 && borderObj.strokeDashArray[1] === 5) borderType = 'dashed';
        else if (borderObj.strokeDashArray[0] === 2 && borderObj.strokeDashArray[1] === 3) borderType = 'dotted';
      } else if (borderObj.rx === 10 && borderObj.ry === 10) {
        borderType = 'rounded';
      }
      setSelectedBorder(borderType);
      setBorderWidth(borderObj.strokeWidth || 10);
      setBorderColor(borderObj.stroke || '#000000');
    } else {
      setSelectedBorder('none');
      setBorderWidth(10);
      setBorderColor('#000000');
    }
    // Frame
    const frameObj = canvas.getObjects().find((obj: any) => obj.id === 'frame');
    setSelectedFrame(frameObj ? 'classic' : 'none');
    // Filter (try to detect grayscale, sepia, etc.)
    const mainImage = canvas.getObjects().find((obj: any) => obj.id === 'mainImage');
    if (mainImage && mainImage.filters && mainImage.filters.length > 0) {
      const hasGrayscale = mainImage.filters.some((f: any) => f && f.type === 'Grayscale');
      const hasSepia = mainImage.filters.some((f: any) => f && f.type === 'Sepia');
      setSelectedFilter(hasGrayscale ? 'blackwhite' : hasSepia ? 'sepia' : 'none');
    } else {
      setSelectedFilter('none');
    }
    // Cropping
    const hasCrop = canvas.getObjects().some((obj: any) => obj.id === 'cropRect');
    setIsCropping(hasCrop);
    // Enable edits if main image is present
    setIsImageLoaded(!!mainImage);
  };

  // Helper to extract border info from a Fabric.js JSON state
  function extractBorderFromJSON(json) {
    if (!json || !json.objects) return null;
    const borderObj = json.objects.find(obj => obj.id === 'border');
    if (!borderObj) return null;
    let borderType = 'solid';
    if (borderObj.strokeDashArray && borderObj.strokeDashArray.length) {
      if (borderObj.strokeDashArray[0] === 10 && borderObj.strokeDashArray[1] === 5) borderType = 'dashed';
      else if (borderObj.strokeDashArray[0] === 2 && borderObj.strokeDashArray[1] === 3) borderType = 'dotted';
    } else if (borderObj.rx === 10 && borderObj.ry === 10) {
      borderType = 'rounded';
    }
    return {
      type: borderType,
      color: borderObj.stroke || '#000000',
      width: borderObj.strokeWidth || 10
    };
  }

  // Undo handler
  const handleUndo = () => {
    if (undoStack.length === 0 || !fabricCanvasRef.current) return;
    const prevState = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    const currentState = JSON.parse(JSON.stringify(fabricCanvasRef.current.toJSON()));
    setRedoStack(r => [...r, currentState]);
    console.log('Undo: loading prevState', prevState);
    fabricCanvasRef.current.loadFromJSON(prevState, () => {
      fabricCanvasRef.current.renderAll();
      syncToolStateWithCanvas();
      // Bulletproof: If main image is missing, reload and re-apply border
      const mainImage = fabricCanvasRef.current.getObjects().find((obj: any) => obj.id === 'mainImage');
      if (mainImage) {
        setIsImageLoaded(true);
      } else {
        // Extract border info from prevState
        const borderInfo = extractBorderFromJSON(prevState);
        if (currentImages[selectedImageIndex]) {
          loadImageToCanvas(currentImages[selectedImageIndex]).then(() => {
            // Re-apply border if needed
            if (borderInfo && borderInfo.type !== 'none') {
              setBorderColor(borderInfo.color);
              setBorderWidth(borderInfo.width);
              applyBorder(borderInfo.type);
            }
          });
        } else {
          setIsImageLoaded(false);
        }
      }
    });
  };

  // Redo handler
  const handleRedo = () => {
    if (redoStack.length === 0 || !fabricCanvasRef.current) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    const currentState = JSON.parse(JSON.stringify(fabricCanvasRef.current.toJSON()));
    setUndoStack(u => [...u, currentState]);
    console.log('Redo: loading nextState', nextState);
    fabricCanvasRef.current.loadFromJSON(nextState, () => {
      fabricCanvasRef.current.renderAll();
      syncToolStateWithCanvas();
      // Bulletproof: If main image is missing, reload and re-apply border
      const mainImage = fabricCanvasRef.current.getObjects().find((obj: any) => obj.id === 'mainImage');
      const borderObj = fabricCanvasRef.current.getObjects().find((obj: any) => obj.id === 'border');
      console.log('After redo: mainImage present?', !!mainImage, 'border present?', !!borderObj);
      if (mainImage) {
        setIsImageLoaded(true);
      } else {
        // Extract border info from nextState
        const borderInfo = extractBorderFromJSON(nextState);
        if (currentImages[selectedImageIndex]) {
          loadImageToCanvas(currentImages[selectedImageIndex]).then(() => {
            // Re-apply border if needed
            if (borderInfo && borderInfo.type !== 'none') {
              setBorderColor(borderInfo.color);
              setBorderWidth(borderInfo.width);
              applyBorder(borderInfo.type);
            }
          });
        } else {
          setIsImageLoaded(false);
        }
      }
    });
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
              onClick={saveAllImages}
              className="bg-green-600 hover:bg-green-700"
              disabled={!isImageLoaded}
            >
              <Save className="h-4 w-4 mr-2" />
              Save All
            </Button>
            {/* Undo/Redo Buttons */}
            <Button onClick={handleUndo} disabled={undoStack.length === 0} variant="outline" className="ml-2">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button onClick={handleRedo} disabled={redoStack.length === 0} variant="outline">
              <RotateCw className="h-4 w-4" />
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
                              <Button onClick={cancelCrop} className="w-full" variant="outline">
                                Cancel Crop
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
                              Left
                            </Button>
                            <Button 
                              onClick={() => rotateImage('right')} 
                              variant="outline" 
                              className="flex-1"
                              disabled={!isImageLoaded}
                            >
                              <RotateCw className="h-4 w-4 mr-2" />
                              Right
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
                              step="1"
                              value={brightness}
                              onChange={(e) => applyBrightness(Number(e.target.value))}
                              className="w-full"
                              disabled={!isImageLoaded}
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => adjustBrightness(false)}
                                disabled={!isImageLoaded || brightness <= -100}
                                className="flex-1"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => adjustBrightness(true)}
                                disabled={!isImageLoaded || brightness >= 100}
                                className="flex-1"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
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
                              step="1"
                              value={contrast}
                              onChange={(e) => applyContrast(Number(e.target.value))}
                              className="w-full"
                              disabled={!isImageLoaded}
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => adjustContrast(false)}
                                disabled={!isImageLoaded || contrast <= -100}
                                className="flex-1"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => adjustContrast(true)}
                                disabled={!isImageLoaded || contrast >= 100}
                                className="flex-1"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
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
                              step="1"
                              value={saturation}
                              onChange={(e) => applySaturation(Number(e.target.value))}
                              className="w-full"
                              disabled={!isImageLoaded}
                            />
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => adjustSaturation(false)}
                                disabled={!isImageLoaded || saturation <= -100}
                                className="flex-1"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => adjustSaturation(true)}
                                disabled={!isImageLoaded || saturation >= 100}
                                className="flex-1"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Filter Tools */}
                      {category.id === 'filter' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {filterOptions.map((filter) => {
                              const IconComponent = filter.icon;
                              return (
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
                                  <IconComponent className="text-lg mb-1" style={{ color: filter.color }} />
                                  <span className="text-[10px] leading-tight text-center">{filter.label}</span>
                                </Button>
                              );
                            })}
                          </div>
                          
                        </div>
                      )}

                      {/* Frame Tools */}
                      {category.id === 'frame' && (
                        <div className="grid grid-cols-3 gap-2">
                          {frameOptions.map((frame) => {
                            const IconComponent = frame.icon;
                            return (
                              <Button
                                key={frame.value}
                                variant={selectedFrame === frame.value ? "default" : "outline"}
                                className="h-16 flex flex-col items-center justify-center p-2"
                                onClick={() => applyFrame(frame.value)}
                                disabled={!isImageLoaded}
                              >
                                <IconComponent className="text-2xl mb-1" />
                                <span className="text-xs">{frame.label}</span>
                              </Button>
                            );
                          })}
                        </div>
                      )}

                      {/* Border Tools */}
                      {category.id === 'border' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            {borderOptions.map((border) => {
                              const IconComponent = border.icon;
                              return (
                                <Button
                                  key={border.value}
                                  variant={selectedBorder === border.value ? "default" : "outline"}
                                  className="h-16 flex flex-col items-center justify-center p-2"
                                  onClick={() => applyBorder(border.value)}
                                  disabled={!isImageLoaded}
                                >
                                  <IconComponent className="text-2xl mb-1" />
                                  <span className="text-xs">{border.label}</span>
                                </Button>
                              );
                            })}
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
                                    // Update border object if present and selectable
                                    const canvas = fabricCanvasRef.current;
                                    if (canvas) {
                                      const borderObj = canvas.getObjects().find((obj: any) => obj.id === 'border');
                                      if (borderObj) {
                                        borderObj.set({ strokeWidth: Number(e.target.value) });
                                        canvas.renderAll();
                                      }
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
                                  }}
                                  className="w-full h-10"
                                  disabled={!isImageLoaded}
                                />
                              </div>
                            </div>
                          )}
                          {selectedBorder !== 'none' && (
                            <Button
                              className="w-full mt-2"
                              onClick={() => applyBorder(selectedBorder)}
                              disabled={!isImageLoaded}
                            >
                              Apply Border Changes
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Watermark Tools */}
                      {category.id === 'watermark' && (
                        <div className="space-y-8">
                          {/* Minimal Text Watermark Section */}
                          <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-1">Text Watermark</h4>
                            <Input
                              placeholder="watermark text"
                              value={watermarkText}
                              onChange={(e) => setWatermarkText(e.target.value)}
                              disabled={!isImageLoaded}
                              className="mb-1 text-base px-3 py-2"
                            />
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-4">
                                <div className="flex-1 flex flex-col gap-1">
                                  <span className="text-xs text-gray-500">Size</span>
                                  <Input
                                    type="range"
                                    min="12"
                                    max="72"
                                    value={watermarkSize}
                                    onChange={(e) => setWatermarkSize(Number(e.target.value))}
                                    disabled={!isImageLoaded}
                                    className="w-full h-2"
                                    style={{ accentColor: '#888' }}
                                  />
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                  <span className="text-xs text-gray-500">Opacity</span>
                                  <Input
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.01"
                                    value={watermarkOpacity}
                                    onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                                    disabled={!isImageLoaded}
                                    className="w-full h-2"
                                    style={{ accentColor: '#888' }}
                                  />
                                </div>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Color</span>
                                <div className="flex items-center gap-3 mt-1 mb-4">
                                  {[
                                    { name: 'Black', value: '#000000' },
                                    { name: 'White', value: '#FFFFFF' },
                                    { name: 'Red', value: '#FF0000' },
                                    { name: 'Blue', value: '#0074D9' },
                                    { name: 'Yellow', value: '#FFDC00' },
                                  ].map((swatch) => (
                                    <button
                                      key={swatch.value}
                                      type="button"
                                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-150 ${watermarkColor.toLowerCase() === swatch.value.toLowerCase() ? 'border-blue-400 scale-110' : 'border-gray-200'}`}
                                      style={{ backgroundColor: swatch.value }}
                                      onClick={() => setWatermarkColor(swatch.value)}
                                      aria-label={swatch.name}
                                    />
                                  ))}
                                </div>
                                <div className="flex justify-center mt-2 mb-4">
                                  <HexColorPicker 
                                    color={watermarkColor} 
                                    onChange={setWatermarkColor} 
                                    style={{ width: 120, height: 120, borderRadius: '9999px', boxShadow: 'none' }}
                                  />
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={addTextWatermark}
                              variant="ghost"
                              className="w-full py-2 text-base font-medium border border-gray-200 dark:border-slate-700 mt-4"
                              disabled={!isImageLoaded || !watermarkText.trim()}
                            >
                              Add Text Watermark
                            </Button>
                          </div>
                          {/* Divider and Image Watermark section remain unchanged */}
                          <div className="border-t border-gray-200 dark:border-slate-700 my-2" />
                          {/* Image Watermark Card */}
                          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 flex flex-col gap-4 border border-gray-100 dark:border-slate-700">
                            <h4 className="font-semibold text-base mb-1">Image Watermark</h4>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-medium">Opacity</label>
                              <Input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.01"
                                value={watermarkImageOpacity}
                                onChange={(e) => setWatermarkImageOpacity(Number(e.target.value))}
                                disabled={!isImageLoaded}
                                className="w-full h-3"
                              />
                              <span className="text-xs text-gray-500">{Math.round(watermarkImageOpacity * 100)}%</span>
                            </div>
                            <Button
                              onClick={() => watermarkInputRef.current?.click()}
                              variant="outline"
                              className="w-full py-3 text-base font-semibold"
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
            {/* Frame Size Slider - only show if a frame is selected */}
            {selectedFrame !== 'none' && (
              <div className="w-full max-w-xs mt-4 flex flex-col items-center">
                <label className="text-sm font-medium mb-1">Frame Size: {frameSize}px</label>
                <Input
                  type="range"
                  min="-50"
                  max="100"
                  value={frameSize}
                  onChange={e => {
                    setFrameSize(Number(e.target.value));
                    if (selectedFrame !== 'none') {
                      applyFrame(selectedFrame);
                    }
                  }}
                  className="w-full"
                  disabled={!isImageLoaded}
                />
              </div>
            )}
            {/* Save Changes and Reset Buttons below canvas */}
            <div className="mt-4 flex gap-3">
              <Button 
                onClick={saveCurrentImage}
                className={`px-8 py-2 ${isCropping ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={!isImageLoaded}
              >
                <Save className="h-4 w-4 mr-2" />
                {isCropping ? 'Apply Crop & Save' : 'Save Changes'}
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
                  className={`relative cursor-pointer overflow-hidden transition-all duration-200 ${
                    selectedImageIndex === index
                      ? "ring-2 ring-blue-400 bg-blue-50" // Premium highlight
                      : "bg-white"
                  }`}
                  style={{ borderRadius: '1rem', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, minWidth: 0 }}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                    style={{ aspectRatio: '1 / 1', display: 'block' }}
                  />
                  {/* Edited Badge */}
                  {editedImages.has(index) && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Edited
                    </div>
                  )}
                  {selectedImageIndex === index && (
                    <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center pointer-events-none">
                      <span className="text-white font-semibold">Editing</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}