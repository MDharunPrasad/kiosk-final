import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CreateSessionModal } from "./CreateSessionModal";

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

export function PhotographerDashboard() {
  const [selectedSession, setSelectedSession] = useState<Session>(mockSessions[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredSessions = mockSessions.filter(session => {
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
      "Family": "👨‍👩‍👧‍👦",
      "Wedding": "💒",
      "Graduation": "🎓",
      "Corporate": "🏢"
    };
    return icons[type as keyof typeof icons] || "📸";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-background border-r border-border p-6 flex flex-col h-screen">
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

        {/* Sessions List */}
        <div className="flex-1 space-y-3 mb-6">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSessionSelect(session)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedSession.id === session.id
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-lg">
                  {getSessionIcon(session.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{session.name}</h3>
                  <p className="text-xs text-muted-foreground">{session.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Session Button - Moved to bottom */}
        <div className="mt-auto">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">{selectedSession.name}</h1>
            <p className="text-muted-foreground">{selectedSession.date}</p>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Main Image Area */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
            <div className="relative w-full h-full max-h-[calc(100vh-240px)] flex items-center justify-center">
              <img
                src={selectedSession.images[currentImageIndex]}
                alt="Session photo"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
              
              {/* Navigation Buttons */}
              {selectedSession.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={nextImage}
                    disabled={currentImageIndex === selectedSession.images.length - 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Customer Details */}
            <div className="mt-6 text-center">
              <h2 className="text-xl font-semibold">{selectedSession.customerDetails.name}</h2>
              <p className="text-muted-foreground">
                {selectedSession.customerDetails.location} • {selectedSession.customerDetails.date}
              </p>
            </div>

            {/* Status */}
            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">Hidden</span>
            </div>
          </div>

          {/* Right Sidebar - Thumbnails */}
          <div className="w-80 p-6 border-l border-border">
            <div className="grid grid-cols-2 gap-4">
              {selectedSession.images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImageIndex === index
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSessionCreated={(newSession) => {
          // Handle new session creation
          console.log("New session created:", newSession);
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}