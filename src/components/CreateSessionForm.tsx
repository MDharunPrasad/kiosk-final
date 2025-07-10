import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, ArrowLeft } from "lucide-react";

interface CreateSessionFormProps {
  onCancel: () => void;
  onSessionCreated: (session: any) => void;
}

export function CreateSessionForm({ onCancel, onSessionCreated }: CreateSessionFormProps) {
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
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onCancel}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold">Create New Photo Session</h1>
            <p className="text-muted-foreground">Fill in the details below to start a new photography session.</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Customer Name */}
          <div className="space-y-3">
            <Label htmlFor="customer-name" className="text-lg font-medium">
              Customer Name
            </Label>
            <Input
              id="customer-name"
              placeholder="Enter customer's full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full h-12 text-base"
            />
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label htmlFor="location" className="text-lg font-medium">
              Location
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full h-12 text-base">
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
            <Label className="text-lg font-medium">Session Photos</Label>
            
            {/* Upload Button */}
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium"
              size="lg"
            >
              <Upload className="mr-3 h-6 w-6" />
              Upload Photos
            </Button>

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
              <div className="space-y-4">
                <p className="text-base font-medium">
                  Uploaded Photos ({uploadedFiles.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
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

          {/* Complete Session Button */}
          <div className="pt-6">
            <Button
              onClick={handleCreateSession}
              className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-lg font-medium"
              disabled={!customerName || !location || uploadedFiles.length === 0}
            >
              ✓ Complete Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}