import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
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
      "/lovable-uploads/79770456-acec-4ab2-b867-86159b94b4ea.png",
      "/lovable-uploads/6088a135-d271-4528-8e1b-a06cbbe58d03.png",
      "/lovable-uploads/9abd203d-7cad-4487-b2c4-48f26090e9b6.png",
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
      "/lovable-uploads/79770456-acec-4ab2-b867-86159b94b4ea.png",
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
      "/lovable-uploads/79770456-acec-4ab2-b867-86159b94b4ea.png",
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
      "/lovable-uploads/79770456-acec-4ab2-b867-86159b94b4ea.png",
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

  const handleLogout = () => {
    window.location.reload();
  };

  const handleBackToLogin = () => {
    window.location.reload();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-border p-4 flex justify-between items-center shadow-sm">
        <button 
          onClick={handleBackToLogin}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PK</span>
          </div>
          <span className="text-xl font-bold">Photo Kiosk</span>
        </button>
        
        <div className="flex items-center gap-4 mr-4">
          <div className="text-left bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-4 py-2 rounded-lg">
            <p className="font-semibold text-slate-800 dark:text-slate-200">{username || "Photographer"}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{new Date().toLocaleDateString()}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-border p-6 flex flex-col h-[calc(100vh-80px)]">
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
        <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 mb-6">
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
                  <h3 className="font-medium text-xs truncate">{session.customerDetails.name}</h3>
                  <p className="text-xs text-muted-foreground">{session.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Session Button - Static position */}
        <div className="border-t border-border pt-4">
          <Button 
            onClick={() => setShowCreateSession(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 shadow-md hover:shadow-lg transition-all"
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
          {/* Header with customer name */}
          <div className="border-b border-border p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600">
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">{selectedSession.customerDetails.name}</h1>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Main Image Area - Increased space */}
            <div className="flex-1 p-4 flex flex-col items-center justify-center relative min-w-0">
              <div className="relative w-full h-full max-h-[calc(100vh-200px)] flex items-center justify-center">
                <img
                  src={selectedSession.images[currentImageIndex]}
                  alt="Session photo"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg will-change-transform"
                  loading="lazy"
                />
                
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

            {/* Right Sidebar - Larger Thumbnails */}
            <div className="w-80 p-4 border-l border-border bg-gray-50 dark:bg-slate-700 overflow-y-auto">
              <h3 className="text-base font-semibold mb-4 text-slate-800 dark:text-white">Photos ({selectedSession.images.length})</h3>
              <div className="space-y-3">
                {selectedSession.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      currentImageIndex === index
                        ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-32 object-cover"
                      loading="lazy"
                    />
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