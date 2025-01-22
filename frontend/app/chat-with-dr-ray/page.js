"use client";

import Chat from "@/app/chat-with-dr-ray/components/Chat";
import PatientStory from "@/app/chat-with-dr-ray/components/PatientStory";

export default function ChatWithDrRayPage() {
	const initialMessages = [
		{ id: 1, message: "Hello, how can I assist you?", sender: "bot" },
	];

	return (
		<div className="flex h-screen">
			{/* Left Panel */}
			<div className="w-1/3">
				<PatientStory />
			</div>

			{/* Right Panel */}
			<div className="flex-1">
				<Chat initialMessages={initialMessages} />
			</div>
		</div>
	);
}
