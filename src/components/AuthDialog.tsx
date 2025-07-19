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
			<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
				{/* Animated background elements */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/10"></div>
				<div className="absolute top-20 left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
				
				<div className="flex flex-col items-center mb-8 relative z-10">
					<div className="relative">
						<img src="/m2-logo.jpg" alt="M2 Photography Logo" className="w-40 h-40 object-contain rounded-3xl mb-4 shadow-2xl border-4 border-white/20 backdrop-blur-sm" />
						<div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-sm"></div>
					</div>
					<h1 className="text-4xl font-extrabold text-center mb-2 tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
						M2 Photography
					</h1>
					<p className="text-lg text-gray-600 text-center mb-8 font-medium">
						Professional Studio Management System
					</p>
				</div>
				<div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-w-4xl relative z-10">
					{ROLES.map((role) => (
						<div
							key={role.key}
							className="flex flex-col items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-80 scale-100 hover:scale-105 transition-all duration-300 border border-white/20 hover:shadow-3xl"
						>
							<div
								className={`flex size-16 items-center justify-center rounded-2xl ${role.iconBg} mb-4 shadow-lg`}
							>
								{role.icon}
							</div>
							<h2 className="text-xl font-bold mb-2 text-gray-800">{role.label}</h2>
							<p className="text-sm text-gray-600 mb-6 text-center leading-relaxed">
								{role.description}
							</p>
							<Button
								className={`w-full h-12 text-base font-semibold ${role.btnBg} shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl`}
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
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/10"></div>
			<div className="absolute top-20 left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
			<div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
			
			<div className="w-full max-w-[400px] p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 flex flex-col items-center relative z-10">
				<div className="flex flex-col items-center gap-3 mb-8">
					<div
						className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${roleObj?.iconBg} shadow-lg`}
					>
						{roleObj?.icon}
					</div>
					<h2 className="text-2xl font-bold tracking-tight text-center text-gray-800">
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
					<div className="space-y-5 w-full">
						<div className="space-y-2">
							<Label htmlFor="username" className="text-base font-semibold text-gray-700">Username</Label>
							<Input
								id="username"
								placeholder="Enter your username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								className="h-12 text-base border-2 border-gray-200 focus:border-blue-400 rounded-xl shadow-sm transition-all duration-200"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password" className="text-base font-semibold text-gray-700">Password</Label>
							<Input
								id="password"
								placeholder="Enter your password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="h-12 text-base border-2 border-gray-200 focus:border-blue-400 rounded-xl shadow-sm transition-all duration-200"
							/>
						</div>
					</div>
					<Button type="submit" className={`w-full h-12 text-base font-semibold mt-4 ${roleObj?.btnBg} shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl`}>
						Sign in
					</Button>
					<Button
						type="button"
						variant="ghost"
						className="w-full h-12 text-base mt-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
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