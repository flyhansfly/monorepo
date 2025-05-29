"use client";
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { patientStoryAtom } from "../../atoms/patientStoryAtom";
import { treatmentPlanAtom } from "../../atoms/treatmentPlanAtom";

export default function LinearChat() {
	const [patientStory] = useAtom(patientStoryAtom);
	const [treatmentPlan, setTreatmentPlan] = useAtom(treatmentPlanAtom);
	const [currentQuestion, setCurrentQuestion] = useState(null);
	const [userAnswer, setUserAnswer] = useState("");
	const [sessionId, setSessionId] = useState(null);
	const [isComplete, setIsComplete] = useState(false);

	// Start session when component mounts
	useEffect(() => {
		const startSession = async () => {
			const response = await fetch("http://localhost:8000/api/chatbot/start", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(patientStory),
			});

			const data = await response.json();
			setSessionId(data.session_id);
			setCurrentQuestion(data.current_question);
		};

		if (patientStory) startSession();
	}, [patientStory]);

	const handleSubmit = async () => {
		const response = await fetch("http://localhost:8000/api/chatbot/next", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				session_id: sessionId,
				user_input: userAnswer,
			}),
		});

		const data = await response.json();

		if (data.is_complete) {
			// Get final analysis
			const analysisRes = await fetch("/api/final-analysis", {
				method: "POST",
				body: JSON.stringify({ session_id: sessionId }),
			});

			const analysisData = await analysisRes.json();
			setTreatmentPlan(analysisData);
			setIsComplete(true);
		} else {
			setCurrentQuestion(data.current_question);
			setUserAnswer("");
		}
	};

	if (!patientStory) return <div>Loading...</div>;

	return (
		<div className="p-6 max-w-md mx-auto">
			{!isComplete ? (
				<div className="space-y-4">
					<div className="bg-blue-100 p-4 rounded-lg">
						<h3 className="font-semibold mb-2">
							{currentQuestion?.text || "Loading question..."}
						</h3>
					</div>

					<textarea
						value={userAnswer}
						onChange={(e) => setUserAnswer(e.target.value)}
						className="w-full p-2 border rounded"
						rows="3"
						placeholder="Your answer..."
					/>

					<button
						onClick={handleSubmit}
						className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
					>
						Next Question
					</button>
				</div>
			) : (
				<div className="text-center space-y-4">
					<h2 className="text-xl font-bold">Assessment Complete</h2>
					<button
						onClick={() => setIsComplete(false)}
						className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
					>
						View Treatment Plan
					</button>
				</div>
			)}
		</div>
	);
}
