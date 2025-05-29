"use client";

import React from "react";

const ChatBubble = ({ message, sender }) => {
	return (
		<div
			className={`p-3 mb-2 rounded-lg max-w-[70%] ${
				sender === "user"
					? "bg-blue-500 text-white ml-auto"
					: "bg-gray-200 text-black mr-auto"
			}`}
			style={{
				wordWrap: "break-word",
				whiteSpace: "pre-wrap",
			}}
		>
			{message}
		</div>
	);
};

export default ChatBubble;
