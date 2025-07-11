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
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [emailError, setEmailError] = useState<string>("");

	// Email validation function
	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Handle email input change with validation
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const emailValue = e.target.value;
		setEmail(emailValue);

		if (emailValue && !validateEmail(emailValue)) {
			setEmailError("Please enter a valid email address");
		} else {
			setEmailError("");
		}
	};

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !validateEmail(email)) {
			setEmailError("Please enter a valid email address");
			return;
		}

		if (!password) {
			return;
		}

		onLogin && onLogin(selectedRole!, email);
	};

	// First page: role selection
	if (!selectedRole) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-background">
				<div className="flex flex-col items-center mb-8">
					<div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
						<svg
							className="stroke-white"
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 32 32"
							aria-hidden="true"
						>
							<circle cx="16" cy="16" r="12" fill="none" strokeWidth="4" />
							<rect x="10" y="14" width="12" height="8" rx="2" fill="white" />
							<circle cx="16" cy="18" r="2" fill="#6366f1" />
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-center mb-2">
						PhotoKiosk Pro
					</h1>
					<p className="text-muted-foreground text-center mb-6">
						Professional Studio Management System
					</p>
				</div>
				<div className="flex flex-col md:flex-row gap-6 justify-center items-center w-full max-w-3xl">
					{ROLES.map((role) => (
						<div
							key={role.key}
							className="flex flex-col items-center bg-white rounded-xl shadow-lg p-6 w-72"
						>
							<div
								className={`flex size-12 items-center justify-center rounded-lg ${role.iconBg} mb-3`}
							>
								{role.icon}
							</div>
							<h2 className="text-lg font-semibold mb-1">{role.label}</h2>
							<p className="text-sm text-muted-foreground mb-4 text-center">
								{role.description}
							</p>
							<Button
								className={`w-full ${role.btnBg}`}
								onClick={() => setSelectedRole(role.key)}
							>
								Login as {role.label}
							</Button>
						</div>
					))}
				</div>
				<footer className="mt-12 text-center text-muted-foreground text-sm">
					© 2024 PhotoKiosk Pro. All rights reserved.
				</footer>
			</div>
		);
	}

	// Second page: login form for selected role
	const roleObj = ROLES.find((r) => r.key === selectedRole);
	return (
		<div className="min-h-screen flex items-center justify-center bg-background">
			<div className="w-full max-w-[400px] p-6 border bg-background rounded-xl shadow-lg shadow-black/5">
				<div className="flex flex-col items-center gap-2 mb-4">
					<div
						className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${roleObj?.iconBg}`}
					>
						{roleObj?.icon}
					</div>
					<h2 className="text-lg font-semibold tracking-tight">
						Login as {roleObj?.label}
					</h2>
				</div>
				<form className="space-y-5" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								placeholder="Enter your email address"
								type="email"
								value={email}
								onChange={handleEmailChange}
								className={emailError ? "border-red-500 focus:border-red-500" : ""}
								required
							/>
							{emailError && (
								<p className="text-sm text-red-500 mt-1">{emailError}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								placeholder="Enter your password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</div>
					<Button
						type="submit"
						className={`w-full ${roleObj?.btnBg}`}
						disabled={!email || !validateEmail(email) || !password}
					>
						Sign in
					</Button>
					<Button
						type="button"
						variant="ghost"
						className="w-full mt-2"
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