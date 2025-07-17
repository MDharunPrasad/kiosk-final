// LoginForm.jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import AuthBackground from "./AuthBackgound";

const CameraIcon = () => (
	<svg
		className="text-white"
		xmlns="http://www.w3.org/2000/svg"
		width="28"
		height="28"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
		<circle cx="12" cy="13" r="3"/>
	</svg>
);

const PrinterIcon = () => (
	<svg
		className="text-white"
		xmlns="http://www.w3.org/2000/svg"
		width="28"
		height="28"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="2" y="6" width="20" height="8" rx="1"/>
		<path d="m17 14-5-5-5 5"/>
		<path d="M6 18h.01"/>
		<path d="M10 18h.01"/>
	</svg>
);

const SettingsIcon = () => (
	<svg
		className="text-white"
		xmlns="http://www.w3.org/2000/svg"
		width="28"
		height="28"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
		<circle cx="12" cy="12" r="3"/>
	</svg>
);

export const ROLES = [
	{
		key: "photographer",
		label: "Photographer",
		description: "Upload and manage photo sessions",
		color: "blue",
		iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
		btnBg: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
		cardBg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
		icon: <CameraIcon />,
	},
	{
		key: "operator",
		label: "Operator",
		description: "Assist customers with printing and editing",
		color: "green",
		iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
		btnBg: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800",
		cardBg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
		icon: <PrinterIcon />,
	},
	{
		key: "admin",
		label: "Admin",
		description: "Manage system settings and users",
		color: "purple",
		iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
		btnBg: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
		cardBg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
		icon: <SettingsIcon />,
	},
];

// Login Form Component
const LoginForm = ({ selectedRole, onLogin, onBack }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	// Use the login function from AuthContext instead of AuthService directly
	const { login } = useAuth();

	const handleLogin = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			// Use the AuthContext login function - this will update the context
			const { user, token } = await login({
				username,
				password
			});

			// Clear form on successful login
			setUsername("");
			setPassword("");
			
			// Call the onLogin callback with user and token from AuthContext
			onLogin?.(user, token);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const roleObj = ROLES.find((r) => r.key === selectedRole);

	return (
		<AuthBackground>
			<div className="flex items-center justify-center min-h-screen px-4 py-8">
				<div className="w-full max-w-md">
					<div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8">
						{/* Header */}
						<div className="flex flex-col items-center gap-6 mb-8">
							<div className={`flex items-center justify-center w-20 h-20 rounded-2xl ${roleObj?.iconBg} shadow-xl`}>
								{roleObj?.icon}
							</div>
							<div className="text-center">
								<h2 className="text-3xl font-bold text-slate-800 mb-2">
									Welcome back
								</h2>
								<p className="text-slate-600 text-lg">
									Login as <span className="font-semibold text-slate-800">{roleObj?.label}</span>
								</p>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
								<p className="text-sm text-red-600 font-medium">{error}</p>
							</div>
						)}

						{/* Form */}
						<form onSubmit={handleLogin} className="space-y-6">
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="username" className="text-sm font-medium text-slate-700">
										Username
									</Label>
									<Input
										id="username"
										placeholder="Enter your username"
										type="text"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										required
										disabled={isLoading}
										className="h-12 text-base bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200 text-slate-800 placeholder:text-slate-400"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="password" className="text-sm font-medium text-slate-700">
										Password
									</Label>
									<Input
										id="password"
										placeholder="Enter your password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										disabled={isLoading}
										className="h-12 text-base bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200 text-slate-800 placeholder:text-slate-400"
									/>
								</div>
							</div>
							
							<div className="space-y-3 pt-2">
								<Button 
									type="submit" 
									className={`w-full h-14 text-base font-semibold ${roleObj?.btnBg} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl text-white`}
									disabled={isLoading}
								>
									{isLoading ? (
										<div className="flex items-center gap-2">
											<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
											Signing in...
										</div>
									) : (
										"Sign in"
									)}
								</Button>
								<Button
									type="button"
									variant="ghost"
									className="w-full h-12 text-base font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
									onClick={onBack}
									disabled={isLoading}
								>
									← Back to role selection
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</AuthBackground>
	);
};

export default LoginForm;