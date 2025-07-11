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
			<div className="min-h-screen flex flex-col items-center justify-center bg-background">
				<div className="flex flex-col items-center mb-12">
					<div className="flex size-28 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 mb-6">
						<svg
							className="stroke-white"
							xmlns="http://www.w3.org/2000/svg"
							width="64"
							height="64"
							viewBox="0 0 32 32"
							aria-hidden="true"
						>
							<circle cx="16" cy="16" r="12" fill="none" strokeWidth="4" />
							<rect x="10" y="14" width="12" height="8" rx="2" fill="white" />
							<circle cx="16" cy="18" r="2" fill="#6366f1" />
						</svg>
					</div>
					<h1 className="text-5xl font-extrabold text-center mb-3 tracking-tight">
						PhotoKiosk Pro
					</h1>
					<p className="text-xl text-muted-foreground text-center mb-10">
						Professional Studio Management System
					</p>
				</div>
				<div className="flex flex-col md:flex-row gap-10 justify-center items-center w-full max-w-6xl">
					{ROLES.map((role) => (
						<div
							key={role.key}
							className="flex flex-col items-center bg-white rounded-2xl shadow-2xl p-10 w-96 scale-105 hover:scale-110 transition-transform duration-200 border-2 border-blue-100"
						>
							<div
								className={`flex size-20 items-center justify-center rounded-xl ${role.iconBg} mb-5`}
							>
								{role.icon}
							</div>
							<h2 className="text-2xl font-bold mb-2">{role.label}</h2>
							<p className="text-base text-muted-foreground mb-6 text-center">
								{role.description}
							</p>
							<Button
								className={`w-full h-12 text-lg ${role.btnBg}`}
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
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="w-full max-w-[480px] p-12 border bg-background rounded-2xl shadow-2xl shadow-black/5 flex flex-col items-center">
				<div className="flex flex-col items-center gap-4 mb-8">
					<div
						className={`flex size-20 shrink-0 items-center justify-center rounded-xl ${roleObj?.iconBg}`}
					>
						{roleObj?.icon}
					</div>
					<h2 className="text-2xl font-bold tracking-tight text-center">
						Login as {roleObj?.label}
					</h2>
				</div>
				<form
					className="space-y-8 w-full"
					onSubmit={(e) => {
						e.preventDefault();
						onLogin && onLogin(selectedRole!, username);
					}}
				>
					<div className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="username" className="text-lg">Username</Label>
							<Input
								id="username"
								placeholder="Enter your username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								className="h-12 text-base"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password" className="text-lg">Password</Label>
							<Input
								id="password"
								placeholder="Enter your password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="h-12 text-base"
							/>
						</div>
					</div>
					<Button type="submit" className={`w-full h-12 text-lg mt-4 ${roleObj?.btnBg}`}>
						Sign in
					</Button>
					<Button
						type="button"
						variant="ghost"
						className="w-full h-12 text-lg mt-2"
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