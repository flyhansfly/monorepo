"use client";

import React from "react";
import { Button } from "@/components/ui/button";

const ChatInput = ({
	value,
	onChange,
	onKeyDown,
	placeholder,
	disabled,
	onSend,
}) => {
	return (
		<div className="flex items-center gap-2">
			<input
				type="text"
				className="flex-1 p-2 border rounded-lg"
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				onKeyDown={onKeyDown}
				disabled={disabled}
			/>
			<Button
				className="px-4 py-2 bg-blue-500 text-white rounded-lg"
				onClick={onSend}
				disabled={disabled}
			>
				Send
			</Button>
		</div>
	);
};

export default ChatInput;
