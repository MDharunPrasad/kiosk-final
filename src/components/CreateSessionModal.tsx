import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (session: any) => void;
}

export function CreateSessionModal({ isOpen, onClose, onSessionCreated }: CreateSessionModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [location, setLocation] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateSession = () => {
    if (!customerName || !location || uploadedFiles.length === 0) {
      alert("Please fill in all fields and upload at least one photo");
      return;
    }

    const newSession = {
      customerName,
      location,
      photos: uploadedFiles,
      date: new Date().toISOString().split('T')[0]
    };

    onSessionCreated(newSession);
    
    // Reset form
    setCustomerName("");
    setLocation("");
    setUploadedFiles([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Photo Session</DialogTitle>
          <DialogDescription>
            Fill in the details below to start a new photography session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customer-name" className="text-sm font-medium">
              Customer Name
            </Label>
            <Input
              id="customer-name"
              placeholder="Enter customer's full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="central-park">Central Park</SelectItem>
                <SelectItem value="riverside-gardens">Riverside Gardens</SelectItem>
                <SelectItem value="university-campus">University Campus</SelectItem>
                <SelectItem value="office-building">Office Building</SelectItem>
                <SelectItem value="beach">Beach</SelectItem>
                <SelectItem value="mountain-view">Mountain View</SelectItem>
                <SelectItem value="downtown">Downtown</SelectItem>
                <SelectItem value="other">Other Location</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Session Photos */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Session Photos</Label>
            
            {/* Upload Button */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors bg-primary/5"
            >
              <Upload className="mx-auto h-12 w-12 text-primary mb-4" />
              <p className="text-lg font-medium text-primary mb-2">Upload Photos</p>
              <p className="text-sm text-muted-foreground">
                Click to select photos from your computer
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Uploaded Photos ({uploadedFiles.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateSession}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
              disabled={!customerName || !location || uploadedFiles.length === 0}
            >
              ✓ Complete Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}