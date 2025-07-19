import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const ROLES = [
	{
		key: "photographer",
		label: "Photographer",
		description: "Upload and manage photo sessions",
		color: "blue",
		iconBg: "bg-blue-100",
		btnBg: "bg-blue-600 hover:bg-blue-700",
		icon: (
			<svg
				className="stroke-blue-600"
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 32 32"
			>
				<circle cx="16" cy="16" r="12" fill="none" strokeWidth="4" />
				<rect x="10" y="14" width="12" height="8" rx="2" fill="#3b82f6" />
				<circle cx="16" cy="18" r="2" fill="white" />
			</svg>
		),
	},
	{
		key: "operator",
		label: "Operator",
		description: "Assist customers with printing and editing",
		color: "green",
		iconBg: "bg-green-100",
		btnBg: "bg-green-600 hover:bg-green-700",
		icon: (
			<svg
				className="stroke-green-600"
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 32 32"
			>
				<circle cx="16" cy="16" r="12" fill="none" strokeWidth="4" />
				<rect x="10" y="14" width="12" height="8" rx="2" fill="#22c55e" />
				<circle cx="16" cy="18" r="2" fill="white" />
			</svg>
		),
	},
	{
		key: "admin",
		label: "Admin",
		description: "Manage system settings and users",
		color: "purple",
		iconBg: "bg-purple-100",
		btnBg: "bg-purple-600 hover:bg-purple-700",
		icon: (
			<svg
				className="stroke-purple-600"
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 32 32"
			>
				<circle cx="16" cy="16" r="12" fill="none" strokeWidth="4" />
				<rect x="10" y="14" width="12" height="8" rx="2" fill="#a855f7" />
				<circle cx="16" cy="18" r="2" fill="white" />
			</svg>
		),
	},
];

function AuthDialog({ onLogin }: { onLogin?: (role: string, username?: string) => void }) {
	const [selectedRole, setSelectedRole] = useState<string | null>(null);
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	// First page: role selection
	if (!selectedRole) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
				{/* Animated background elements */}
				<div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
				<div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
				<div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
				<div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
				
				<div className="flex flex-col items-center mb-8 relative z-10">
					<div className="relative">
						<img src="/m2-logo.jpg" alt="M2 Photography Logo" className="w-40 h-40 object-contain rounded-2xl mb-4 shadow-2xl border-4 border-white/20 backdrop-blur-sm" />
						<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
					</div>
					<h1 className="text-4xl font-extrabold text-center mb-2 tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
						M2 Photography
					</h1>
					<p className="text-lg text-gray-300 text-center mb-8 font-medium">
						Professional Studio Management System
					</p>
				</div>
				<div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-w-4xl px-4 relative z-10">
					{ROLES.map((role) => (
						<div
							key={role.key}
							className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-80 scale-100 hover:scale-105 transition-all duration-300 border border-white/20 hover:border-white/40 hover:shadow-purple-500/25"
						>
							<div
								className={`flex size-16 items-center justify-center rounded-xl ${role.iconBg} mb-4 shadow-lg`}
							>
								{role.icon}
							</div>
							<h2 className="text-xl font-bold mb-2 text-white">{role.label}</h2>
							<p className="text-sm text-gray-300 mb-6 text-center leading-relaxed">
								{role.description}
							</p>
							<Button
								className={`w-full h-12 text-base font-semibold ${role.btnBg} shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl`}
								onClick={() => setSelectedRole(role.key)}
							>
								Login as {role.label}
							</Button>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Second page: login form for selected role
	const roleObj = ROLES.find((r) => r.key === selectedRole);
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
			<div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
			<div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
			
			<div className="w-full max-w-[400px] p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 flex flex-col items-center relative z-10">
				<div className="flex flex-col items-center gap-3 mb-8">
					<div
						className={`flex size-16 shrink-0 items-center justify-center rounded-xl ${roleObj?.iconBg} shadow-lg`}
					>
						{roleObj?.icon}
					</div>
					<h2 className="text-2xl font-bold tracking-tight text-center text-white">
						Login as {roleObj?.label}
					</h2>
				</div>
				<form
					className="space-y-6 w-full"
					onSubmit={(e) => {
						e.preventDefault();
						onLogin && onLogin(selectedRole!, username);
					}}
				>
					<div className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="username" className="text-base text-gray-200 font-medium">Username</Label>
							<Input
								id="username"
								placeholder="Enter your username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								className="h-12 text-sm bg-white/20 border-white/30 text-white placeholder-gray-300 focus:bg-white/30 focus:border-white/50 rounded-xl backdrop-blur-sm"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password" className="text-base text-gray-200 font-medium">Password</Label>
							<Input
								id="password"
								placeholder="Enter your password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="h-12 text-sm bg-white/20 border-white/30 text-white placeholder-gray-300 focus:bg-white/30 focus:border-white/50 rounded-xl backdrop-blur-sm"
							/>
						</div>
					</div>
					<Button type="submit" className={`w-full h-12 text-base font-semibold mt-4 ${roleObj?.btnBg} shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl`}>
						Sign in
					</Button>
					<Button
						type="button"
						variant="ghost"
						className="w-full h-12 text-base mt-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
						onClick={() => setSelectedRole(null)}
					>
						Back
					</Button>
				</form>
			</div>
		</div>
	);
}

export { AuthDialog };