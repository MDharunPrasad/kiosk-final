import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId, useState } from "react";

function AuthDialog() {
  const id = useId();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Sign in</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
            aria-hidden="true"
          >
            <svg
              className="stroke-zinc-800 dark:stroke-zinc-100"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 32 32"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8" />
            </svg>
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              {isLogin ? "Welcome back" : "Create your account"}
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              {isLogin 
                ? "Enter your credentials to login to your account." 
                : "Enter your details to create a new account."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor={`${id}-name`}>Full Name</Label>
                <Input id={`${id}-name`} placeholder="John Doe" type="text" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`${id}-email`}>Email</Label>
              <Input id={`${id}-email`} placeholder="hi@yourcompany.com" type="email" required />
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
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor={`${id}-confirm-password`}>Confirm Password</Label>
                <Input
                  id={`${id}-confirm-password`}
                  placeholder="Confirm your password"
                  type="password"
                  required
                />
              </div>
            )}
          </div>
          
          {isLogin ? (
            <div className="flex justify-between gap-2">
              <div className="flex items-center gap-2">
                <Checkbox id={`${id}-remember`} />
                <Label htmlFor={`${id}-remember`} className="font-normal text-muted-foreground">
                  Remember me
                </Label>
              </div>
              <a className="text-sm underline hover:no-underline" href="#">
                Forgot password?
              </a>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <Checkbox id={`${id}-terms`} className="mt-1" />
              <Label htmlFor={`${id}-terms`} className="font-normal text-muted-foreground text-sm leading-5">
                I agree to the{" "}
                <a className="underline hover:no-underline" href="#">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="underline hover:no-underline" href="#">
                  Privacy Policy
                </a>
              </Label>
            </div>
          )}
          
          <Button type="button" className="w-full">
            {isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          <span className="text-xs text-muted-foreground">Or</span>
        </div>

        <Button 
          variant="outline" 
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="w-full"
        >
          {isLogin ? "Create new account" : "Already have an account? Sign in"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export { AuthDialog };