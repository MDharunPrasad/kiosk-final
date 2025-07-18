import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, ChevronLeft, ChevronRight, Plus, Trash2, Minus, ShoppingCart, Edit, Loader2 } from "lucide-react";
import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PhotoEditor } from "./PhotoEditor";
import { useCart } from "../context/CartContext";
import { Session, useNavigate } from "react-router-dom";
import { ApiSession, CounterStaffDashboardProps } from "@/types/types";
import { deleteSession, searchSessions } from "@/apis/sessions";
import { searchPhotos, deletePhoto } from "@/apis/photos";
import { BASE_URL } from "@/constants";
import Header from "@/Layout/Header";


export function CounterStaffDashboard({ username }: CounterStaffDashboardProps) {
  const empty_session={
    id: "",session_name: "",tag_name: "",photographer_id: null,customer_name: "",
    location: "",created_at: "",updated_at: "",photos:[{ id: "",session_id: null,file_path: "",
    edited_path: "",uploaded_at: "",last_updated_at: "",image_data:""
    }]
  }
  const [selectedSession, setSelectedSession] = useState<ApiSession>(empty_session);
  const [lastSession, setLastSession] = useState<ApiSession | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [photographers, setPhotographers] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPhotographer, setSelectedPhotographer] = useState(null); // Added state for selectedPhotographer
  const [sessions, setSessions] = useState<ApiSession[]>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [zoom, setZoom] = useState(1);
  const { cartItems, addToCart } = useCart();
  const navigate = useNavigate();
  
  // Warning dialog states
  const [showSessionDeleteDialog, setShowSessionDeleteDialog] = useState(false);
  const [showPhotoDeleteDialog, setShowPhotoDeleteDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<{ sessionId: string; photoIndex: number } | null>(null);
  const [showCartWarningDialog, setShowCartWarningDialog] = useState(false);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Photo editor state
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<{ [sessionId: string]: number[] }>({});

  
  // Fetch the latest 8 sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [selectedDate,selectedPhotographer]);
  
  useEffect(() => {
    async function fetchPhotographers(): Promise<void> {
      try {
        const response = await fetch(`${BASE_URL}/users/?role=photographer`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any necessary auth headers
            // 'Authorization': `Bearer ${token}`
          },
        });
     const data = await response.json();
        setPhotographers(data)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
       setError("Failed to fetch Photographers");
      }
    }
    fetchPhotographers()
  }, []);

  
  // Fetch sessions
  const fetchSessions = async () => {
        try {
          setSessions([])
          setSelectedSession(empty_session)
          setLastSession(empty_session)
          setCurrentImageIndex(0)
          setIsLoadingSessions(true)
          const results = await searchSessions(selectedDate,selectedPhotographer,"8");
          setSessions(results);
          setError(null);
  
          // Set the first session as selected and fetch its photos
          if (results.length > 0) {
            setSelectedSession(results[0]);
            fetchSessionPhotos(results[0].id);
          }
        } catch (error) {
          setError("Failed to fetch sessions");
        }
        finally{
          setIsLoadingSessions(false)
        }
      };

    // Fetch photos for sessions
