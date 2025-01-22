"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { intakeAnalysisResultAtom } from "../atoms/intakeAnalysisResultAtom";
import { intakeDataAtom } from "../atoms/intakeDataAtom"; // Add this for patient data
import { useRouter } from "next/navigation";
import { useState } from "react";
import { patientStoryAtom } from "../atoms/patientStoryAtom";

const IntakeAnalysisResultPage = () => {
	// Retrieve the analysis result and patient data from jotai atoms
	const [analysisResult] = useAtom(intakeAnalysisResultAtom);
	const [intakeData] = useAtom(intakeDataAtom);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [patientStory, setPatientStory] = useAtom(patientStoryAtom);
	if (!analysisResult) {
		return (
			<div className="max-w-4xl mx-auto p-8">
				<h1 className="text-2xl font-bold">No Data Found</h1>
				<p>Something went wrong. Please try submitting the form again.</p>
			</div>
		);
	}

	// Get today's date
	const today = new Date().toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// API Call for Patient Story
	const fetchPatientStory = async () => {
		setLoading(true);
		try {
			const response = await fetch("http://localhost:8000/api/patient_story", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(intakeData), // Use patient data for the API call
			});

			if (!response.ok) {
				throw new Error("Failed to fetch patient story");
			}

			const data = await response.json();
			setPatientStory(data.story);
			router.push("/chat-with-dr-ray");
		} catch (error) {
			console.error("Error fetching patient story:", error);
			alert("Unable to fetch the patient story. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="max-w-7xl mx-auto p-6 space-y-8">
			<header className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-semibold">Intake Analysis Results</h1>
					<p className="text-sm text-muted-foreground">
						Patient ID: #12345 | {today}
					</p>
				</div>
				<Badge variant="success">Reviewed</Badge>
			</header>

			<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					{/* Primary Diagnosis */}
					<Card>
						<CardHeader>
							<CardTitle>Primary Diagnosis</CardTitle>
							<CardDescription>
								{analysisResult.main_diagnosis.reasoning}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex justify-between">
								<div>
									<h3 className="text-xl font-semibold">
										{analysisResult.main_diagnosis.diagnosis}
									</h3>
									<p className="text-sm text-muted-foreground">
										ICD-10: {analysisResult.main_diagnosis.icd10_code}
									</p>
									<p className="text-sm text-muted-foreground mt-2">
										Simple Explanation:{" "}
										{analysisResult.main_diagnosis.simple_explanation}
									</p>
								</div>
								<div className="text-right">
									<p className="text-2xl font-bold">
										{Math.round(
											analysisResult.main_diagnosis.probability * 100
										)}
										%
									</p>
									<p className="text-sm text-muted-foreground">Confidence</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Differentiation Probabilities */}
					<Card>
						<CardHeader>
							<CardTitle>Differentiation Probabilities</CardTitle>
						</CardHeader>
						<CardContent>
							{analysisResult.differentiation_probabilities.map(
								(item, index) => (
									<div key={index} className="mb-4">
										<div className="flex justify-between text-sm">
											<span>{item.diagnosis}</span>
											<span>{Math.round(item.probability * 100)}%</span>
										</div>
										<Progress value={item.probability * 100} />
									</div>
								)
							)}
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Serious vs Treatable */}
					<Card>
						<CardHeader>
							<CardTitle>Serious vs Treatable</CardTitle>
						</CardHeader>
						<CardContent className="text-center">
							<Badge
								variant={
									analysisResult.serious_vs_treatable.diagnosis.toLowerCase() ===
									"serious"
										? "destructive"
										: "success"
								}
							>
								{analysisResult.serious_vs_treatable.diagnosis}
							</Badge>
							<p className="text-lg font-bold mt-4">
								{Math.round(
									analysisResult.serious_vs_treatable.probability * 100
								)}
								% Probability
							</p>
						</CardContent>
					</Card>

					{/* Other Diagnoses */}
					<Card>
						<CardHeader>
							<CardTitle>Other Probable Diagnoses</CardTitle>
						</CardHeader>
						<CardContent>
							{analysisResult.other_probabilistic_diagnosis.map(
								(item, index) => (
									<div key={index} className="border-b last:border-0 py-2">
										<div className="flex justify-between">
											<div>
												<p className="font-medium">{item.diagnosis}</p>
												<p className="text-sm text-muted-foreground">
													ICD-10: {item.icd10_code}
												</p>
												<p className="text-sm text-muted-foreground mt-2">
													Simple Explanation: {item.simple_explanation}
												</p>
											</div>
											<p className="font-medium text-right">
												{Math.round(item.probability * 100)}%
											</p>
										</div>
									</div>
								)
							)}
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<footer className="flex justify-between mt-8">
				<div className="space-x-4">
					<Button variant="default">
						<i className="fas fa-download mr-2"></i>Download Report
					</Button>
					<Button
						variant="outline"
						onClick={fetchPatientStory}
						disabled={loading}
					>
						{loading ? (
							"Loading..."
						) : (
							<>
								<i className="fas fa-calendar-plus mr-2"></i> Chat with Dr. Ray
							</>
						)}
					</Button>
				</div>
				<Button variant="ghost">
					<i className="fas fa-notes-medical mr-2"></i>Add Notes
				</Button>
			</footer>
		</main>
	);
};

export default IntakeAnalysisResultPage;
