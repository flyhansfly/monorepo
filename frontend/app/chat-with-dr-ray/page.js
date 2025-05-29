"use client";

import Chat from "@/app/chat-with-dr-ray/components/Chat";
import PatientStory from "@/app/chat-with-dr-ray/components/PatientStory";

export default function ChatWithDrRayPage() {
	const initialMessages = [
		{
			id: 1,
			message:
				"Hello, I'm Dr. Ray, your Stingray PT assistant. Based on your initial response, we are going to ask follow-up questions to gather more details for further analysis and a personalized treatment plan. Let's get started!",
			sender: "bot",
		},
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
