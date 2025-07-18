// constants/constant.js
import React from 'react';

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

// Helper functions for role management
export const getRoleByKey = (key) => {
	return ROLES.find(role => role.key === key);
};

export const getRoleKeys = () => {
	return ROLES.map(role => role.key);
};

export const getRoleLabels = () => {
	return ROLES.map(role => role.label);
};