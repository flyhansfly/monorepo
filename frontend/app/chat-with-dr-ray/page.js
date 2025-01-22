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
			<div className="w-3/5 bg-gray-100">
				<PatientStory />
			</div>

			{/* Right Panel */}
			<div className="w-2/5">
				<Chat initialMessages={initialMessages} />
			</div>
		</div>
	);
}
