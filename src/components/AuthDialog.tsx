import { Button } from "@/components/ui/button";
import { useState } from "react";
import AuthBackground from "./AuthBackgound";
import LoginForm from "./LoginPage";


// constants/constant.js

// Icon components as functions
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



// Role Selection Component
const RoleSelection = ({ onRoleSelect }) => (
	<AuthBackground>
		<div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
			{/* Header Section */}
			<div className="text-center mb-16">
				<div className="relative inline-block mb-8">
					{/* Multiple layered glowing rings */}
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<div className="absolute w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-3xl animate-pulse"></div>
						<div className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-40 blur-2xl animate-pulse"></div>
						<div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 opacity-60 blur-xl animate-pulse"></div>
					</div>

					{/* Logo container */}
					<div className="relative w-32 h-32 rounded-3xl shadow-[0_0_40px_rgba(60,60,180,0.3)] flex items-center justify-center overflow-hidden border-4 border-white/30">
						<div 
							className="absolute inset-0 z-0 animate-glow" 
							style={{
								background: 'linear-gradient(45deg, rgba(255,255,255,0.2), rgba(255,255,255,0.6), rgba(255,255,255,0.2))',
								backgroundSize: '200% 200%',
								animation: 'moveGradient 3s ease infinite'
							}}
						></div>
						<div className="w-28 h-28 bg-white/20 rounded-2xl flex items-center justify-center relative z-10">
							<img
								src="/m2-logo.jpg"
								alt="M2 Photography Logo"
								className="w-28 h-28 object-contain rounded-2xl relative z-10 mix-blend-multiply"
								style={{
									filter: "drop-shadow(0 0 20px rgba(60,60,180,0.4))"
								}}
								/>
						</div>
					</div>
				</div>
				<h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
					M2 Photography
				</h1>
				<p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
					Professional Studio Management System
				</p>
			</div>
			
			{/* Role Cards Section */}
			<div className="w-full max-w-6xl">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
					{ROLES.map((role) => (
						<div
							key={role.key}
							className="group relative w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:bg-white/15 border border-white/20 cursor-pointer shadow-2xl"
							onClick={() => onRoleSelect(role.key)}
						>
							{/* Hover gradient overlay */}
							<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
							
							<div className="relative z-10 flex flex-col items-center text-center">
								<div className={`flex items-center justify-center w-20 h-20 rounded-2xl ${role.iconBg} mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}>
									{role.icon}
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">{role.label}</h3>
								<p className="text-slate-300 mb-8 leading-relaxed text-center">
									{role.description}
								</p>
								<Button
									className={`w-full h-14 text-base font-semibold ${role.btnBg} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl`}
								>
									Login as {role.label}
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	</AuthBackground>
);

// Main Auth Dialog Component
interface AuthDialogProps {
	onLogin?: (user: any, token: string) => void;
}

function AuthDialog({ onLogin }: AuthDialogProps) {
	const [selectedRole, setSelectedRole] = useState(null);

	const handleRoleSelect = (role) => {
		setSelectedRole(role);
	};

	const handleBack = () => {
		setSelectedRole(null);
	};

	const handleLogin = (user, token) => {
		onLogin?.(user, token);
	};

	if (!selectedRole) {
		return <RoleSelection onRoleSelect={handleRoleSelect} />;
	}

	return (
		<LoginForm 
			selectedRole={selectedRole} 
			onLogin={handleLogin} 
			onBack={handleBack} 
		/>
	);
}

export default AuthDialog;