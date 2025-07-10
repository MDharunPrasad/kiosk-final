import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useId, useState } from "react";

function AuthDialog({ onLogin }: { onLogin?: (role: string, username?: string) => void }) {
  const id = useId();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const handleLogin = () => {
    if (selectedRole && onLogin) {
      onLogin(selectedRole, username);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/30 dark:bg-indigo-800/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-[400px] p-8 border bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/10 relative z-10 animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg animate-scale-in"
            aria-hidden="true"
          >
            <svg
              className="stroke-white"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Photo Kiosk</h1>
            <h2 className="text-lg font-medium text-slate-600 dark:text-slate-300">Welcome back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to access your photo sessions</p>
          </div>
        </div>

        <form className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${id}-username`}>Username</Label>
              <Input 
                id={`${id}-username`} 
                placeholder="Enter your username" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-password`}>Password</Label>
              <Input
                id={`${id}-password`}
                placeholder="Enter your password"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-role`}>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photographer">Photographer</SelectItem>
                  <SelectItem value="counter-staff">Counter Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox id={`${id}-remember`} />
            <Label htmlFor={`${id}-remember`} className="font-normal text-muted-foreground">
              Remember me
            </Label>
          </div>
          
          <Button 
            type="button" 
            className="w-full" 
            onClick={handleLogin}
            disabled={!selectedRole}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

export { AuthDialog };