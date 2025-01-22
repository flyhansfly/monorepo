"use client";

import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { patientStoryAtom } from "../../atoms/patientStoryAtom";
import { intakeDataAtom } from "../../atoms/intakeDataAtom";

const PatientStory = () => {
	const [patientStory, setPatientStory] = useAtom(patientStoryAtom);
	const [intakeData] = useAtom(intakeDataAtom);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPatientStory = async () => {
			if (patientStory) {
				// If story is already available, no need to fetch
				return;
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
					body: JSON.stringify({ intakeData }), // Adjust to match your API's expectations
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
		<div className="h-full p-6 bg-gray-50 border-r">
			<h2 className="text-lg font-semibold mb-4">Patient Story</h2>
			<div className="overflow-y-auto h-full">
				{loading ? (
					<p className="text-sm text-muted-foreground">
						Loading patient story...
					</p>
				) : error ? (
					<p className="text-sm text-red-600">{error}</p>
				) : patientStory ? (
					<p className="text-sm text-muted-foreground">{patientStory}</p>
				) : (
					<p className="text-sm text-muted-foreground">
						No patient story available. Please try again.
					</p>
				)}
			</div>
		</div>
	);
};

export default PatientStory;
