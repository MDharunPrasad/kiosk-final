import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { CreateSessionForm } from "./CreateSessionForm";

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

const mockSessions: Session[] = [
  {
    id: "1",
    name: "Family Portrait",
    date: "2024-07-20",
    type: "Family",
    images: [
      "lovable-uploads/6088a135-d271-4528-8e1b-a06cbbe58d03.png", // replaced with a valid local image
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&h=600&fit=crop",
    ],
    customerDetails: {
      name: "Johnson Family",
      location: "Central Park",
      date: "2024-07-20"
    }
  },
  {
    id: "2",
    name: "Wedding Photography",
    date: "2024-07-15",
    type: "Wedding",
    images: [
      "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=800&h=600&fit=crop",
    ],
    customerDetails: {
      name: "Sarah & Mike",
      location: "Riverside Gardens",
      date: "2024-07-15"
    }
  },
  {
    id: "3",
    name: "Graduation Photoshoot",
    date: "2024-07-10",
    type: "Graduation",
    images: [
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&h=600&fit=crop",
    ],
    customerDetails: {
      name: "Emily Rodriguez",
      location: "University Campus",
      date: "2024-07-10"
    }
  },
  {
    id: "4",
    name: "Corporate Headshots",
    date: "2024-07-05",
    type: "Corporate",
    images: [
      "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=800&h=600&fit=crop",
    ],
    customerDetails: {
      name: "Tech Solutions Inc",
      location: "Office Building",
      date: "2024-07-05"
    }
  }
];

interface PhotographerDashboardProps {
  username?: string;
}

export function PhotographerDashboard({ username }: PhotographerDashboardProps) {
  const [selectedSession, setSelectedSession] = useState<Session>(mockSessions[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  const handleLogout = () => {
    window.location.reload();
  };

  const handleBackToLogin = () => {
    // Stay on dashboard instead of going to login
    setSelectedSession(sessions[0]);
    setCurrentImageIndex(0);
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || session.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const nextImage = () => {
    if (currentImageIndex < selectedSession.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setCurrentImageIndex(0);
  };

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    
    if (selectedSession.id === sessionId && updatedSessions.length > 0) {
      setSelectedSession(updatedSessions[0]);
      setCurrentImageIndex(0);
    }
  };

  const getSessionIcon = (type: string) => {
    const icons = {
      "Family": "F",
      "Wedding": "W",
      "Graduation": "G",
      "Corporate": "C"
    };
    return icons[type as keyof typeof icons] || "S";
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-border p-4 flex justify-between items-center shadow-sm flex-shrink-0">
        <button 
          onClick={handleBackToLogin}
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

        {/* Sessions List - Scrollable with max 8 sessions */}
        <div className="flex-1 overflow-y-auto max-h-[480px] space-y-3 mb-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSessionSelect(session)}
              className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                selectedSession.id === session.id
                  ? "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border border-blue-300 shadow-md"
                  : "bg-muted/50 hover:bg-muted border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white border border-border flex items-center justify-center text-sm font-bold">
                  {getSessionIcon(session.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{session.customerDetails.name}</h3>
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

        {/* New Session Button - Static position */}
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
          onCancel={() => setShowCreateSession(false)}
          onSessionCreated={(newSession) => {
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
            setSelectedSession(sessionToAdd);
            setCurrentImageIndex(0);
            setShowCreateSession(false);
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
          <div className="flex-1 flex overflow-hidden">
            {/* Main Image Area - Optimized space */}
            <div className="flex-1 p-4 flex flex-col relative min-w-0">
              {/* Customer name and date - compact header */}
              <div className="text-center mb-3">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{selectedSession.customerDetails.name}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{selectedSession.date}</p>
              </div>
              
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  {selectedSession.images.length === 0 ? (
                    <span className="text-gray-400">No images available</span>
                  ) : (
                    <img
                      src={selectedSession.images[currentImageIndex]}
                      alt="Session photo"
                      className="object-contain rounded-lg shadow-2xl transition-opacity duration-200"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto'
                      }}
                      loading="eager"
                      onError={(e) => {
                        // If image fails, try next image or show fallback
                        const newImages = selectedSession.images.filter((_, i) => i !== currentImageIndex);
                        if (newImages.length > 0) {
                          setSelectedSession({ ...selectedSession, images: newImages });
                          setCurrentImageIndex(0);
                        } else {
                          e.currentTarget.style.display = 'none';
                        }
                      }}
                    />
                  )}
                </div>
                
                {/* Navigation Buttons */}
                {selectedSession.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                    >
                      <ChevronLeft className="h-6 w-6 text-slate-700" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
                      onClick={nextImage}
                      disabled={currentImageIndex === selectedSession.images.length - 1}
                    >
                      <ChevronRight className="h-6 w-6 text-slate-700" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right Sidebar - Enhanced Thumbnails */}
            <div className="w-80 p-4 border-l border-border bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 overflow-y-auto">
              <h3 className="text-base font-bold mb-4 text-slate-800 dark:text-white">Photos ({selectedSession.images.length})</h3>
              <Button
                className="mb-4 w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                onClick={() => {
                  // Save the updated images to the selected session
                  const updatedSessions = sessions.map(session => {
                    if (session.id === selectedSession.id) {
                      return { ...session, images: selectedSession.images };
                    }
                    return session;
                  });
                  setSessions(updatedSessions);
                  setShowUpdateSuccess(true);
                  setTimeout(() => setShowUpdateSuccess(false), 2000);
                }}
              >
                Update Session
              </Button>
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
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-32 object-cover transition-transform duration-200"
                      loading="lazy"
                      onClick={() => setCurrentImageIndex(index)}
                      onError={(e) => {
                        // Remove broken image from session
                        const newImages = selectedSession.images.filter((_, i) => i !== index);
                        setSelectedSession({ ...selectedSession, images: newImages });
                        // Also update in sessions state
                        const updatedSessions = sessions.map(session => {
                          if (session.id === selectedSession.id) {
                            return { ...session, images: newImages };
                          }
                          return session;
                        });
                        setSessions(updatedSessions);
                        if (currentImageIndex >= newImages.length) {
                          setCurrentImageIndex(Math.max(0, newImages.length - 1));
                        }
                      }}
                    />
                    <button
                      className="absolute top-1 right-1 bg-white/80 hover:bg-red-100 text-red-600 rounded-full p-1 shadow"
                      style={{ zIndex: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newImages = selectedSession.images.filter((_, i) => i !== index);
                        setSelectedSession({ ...selectedSession, images: newImages });
                        // Also update in sessions state
                        const updatedSessions = sessions.map(session => {
                          if (session.id === selectedSession.id) {
                            return { ...session, images: newImages };
                          }
                          return session;
                        });
                        setSessions(updatedSessions);
                        if (currentImageIndex >= newImages.length) {
                          setCurrentImageIndex(Math.max(0, newImages.length - 1));
                        }
                      }}
                      title="Delete image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}