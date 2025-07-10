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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
      {/* Header */}
      <div className="border-b border-border p-6 bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onCancel}
            className="hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Create New Photo Session</h1>
            <p className="text-slate-600 dark:text-slate-300">Enter customer details and upload photos for the new session.</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 space-y-5">
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
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Upload className="mr-2 h-5 w-5" />
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

          {/* Create Session Button */}
          <div className="pt-4">
            <Button
              onClick={handleCreateSession}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
              disabled={!customerName || !location || uploadedFiles.length === 0}
            >
              Create Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}