const fetchSessionPhotos = async (sessionId: string) => {
  try {
    setIsLoadingPhotos(true);
    setError(null);

  const photos = await searchPhotos(sessionId);

  // Update the selected session with the new images
  setSelectedSession(prevSession => {
    if (prevSession && prevSession.id === sessionId) {
      return {
        ...prevSession,
        photos: photos
      };
    }
    return prevSession;
  });

  // Update the sessions list
  setSessions(prevSessions =>
    prevSessions.map(session =>
      session.id === sessionId
        ? { ...session, photos: photos }
        : session
    )
  );

  setCurrentImageIndex(0);
  } catch (err) {
    console.error('Error fetching photos:', err);
    setError(err instanceof Error ? err.message : 'Failed to fetch photos');
  } finally {
    setIsLoadingPhotos(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("orderedSessions");
    window.location.href = "/";
  };

  // When logo is clicked, go back to last session (if any), else fallback to first session
  const handleBackToLastSession = () => {
    if (lastSession) {
      setSelectedSession(lastSession);
      setCurrentImageIndex(0);
    } else if (sessions.length > 0) {
      setSelectedSession(sessions[0]);
      setCurrentImageIndex(0);
    }
  };

  // const filteredSessions = sessions.filter(session => {
  //   // const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   //                      session.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase());
  //   const matchesDate = !selectedDate || session.created_at === selectedDate;
  //   const matchesPhotographer = !selectedPhotographer || session?.photographer_id === selectedPhotographer;
  //   return matchesDate && matchesPhotographer;
  // });

  const nextImage = () => {
    if (selectedSession.photos && currentImageIndex < selectedSession.photos.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // When a session is selected, remember the previous one as lastSession
  const handleSessionSelect = (session: ApiSession) => {
    setLastSession(selectedSession);
    setSelectedSession(session);
    fetchSessionPhotos(session.id);
    setCurrentImageIndex(0);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowSessionDeleteDialog(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
      await deleteSession(sessionToDelete)
      const updatedSessions = sessions.filter(session => session.id !== sessionToDelete);
      setSessions(updatedSessions);
      
      if (selectedSession?.id === sessionToDelete && updatedSessions.length > 0) {
        setSelectedSession(updatedSessions[0]);
        setCurrentImageIndex(0);
        fetchSessionPhotos(updatedSessions[0].id);
      }
      
      // If the deleted session was lastSession, clear it
      if (lastSession && lastSession.id === sessionToDelete) {
        setLastSession(null);
      }
      
      setShowSessionDeleteDialog(false);
      setSessionToDelete(null);
  };


  // const getSessionIcon = (type: string) => {
  //   const icons = {
  //     "Family": "F",
  //     "Wedding": "W",
  //     "Graduation": "G",
  //     "Corporate": "C"
  //   };
  //   return icons[type as keyof typeof icons] || "S";
  // };

  // const getStatusColor = (status: string) => {
  //   const colors = {
  //     "pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  //     "ready": "bg-blue-100 text-blue-800 border-blue-200",
  //     "completed": "bg-green-100 text-green-800 border-green-200"
  //   };
  //   return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  // };

   const handleDeletePhoto = (sessionId: string, photoIndex: number) => {
    setPhotoToDelete({ sessionId, photoIndex });
    setShowPhotoDeleteDialog(true);
  };

 const confirmDeletePhoto = async () => {
  if (!photoToDelete) return;

  const { sessionId, photoIndex } = photoToDelete;
  const session = sessions.find((s) => s.id === sessionId);
  if (!session || !session.photos) return;

  try {
    const photoId = session.photos[photoIndex].id;
    await deletePhoto(photoId);

    // Fetch updated photos
    const updatedPhotos = await searchPhotos(sessionId);

  // Update the selected session with the new images
  setSelectedSession(prevSession => {
    if (prevSession && prevSession.id === sessionId) {
      return {
        ...prevSession,
        photos: updatedPhotos
      };
    }
    return prevSession;
  });

  // Update the sessions list
  setSessions(prevSessions =>
    prevSessions.map(session =>
      session.id === sessionId
        ? { ...session, photos: updatedPhotos }
        : session
    )
  );


    // Adjust current image index
    if (photoIndex >= updatedPhotos.length) {
      setCurrentImageIndex(Math.max(0, updatedPhotos.length - 1));
    }

    setShowPhotoDeleteDialog(false);
    setPhotoToDelete(null);
  } catch (error) {
    setError("Failed to delete photo");
    console.error('Error in confirmDeletePhoto:', error);
  }
};

  const handleAddToCart = () => {
    const imageUrl = selectedSession.photos[currentImageIndex].image_data;
    if (!imageUrl) return;
    // Compose a CartItem
    const cartItem = {
      id: `${selectedSession.id}-${currentImageIndex}`,
      customer_name: `${selectedSession.customer_name} - ${currentImageIndex + 1}`,
      thumb: imageUrl,
      editInfo: "", // Add edit info if available
      printSizes: [
        { label: "4x6", price: 2.99 },
        { label: "6x8", price: 4.99 },
      ],
      selectedSize: "4x6",
      quantity: 1,
    };
    // Prevent duplicate
    if (cartItems.some(item => item.id === cartItem.id)) {
      alert("This photo is already in your cart");
      return;
    }
    addToCart(cartItem);
    alert(`Added photo ${currentImageIndex + 1} from ${selectedSession.customer_name} to cart`);
  };

  // Calculate the count of cart items (all sessions)
  const totalCartCount = cartItems.length;

  // Calculate total selected images across all sessions
  const totalSelectedCount = Object.values(selectedPhotos).reduce((sum, arr) => sum + arr.length, 0);

  const handleProceedToCart = () => {
    // For each selected photo in each session, add to cart if not already present
    Object.entries(selectedPhotos).forEach(([sessionId, indices]) => {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;
      indices.forEach(index => {
        const imageUrl = session.photos[index].image_data;
        if (!imageUrl) return;
        const cartItem = {
          id: `${session.id}-${index}`,
          customer_name: `${session.customer_name} - ${index + 1}`,
          thumb: imageUrl,
          editInfo: "", // Add edit info if available
          printSizes: [
            { label: "4x6", price: 2.99 },
            { label: "6x8", price: 4.99 },
          ],
          selectedSize: "4x6",
          quantity: 1,
        };
        if (!cartItems.some(item => item.id === cartItem.id)) {
          addToCart(cartItem);
        }
      });
    });
    navigate("/cart");
  };

  // Add this function after the other handler functions
  const handleSaveEditedImage = (sessionId: string, imageIndex: number, editedImageData: string) => {
    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          const updatedImages = [...session.photos];
          updatedImages[imageIndex].image_data = editedImageData;
          return { ...session, images: updatedImages };
        }
        return session;
      })
    );
    
    // Update the selected session if it's the one being edited
    setSelectedSession(prevSession => {
      if (prevSession.id === sessionId) {
        const updatedImages = [...prevSession.photos];
        updatedImages[imageIndex].image_data = editedImageData;
        return { ...prevSession, images: updatedImages };
      }
      return prevSession;
    });
  };


 // Loading state
  if (isLoadingSessions||isLoadingPhotos) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 flex flex-col overflow-hidden">
      {/* Top Header */}
      <Header/>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <div className="w-72 lg:w-80 bg-white dark:bg-slate-800 border-r border-border p-4 lg:p-6 flex flex-col flex-shrink-0 min-w-0 group">
          <h1 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Customer Sessions</h1>
          
          {/* Search */}
          {/* <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div> */}

          {/* Date Filter */}
          <div className="relative mb-6 w-full">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status and Photographer Filters Row */}
          <div className="mb-6 flex gap-2 items-center">
            {/* Photographer Dropdown Only */}
            <div className="relative w-full ">
              <select
                value={selectedPhotographer || {}}
                onChange={(e) => setSelectedPhotographer(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
               <option value="">All Photographers</option>
              {photographers.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {`${p.first_name} ${p.last_name}`}
                </option>
              ))}
            </select>
              <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </div>

          {/* Sessions List - Scrollable */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 mb-4 min-h-0 min-w-0 session-scrollbar">
            {error && <div className="text-red-600">{error}</div>}
            {sessions.length==0?<div className="text-red-600">No Sessions found</div>
            :sessions?.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionSelect(session)}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-90 min-w-0 max-w-full
                  ${selectedSession.id === session.id
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border border-green-300 shadow-md"
                    : "bg-muted/50 hover:bg-muted border border-transparent"}
                `}
                style={{ boxSizing: 'border-box' }}
              >
                <div className="flex items-center gap-3 min-w-0 max-w-full">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-border flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {/* {getSessionIcon(session.type)} */}
                  </div>
                  <div className="flex-1 min-w-0 max-w-full">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-sm truncate max-w-full">{session.session_name}</h3>
                      {/*
                        // To show the session status badge again, uncomment the line below:
                        <span className={`inline-flex items-center px-3 py-1 rounded-full border font-semibold text-xs shadow-sm ${getStatusColor(session.status)}`}
                          style={{ minWidth: 70, justifyContent: 'center', letterSpacing: '0.01em' }}>
                          {session.status}
                        </span>
                        */}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{session.created_at}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="p-1 h-auto hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 min-w-0">
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Main Image Area - Optimized space */}
            <div className="flex-1 p-4 flex flex-col relative min-w-0">
              {/* Customer name and date - compact header */}
              <div className="text-center mb-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">{selectedSession.session_name}</h2>
                  {/*
                  // To show the session status badge again, uncomment the line below:
                  <span className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(selectedSession.status)}`}>{selectedSession.status}</span>
                  */}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 text-center">{selectedSession.created_at}</p>
              </div>
              
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden flex items-center justify-center flex-1 min-h-0 pl-16 pb-16">
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  {!selectedSession.photos || selectedSession.photos.length === 0 ? (
                      <span className="text-gray-400">No images available</span>
                    ) : (
                    <div
                      className="relative flex items-center justify-center bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden"
                      style={{
                        width: '100%',
                        maxWidth: 'min(800px, 90vw)',
                        aspectRatio: '4/3',
                        minHeight: '300px',
                        maxHeight: 'min(70vh, 600px)',
                      }}
                    >
                      {/* Left navigation button inside canvas */}
                      {selectedSession.photos.length > 1 && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute"
                          style={{
                            left: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            borderRadius: '9999px',
                            background: 'linear-gradient(to right, #22c55e, #10b981)',
                            color: 'white',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                            zIndex: 40,
                          }}
                          onClick={prevImage}
                          disabled={currentImageIndex === 0}
                        >
                          <ChevronLeft className="h-6 w-6 text-white" />
                        </Button>
                      )}
                      {/* Right navigation button inside canvas */}
                      {selectedSession.photos.length > 1 && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute"
                          style={{
                            right: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            borderRadius: '9999px',
                            background: 'linear-gradient(to right, #22c55e, #10b981)',
                            color: 'white',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                            zIndex: 40,
                          }}
                          onClick={nextImage}
                          disabled={currentImageIndex === selectedSession.photos.length - 1}
                        >
                          <ChevronRight className="h-6 w-6 text-white" />
                        </Button>
                      )}
                      <img
                        src={selectedSession.photos[currentImageIndex].image_data}
                        alt="Session photo"
                        style={{
                          maxWidth: '90%',
                          maxHeight: '90%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          display: 'block',
                          background: 'transparent',
                          borderRadius: '1rem',
                        }}
                        loading="eager"
                        onError={(e) => {
                          // If image fails, try next image or show fallback
                          const newImages = selectedSession.photos.filter((_, i) => i !== currentImageIndex);
                          if (newImages.length > 0) {
                            setSelectedSession({ ...selectedSession, photos: newImages });
                            setCurrentImageIndex(0);
                          } else {
                            e.currentTarget.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Enhanced Thumbnails */}
              {!selectedSession.photos || selectedSession.photos.length === 0 ? (
                      <span className="text-gray-400">No images available</span>
                    ) : (
            <div className="w-72 lg:w-80 p-4 border-l border-border bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 overflow-y-auto flex-shrink-0">
              <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-white">Photos ({selectedSession.photos.length})</h3>
              
              {/* Action Buttons */}
              <div className="mb-4 space-y-2">
                <Button
                  onClick={() => setShowPhotoEditor(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Photos
                </Button>
              </div>

              {/* Photo Thumbnails */}
              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                {selectedSession.photos.map((image, index) => {
                  const isSelected = (selectedPhotos[selectedSession.id] || []).includes(index);
                  return (
                    <div
                      key={index}
                      className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-blue-400 bg-blue-50"
                          : "bg-white"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      {/* Static tick box for selection */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedPhotos((prev) => {
                            const current = prev[selectedSession.id] || [];
                            if (current.includes(index)) {
                              // Deselect
                              return { ...prev, [selectedSession.id]: current.filter(i => i !== index) };
                            } else {
                              // Select
                              return { ...prev, [selectedSession.id]: [...current, index] };
                            }
                          });
                        }}
                        className="absolute top-1 left-1 z-10 w-5 h-5 accent-green-500 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-green-400 cursor-pointer"
                        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                      />
                      {/* Square aspect ratio wrapper, object-cover for gallery look */}
                      <div className="w-full h-24 lg:h-32 aspect-square flex items-center justify-center rounded-lg overflow-hidden relative">
                        <img
                          src={image.image_data}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover bg-transparent rounded-lg"
                          loading="lazy"
                          onError={(e) => {
                            // Remove broken image from session
                            const newImages = selectedSession.photos.filter((_, i) => i !== index);
                            setSelectedSession({ ...selectedSession, photos: newImages });
                            // Also update in sessions state
                            const updatedSessions = sessions.map(session => {
                              if (session.id === selectedSession.id) {
                                return { ...session, images: newImages };
                              }
                              return session;
                            });
                            setSessions(updatedSessions);
                            if ((selectedPhotos[selectedSession.id] || []).includes(index)) {
                              setSelectedPhotos(prev => ({
                                ...prev,
                                [selectedSession.id]: (prev[selectedSession.id] || []).filter(i => i !== index)
                              }));
                            }
                            if (currentImageIndex >= newImages.length) {
                              setCurrentImageIndex(Math.max(0, newImages.length - 1));
                            }
                          }}
                        />
                      </div>
                      <button
                        className="absolute top-1 right-1 bg-white/80 hover:bg-red-100 text-red-600 rounded-full p-1 shadow"
                        style={{ zIndex: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(selectedSession.id, index);
                        }}
                        title="Delete image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>)}
          </div>
        </div>
        
        {/* Session Delete Warning Dialog */}
        <AlertDialog open={showSessionDeleteDialog} onOpenChange={setShowSessionDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Session</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this session? This action cannot be undone and will permanently remove all photos and customer details associated with this session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteSession}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Photo Delete Warning Dialog */}
        <AlertDialog open={showPhotoDeleteDialog} onOpenChange={setShowPhotoDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Photo</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this photo? This action cannot be undone and will permanently remove the photo from this session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeletePhoto}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Photo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cart Empty Warning Dialog */}
        <AlertDialog open={showCartWarningDialog} onOpenChange={setShowCartWarningDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cart is Empty</AlertDialogTitle>
              <AlertDialogDescription>
                Please add at least one photo to cart before proceeding.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowCartWarningDialog(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cart Dialog for current session */}
        <AlertDialog open={showCartDialog} onOpenChange={setShowCartDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Selected Photos in This Session</AlertDialogTitle>
              <AlertDialogDescription>
                {(() => {
                  const currentSessionCart = cartItems.filter(item => item.id.startsWith(`${selectedSession.id}-`));
                  if (currentSessionCart.length === 0) {
                    return <span>No photos from this session are in your cart.</span>;
                  }
                  return (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {currentSessionCart.map((item, idx) => (
                        <img
                          key={item.id}
                          src={item.thumb}
                          alt={`Selected photo ${idx + 1}`}
                          className="w-20 h-16 object-cover rounded shadow border"
                        />
                      ))}
                    </div>
                  );
                })()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowCartDialog(false)}>
                Close
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => {
                  setShowCartDialog(false);
                  alert('Cart confirmed!');
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Add Proceed to Cart button fixed at bottom right */}
      <button
        onClick={handleProceedToCart}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-full shadow-lg text-lg transition-all"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        disabled={totalSelectedCount === 0}
      >
        <ShoppingCart className="h-6 w-6" />
        Proceed to Cart ({totalSelectedCount})
      </button>

      {/* Photo Editor */}
      {showPhotoEditor && (
        <PhotoEditor
          session={selectedSession}
          onClose={() => setShowPhotoEditor(false)}
          onSave={handleSaveEditedImage}
        />
      )}
    </div>
  );
}