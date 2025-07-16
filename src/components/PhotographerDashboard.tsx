import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, ChevronLeft, ChevronRight, Plus, Trash2, Loader2 } from "lucide-react";
import { CreateSessionForm } from "./CreateSessionForm";
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

interface ApiSession {
  id: number;
  session_name: string;
  tag_name: string;
  photographer_id: number;
  customer_name: string;
  location: string;
  created_at: string;
  updated_at: string;
}

interface ApiPhoto {
  id: number;
  session_id: number;
  file_path: string;
  edited_path?: string;
  uploaded_at: string;
  last_updated_at: string;
}

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
}

interface PhotographerDashboardProps {
  username?: string;
}

export function PhotographerDashboard({ username }: PhotographerDashboardProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Warning dialog states
  const [showSessionDeleteDialog, setShowSessionDeleteDialog] = useState(false);
  const [showPhotoDeleteDialog, setShowPhotoDeleteDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<{ sessionId: string; photoIndex: number } | null>(null);

  const API_BASE_URL = "http://localhost:8002";

  // Convert API session to internal format
  const convertApiSessionToSession = (apiSession: ApiSession): Session => {
    return {
      id: apiSession.id.toString(),
      name: apiSession.session_name,
      date: new Date(apiSession.created_at).toISOString().split('T')[0],
      type: apiSession.tag_name || "Custom",
      images: [], // Will be loaded separately
      customerDetails: {
        name: apiSession.customer_name,
        location: apiSession.location,
        date: new Date(apiSession.created_at).toISOString().split('T')[0]
      }
    };
  };

  // Fetch sessions from API
  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/sessions/?photographer_id=15`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }
      
      const apiSessions: ApiSession[] = await response.json();
      const convertedSessions = apiSessions.map(convertApiSessionToSession);
      
      setSessions(convertedSessions);
      
      // Select first session by default
      if (convertedSessions.length > 0) {
        setSelectedSession(convertedSessions[0]);
        fetchPhotosForSession(convertedSessions[0].id);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Fetch photos for a specific session
  const fetchPhotosForSession = async (sessionId: string) => {
  try {
    setIsLoadingPhotos(true);
    setError(null);
    
    const response = await fetch(`${API_BASE_URL}/photos/?sessionid=${sessionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch photos: ${response.status}`);
    }
    
    const apiPhotos: ApiPhoto[] = await response.json();
    
    // Convert photo paths to full URLs
    const photoUrls = await Promise.all(apiPhotos.map(async photo => {
      try {
        const response = await fetch(`${API_BASE_URL}/photos/${photo.id}/file`);
        if (!response.ok) {
          console.error(`Failed to fetch photo file for ${photo.id}:`, response.status);
          return null;
        }
        
        // Since your API returns FileResponse directly, we can use the URL directly
        // or create a blob URL for better control
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        console.log('Photo blob URL:', url);
        return url;
      } catch (err) {
        console.error('Error fetching photo file:', err);
        return null;
      }
    }));
    
    const validPhotoUrls = photoUrls.filter(Boolean);
    
    // Update the selected session with the new images
    setSelectedSession(prevSession => {
      if (prevSession && prevSession.id === sessionId) {
        return {
          ...prevSession,
          images: validPhotoUrls
        };
      }
      return prevSession;
    });
    
    // Update the sessions list
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, images: validPhotoUrls }
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

  // Load sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const handleLogout = () => {
    window.location.reload();
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
    setShowCreateSession(false);
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || session.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const nextImage = () => {
    if (selectedSession && currentImageIndex < selectedSession.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // When a session is selected, remember the previous one as lastSession
  const handleSessionSelect = (session: Session) => {
    setLastSession(selectedSession);
    setSelectedSession(session);
    setCurrentImageIndex(0);
    setShowCreateSession(false);
    
    // Fetch photos for the selected session if not already loaded
    if (session.images.length === 0) {
      fetchPhotosForSession(session.id);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowSessionDeleteDialog(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.status}`);
      }
      
      const updatedSessions = sessions.filter(session => session.id !== sessionToDelete);
      setSessions(updatedSessions);
      
      if (selectedSession?.id === sessionToDelete && updatedSessions.length > 0) {
        setSelectedSession(updatedSessions[0]);
        setCurrentImageIndex(0);
        fetchPhotosForSession(updatedSessions[0].id);
      }
      
      // If the deleted session was lastSession, clear it
      if (lastSession && lastSession.id === sessionToDelete) {
        setLastSession(null);
      }
      
      setShowSessionDeleteDialog(false);
      setSessionToDelete(null);
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  const getSessionIcon = (type: string) => {
    const icons = {
      "Family": "F",
      "Wedding": "W",
      "Graduation": "G",
      "Corporate": "C",
      "SMITH_WED": "W",
      "Custom": "S"
    };
    return icons[type as keyof typeof icons] || "S";
  };

  const handleDeletePhoto = (sessionId: string, photoIndex: number) => {
    setPhotoToDelete({ sessionId, photoIndex });
    setShowPhotoDeleteDialog(true);
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete || !selectedSession) return;
    
    try {
      // Note: You'll need to implement a DELETE endpoint for photos
      // For now, we'll just remove it from the frontend
      const { sessionId, photoIndex } = photoToDelete;
      
      const newImages = selectedSession.images.filter((_, i) => i !== photoIndex);
      const updatedSession = { ...selectedSession, images: newImages };
      
      setSelectedSession(updatedSession);
      
      // Also update in sessions state
      const updatedSessions = sessions.map(s => {
        if (s.id === sessionId) {
          return updatedSession;
        }
        return s;
      });
      setSessions(updatedSessions);
      
      if (currentImageIndex >= newImages.length) {
        setCurrentImageIndex(Math.max(0, newImages.length - 1));
      }
      
      setShowPhotoDeleteDialog(false);
      setPhotoToDelete(null);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    }
  };

  // Add more photos handler
  const handleAddMorePhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !selectedSession) return;
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Note: You'll need to implement an upload endpoint
      // For now, we'll just create object URLs for preview
      const newImages = files.map(file => URL.createObjectURL(file));
      const updatedSession = {
        ...selectedSession,
        images: [...selectedSession.images, ...newImages],
      };
      
      setSelectedSession(updatedSession);
      
      // Also update in sessions state
      const updatedSessions = sessions.map(session =>
        session.id === selectedSession.id ? updatedSession : session
      );
      setSessions(updatedSessions);
      
      setShowUpdateSuccess(true);
      setTimeout(() => setShowUpdateSuccess(false), 3000);
      
      // Reset file input value
      event.target.value = "";
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    }
  };

  // Loading state
  if (isLoadingSessions) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading sessions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">Error</p>
            <p>{error}</p>
          </div>
          <Button onClick={fetchSessions} className="bg-blue-600 hover:bg-blue-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-border p-4 flex justify-between items-center shadow-sm flex-shrink-0">
        <button 
          onClick={handleBackToLastSession}
          className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-all duration-200 group"
        >
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Photo Kiosk</span>
        </button>
        
        <div className="flex items-center gap-8">
          <div className="text-left bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-4 py-2 rounded-lg shadow-sm border border-blue-200 dark:border-slate-600">
            <p className="font-bold text-slate-800 dark:text-slate-200 text-base">{username || "Photographer"}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{new Date().toLocaleDateString()}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Left Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-border p-6 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
          <h1 className="text-2xl font-bold mb-6">Sessions</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Filter */}
          <div className="relative mb-6">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sessions List - Scrollable */}
          <div className="flex-1 overflow-y-auto max-h-[480px] space-y-3 mb-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSessionSelect(session)}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                  selectedSession?.id === session.id
                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border border-blue-300 shadow-md"
                    : "bg-muted/50 hover:bg-muted border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white border border-border flex items-center justify-center text-sm font-bold">
                    {getSessionIcon(session.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{session.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{session.date}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="p-1 h-auto hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* New Session Button */}
          <div className="border-t border-border pt-3 mt-auto">
            <Button 
              onClick={() => setShowCreateSession(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {showCreateSession ? (
          <CreateSessionForm
            onCancel={() => {
              setShowCreateSession(false);
              if (lastSession) {
                setSelectedSession(lastSession);
                setCurrentImageIndex(0);
              }
            }}
            onSessionCreated={(newSession) => {
              // Note: You'll need to implement session creation API
              const sessionToAdd = {
                id: (sessions.length + 1).toString(),
                name: `${newSession.customerName} Session`,
                date: newSession.date,
                type: "Custom",
                images: newSession.photos.map(file => URL.createObjectURL(file)),
                customerDetails: {
                  name: newSession.customerName,
                  location: newSession.location,
                  date: newSession.date
                }
              };
              setSessions([sessionToAdd, ...sessions]);
              setLastSession(sessionToAdd);
              setSelectedSession(sessionToAdd);
              setCurrentImageIndex(0);
              setShowCreateSession(false);
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
            {selectedSession ? (
              <div className="flex-1 flex overflow-hidden">
                {/* Main Image Area */}
                <div className="flex-1 p-4 flex flex-col relative min-w-0">
                  {/* Customer name and date */}
                  <div className="text-center mb-3">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">{selectedSession.name}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{selectedSession.date}</p>
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden flex items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}>
                    <div className="absolute inset-0 flex items-center justify-center p-0" style={{ width: '100%', height: '100%' }}>
                      {isLoadingPhotos ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>Loading photos...</span>
                        </div>
                      ) : selectedSession.images.length === 0 ? (
                        <span className="text-gray-400">No images available</span>
                      ) : (
                        <div
                          className="relative flex items-center justify-center"
                          style={{
                            width: '100%',
                            maxWidth: '800px',
                            aspectRatio: '4/3',
                            background: '#fff',
                            borderRadius: '1.5rem',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
                            border: '1.5px solid #e5e7eb',
                            margin: '0 auto',
                            minHeight: '400px',
                            minWidth: '533px',
                            maxHeight: '70vh',
                            backgroundClip: 'padding-box',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          {/* Navigation buttons */}
                          {selectedSession.images.length > 1 && (
                            <>
                              <Button
                                variant="secondary"
                                size="icon"
                                className="absolute"
                                style={{
                                  left: 16,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  borderRadius: '9999px',
                                  background: 'linear-gradient(to right, #3b82f6, #6366f1)',
                                  color: 'white',
                                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                                  zIndex: 40,
                                }}
                                onClick={prevImage}
                                disabled={currentImageIndex === 0}
                              >
                                <ChevronLeft className="h-6 w-6 text-white" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="icon"
                                className="absolute"
                                style={{
                                  right: 16,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  borderRadius: '9999px',
                                  background: 'linear-gradient(to right, #3b82f6, #6366f1)',
                                  color: 'white',
                                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                                  zIndex: 40,
                                }}
                                onClick={nextImage}
                                disabled={currentImageIndex === selectedSession.images.length - 1}
                              >
                                <ChevronRight className="h-6 w-6 text-white" />
                              </Button>
                            </>
                          )}
                          <img
                            src={selectedSession.images[currentImageIndex]}
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
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Thumbnails */}
                <div className="w-80 p-4 border-l border-border bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 overflow-y-auto">
                  <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-white">Photos ({selectedSession.images.length})</h3>
                  <Button
                    className="mb-4 w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Add More Photos
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddMorePhotos}
                    className="hidden"
                  />
                  {showUpdateSuccess && (
                    <div className="mb-2 text-green-600 font-semibold text-center">Done successfully!</div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSession.images.map((image, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-[1.02] ${
                          currentImageIndex === index
                            ? "border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800"
                            : "border-gray-300 dark:border-slate-600 hover:border-blue-400 hover:shadow-md"
                        }`}
                      >
                        <div className="w-full h-32 aspect-[4/3] bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover bg-transparent rounded-lg"
                            loading="lazy"
                            onClick={() => setCurrentImageIndex(index)}
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
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">No session selected</p>
              </div>
            )}
          </div>
        )}
        
        {/* Delete Dialogs */}
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
      </div>
    </div>
  );
}