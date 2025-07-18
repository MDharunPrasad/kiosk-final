
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
    photographer?: string; // Added photographer field
  };
  status: "pending" | "ready" | "completed";
  printCount?: number;
}



export const mockSessions: Session[] = [
  {
    id: "1",
    name: "Family Portrait",
    date: "2024-07-20",
    type: "Family",
    status: "pending",
    printCount: 2,
    images: [
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&h=600&fit=crop",
    ],
    customerDetails: {
      name: "Johnson Family",
      location: "Central Park",
      date: "2024-07-20",
      photographer: "John Doe"
    }
  },
  {
    id: "2",
    name: "Wedding Photography",
    date: "2024-07-15",
    type: "Wedding",
    status: "pending",
    printCount: 5,
    images: [
      "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=800&h=600&fit=crop",
    ],
    customerDetails: {
      name: "Sarah & Mike",
      location: "Riverside Gardens",
      date: "2024-07-15",
      photographer: "Jane Smith"
    }
  },
  {
    id: "3",
    name: "Graduation Photoshoot",
    date: "2024-07-10",
    type: "Graduation",
    status: "ready",
    printCount: 3,
    images: [
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&h=600&fit=crop",
    ],
    customerDetails: {
      name: "Emily Rodriguez",
      location: "University Campus",
      date: "2024-07-10",
      photographer: "John Doe"
    }
  },
  {
    id: "4",
    name: "Corporate Headshots",
    date: "2024-07-05",
    type: "Corporate",
    status: "pending",
    printCount: 1,
    images: [
      "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=800&h=600&fit=crop",
    ],
    customerDetails: {
      name: "Tech Solutions Inc",
      location: "Office Building",
      date: "2024-07-05",
      photographer: "Jane Smith"
    }
  }
];