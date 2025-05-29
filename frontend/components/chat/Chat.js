"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { treatmentPlanAtom } from "../../atoms/treatmentPlanAtom";
import { patientStoryAtom } from "../../atoms/patientStoryAtom"; // Retrieve the patient story atom
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";

const Chat = ({ initialMessages = [] }) => {
	const [messages, setMessages] = useState(initialMessages);
	const [userInput, setUserInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track follow-up questions
	const [patientStory] = useAtom(patientStoryAtom); // Retrieve the patient story atom
	const [, setTreatmentPlan] = useAtom(treatmentPlanAtom);
	const messagesEndRef = useRef(null);
	const router = useRouter();

	// Scroll to the latest message
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		if (messages.length === 1 && patientStory) {
			// Ask the first follow-up question immediately
			sendFollowUpQuestion();
		}
	}, [patientStory]); // Trigger when patientStory is loaded

	// Function to send the bot's follow-up question
	Copy;
	const sendFollowUpQuestion = () => {
		if (!patientStory || currentQuestionIndex >= patientStory.length) return;

		const followUpQuestions =
			patientStory[currentQuestionIndex].follow_up_questions;
		if (followUpQuestions && followUpQuestions.length > 0) {
			// Send the first follow-up question from this paragraph
			const followUpQuestion = followUpQuestions[0];

			setMessages((prev) => [
				...prev,
				{
					id: prev.length + 1,
					sender: "bot",
					message: followUpQuestion,
				},
			]);

			// Remove the asked question from the list
			const updatedQuestions = followUpQuestions.slice(1);
			patientStory[currentQuestionIndex].follow_up_questions = updatedQuestions;
		}
	};

	// Add a state variable to track whether the conversation is complete
	const [isComplete, setIsComplete] = useState(false);

	// Modify the sendMessage function to handle completion
	const sendMessage = async () => {
		if (!userInput.trim()) return;

		const userMessage = {
			id: messages.length + 1,
			sender: "user",
			message: userInput,
		};
		setMessages((prev) => [...prev, userMessage]);
		setUserInput("");
		setLoading(true);
		try {
			const response = await fetch("http://localhost:8000/api/chatbot", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					user_input: userInput,
					context: {
						messages: messages.map((msg) => ({
							sender: msg.sender,
							message: msg.message,
						})),
						follow_up_questions:
							patientStory[currentQuestionIndex]?.follow_up_questions || [],
					},
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to fetch chatbot response.");
			}

			const data = await response.json();
			setMessages((prev) => [
				...prev,
				{ id: prev.length + 1, sender: "bot", message: data.message },
			]);

			if (data.is_complete) {
				setIsComplete(true);
				setTreatmentPlan({
					bigMuscle: data.big_muscle_focus,
					symptomClusters: data.cluster_of_symptoms,
				});
			} else {
				setCurrentQuestionIndex((prev) => prev + 1);
				sendFollowUpQuestion();
			}
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setLoading(false);
		}
	};

	// Add a "Go to Final Analysis" button
	return (
		<div className="h-full flex flex-col">
			{/* Chat History */}
			<div className="flex-1 overflow-y-auto p-4">
				{messages.map((msg) => (
					<ChatBubble key={msg.id} message={msg.message} sender={msg.sender} />
				))}
				{isComplete && (
					<button
						className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
						onClick={() => router.push("/final-analysis-treatment-plan")}
					>
						Go to Final Analysis
					</button>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Chat Input */}
			<div className="p-4 border-t">
				<ChatInput
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type your message..."
					disabled={loading || isComplete}
					onSend={sendMessage}
				/>
			</div>
		</div>
	);

	// Handle "Enter" key press
	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	// Trigger the first follow-up question immediately after the greeting
	useEffect(() => {
		if (messages.length === 1 && patientStory) {
			setTimeout(() => {
				sendFollowUpQuestion();
			}, 1000); // Delay slightly to simulate natural conversation
		}
	}, [patientStory]);

	return (
		<div className="h-full flex flex-col">
			{/* Chat History */}
			<div className="flex-1 overflow-y-auto p-4">
				{messages.map((msg) => (
					<ChatBubble key={msg.id} message={msg.message} sender={msg.sender} />
				))}
				<div ref={messagesEndRef} />
			</div>

			{/* Chat Input */}
			<div className="p-4 border-t">
				<ChatInput
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type your message..."
					disabled={loading}
					onSend={sendMessage}
				/>
			</div>
		</div>
	);
};

export default Chat;
