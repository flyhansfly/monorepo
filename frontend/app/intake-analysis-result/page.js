"use client";

import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { intakeAnalysisResultAtom } from "../atoms/intakeAnalysisResultAtom";
import { intakeDataAtom } from "../atoms/intakeDataAtom";
import { patientStoryAtom } from "../atoms/patientStoryAtom";
import { useRouter } from "next/navigation";
import { useState } from "react";

const IntakeAnalysisResultPage = () => {
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

	// Today's date
	const today = new Date().toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Fetch Patient Story
	const fetchPatientStory = async () => {
		setLoading(true);
		try {
			const response = await fetch("http://localhost:8000/api/patient_story", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(intakeData),
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
		<main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
			{/* Header */}
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
				<div>
					<h1 className="text-xl font-semibold">Intake Analysis Results</h1>
					<p className="text-sm text-muted-foreground">
						Patient ID: #12345 | {today}
					</p>
				</div>
				<Badge variant="success">Reviewed</Badge>
			</header>

			{/* Main 2-Column Container */}
			<section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
				{/* Left Column */}
				<div className="flex flex-col gap-4">
					{/* Row 1: Primary Diagnosis (full width in left column) */}
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
									<p className="text-sm mt-2 text-muted-foreground">
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

					{/* Row 2: Two columns side by side (Differentiation & Big Muscle) */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Differentiation Probabilities */}
						<Card>
							<CardHeader>
								<CardTitle>Differentiation Probabilities</CardTitle>
							</CardHeader>
							<CardContent>
								{analysisResult.differentiation_probabilities.map(
									(item, idx) => (
										<div key={idx} className="mb-3">
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

						{/* Big Muscle Group Involved */}
						<Card>
							<CardHeader>
								<CardTitle>Big Muscle Group Involved</CardTitle>
							</CardHeader>
							<CardContent>
								<h3 className="text-base font-semibold">
									{analysisResult.big_muscle_group.name}
								</h3>
								<p className="text-sm text-muted-foreground">
									{analysisResult.big_muscle_group.description}
								</p>
								<p className="text-sm font-semibold mt-2">
									Confidence:{" "}
									{Math.round(
										analysisResult.big_muscle_group.probability * 100
									)}
									%
								</p>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Right Column */}
				<div className="flex flex-col gap-4">
					{/* Serious vs Treatable */}
					<Card>
						<CardHeader>
							<CardTitle>Serious vs Treatable</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center justify-center">
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
							<p className="text-sm font-bold mt-2">
								{Math.round(
									analysisResult.serious_vs_treatable.probability * 100
								)}
								%
							</p>
							<p className="text-xs text-muted-foreground">Probability</p>
						</CardContent>
					</Card>

					{/* Other Probable Diagnoses */}
					<Card className="flex-grow">
						<CardHeader>
							<CardTitle>Other Probable Diagnoses</CardTitle>
						</CardHeader>
						<CardContent>
							{analysisResult.other_probabilistic_diagnosis.map((item, idx) => (
								<div key={idx} className="border-b last:border-0 py-2">
									<div className="flex justify-between text-sm">
										<div>
											<p className="font-medium">{item.diagnosis}</p>
											<p className="text-xs text-muted-foreground">
												ICD-10: {item.icd10_code}
											</p>
											<p className="text-xs text-muted-foreground mt-1">
												Simple Explanation: {item.simple_explanation}
											</p>
										</div>
										<p className="font-medium text-right">
											{Math.round(item.probability * 100)}%
										</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<footer className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
				<div className="space-x-2">
					<Button variant="default" size="sm">
						<i className="fas fa-download mr-1"></i>
						Download Report
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={fetchPatientStory}
						disabled={loading}
					>
						{loading ? (
							"Loading..."
						) : (
							<>
								<i className="fas fa-calendar-plus mr-1"></i>
								Chat with Dr. Ray
							</>
						)}
					</Button>
				</div>
				<Button variant="ghost" size="sm">
					<i className="fas fa-notes-medical mr-1"></i>
					Add Notes
				</Button>
			</footer>
		</main>
	);
};

export default IntakeAnalysisResultPage;
