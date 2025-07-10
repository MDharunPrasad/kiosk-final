import { AuthDialog } from "@/components/AuthDialog";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
          <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
        </div>
        <AuthDialog />
      </div>
    </div>
  );
};

export default Index;
