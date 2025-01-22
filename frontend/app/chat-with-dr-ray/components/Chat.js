"use client";

import { useState } from "react";

const Chat = ({ initialMessages = [] }) => {
	const [messages, setMessages] = useState(initialMessages);
	const [inputValue, setInputValue] = useState("");

	const handleSendMessage = () => {
		if (!inputValue.trim()) return;

		setMessages((prev) => [
			...prev,
			{ id: prev.length + 1, message: inputValue, sender: "user" },
		]);

		// Simulate bot response (replace with API call)
		setTimeout(() => {
			setMessages((prev) => [
				...prev,
				{
					id: prev.length + 1,
					message: "This is a bot response.",
					sender: "bot",
				},
			]);
		}, 1000);

		setInputValue("");
	};

	return (
		<div className="flex flex-col h-full border rounded-lg shadow bg-white">
			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`flex ${
							message.sender === "user" ? "justify-end" : "justify-start"
						}`}
					>
						<div
							className={`max-w-xs p-3 rounded-lg text-sm ${
								message.sender === "user"
									? "bg-blue-500 text-white"
									: "bg-gray-200 text-gray-800"
							}`}
						>
							{message.message}
						</div>
					</div>
				))}
			</div>

			{/* Input */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSendMessage();
				}}
				className="border-t p-3 flex items-center space-x-3"
			>
				<input
					type="text"
					placeholder="Type your message here..."
					className="flex-1 border rounded-lg px-3 py-2 focus:ring focus:ring-blue-300"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
				/>
				<button
					type="button"
					className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
					onClick={handleSendMessage}
				>
					Send
				</button>
			</form>
		</div>
	);
};

export default Chat;
