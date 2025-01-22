"use client";

import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { patientStoryAtom } from "../../atoms/patientStoryAtom";
import { intakeDataAtom } from "../../atoms/intakeDataAtom";
import ReactMarkdown from "react-markdown";

const PatientStory = () => {
	const [patientStory, setPatientStory] = useAtom(patientStoryAtom);
	const [intakeData] = useAtom(intakeDataAtom);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPatientStory = async () => {
			if (patientStory) {
				return; // If story is already available, no need to fetch
			}

			if (!intakeData) {
				setError("No intake data available to generate the patient story.");
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/patient_story", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ intakeData }),
				});

				if (!response.ok) {
					throw new Error("Failed to generate patient story.");
				}

				const data = await response.json();
				setPatientStory(data.story); // Save the story in the atom for future use
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchPatientStory();
	}, [patientStory, intakeData, setPatientStory]);

	return (
		<div
			className="h-screen p-6 bg-gray-50 border-r overflow-y-auto"
			style={{ backgroundColor: "#f5f5f5", color: "#1d1d1d" }}
		>
			<h2
				className="text-2xl font-bold mb-4"
				style={{ fontFamily: "monospace", color: "#1d1d1d" }}
			>
				Patient Story
			</h2>
			<div className="h-full">
				{loading ? (
					<p
						className="text-lg text-muted-foreground"
						style={{ fontFamily: "monospace" }}
					>
						Loading patient story...
					</p>
				) : error ? (
					<p
						className="text-lg text-red-600"
						style={{ fontFamily: "monospace" }}
					>
						{error}
					</p>
				) : patientStory && patientStory.length > 0 ? (
					// Map over paragraphs if the story exists
					patientStory.map((paragraph, index) => (
						<ReactMarkdown
							key={index}
							className="text-base leading-relaxed mb-4 font-mono text-[#1d1d1d]"
						>
							{paragraph.paragraph}
						</ReactMarkdown>
					))
				) : (
					<p className="text-lg text-muted-foreground font-mono text-[#de3737]">
						No patient story available. Please try again.
					</p>
				)}
			</div>
		</div>
	);
};

export default PatientStory;
