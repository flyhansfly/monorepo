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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE || '';

const IntakeAnalysisResultPage = () => {
	const [analysisResult] = useAtom(intakeAnalysisResultAtom);
	const router = useRouter();
	const [feedback, setFeedback] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Add logging to debug state
	console.log("Intake Analysis Result Page - Current state:", analysisResult);

	// Add useEffect to handle navigation if no result
	useEffect(() => {
		if (!analysisResult) {
			console.log("No analysis result found, redirecting to intake form...");
			router.push("/intake-form");
		}
	}, [analysisResult, router]);

	const handleProceedToTreatment = async () => {
		if (!feedback.trim()) {
			alert("Please provide your email or feedback to proceed to the detailed treatment plan.");
			return;
		}

		setIsSubmitting(true);
		try {
			// Log the analysis result to debug
			console.log("Analysis Result:", analysisResult);

			// Get session ID from analysis result
			const sessionId = analysisResult?.session_id;
			if (!sessionId) {
				throw new Error("No session ID found in analysis result");
			}

			// Log the data being sent
			console.log("Sending feedback data:", {
				feedback,
				session_id: sessionId,
				analysis_result: analysisResult
			});

			// Save feedback along with the analysis result and session ID
			const response = await fetch(`${apiBaseUrl}/api/intake_analysis/feedback`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					feedback,
					session_id: sessionId,
					analysis_result: analysisResult
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.detail?.error || "Failed to save feedback");
			}

			// Navigate to treatment plan with session ID
			router.push(`/treatment-plan?session_id=${sessionId}`);
		} catch (error) {
			console.error("Error saving feedback:", error);
			alert(error.message || "There was an error saving your feedback. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!analysisResult) {
		return (
			<div className="max-w-4xl mx-auto p-8">
				<h1 className="text-2xl font-bold">No Data Found</h1>
				<p>Something went wrong. Please try submitting the form again.</p>
				<Button 
					onClick={() => router.push("/intake-form")}
					className="mt-4"
				>
					Return to Intake Form
				</Button>
			</div>
		);
	}

	// Today's date
	const today = new Date().toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

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

						{/* Treatment Recommendations */}
						<Card>
							<CardHeader>
								<CardTitle>Treatment Recommendations</CardTitle>
							</CardHeader>
							<CardContent>
								{analysisResult.treatment_recommendations.map((item, idx) => (
									<div key={idx} className="mb-3">
										<h3 className="text-base font-semibold">{item.title}</h3>
										<p className="text-sm text-muted-foreground">{item.description}</p>
									</div>
								))}
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
			<footer className="flex flex-col gap-6">
				{/* Feedback Section */}
				<div className="bg-gray-50 p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-4">Get Your Detailed Treatment Plan</h3>
					<p className="text-sm text-gray-600 mb-4">
						To access your detailed treatment plan for {analysisResult.main_diagnosis.diagnosis}, 
						please provide your email or any feedback below.
					</p>
					<div className="space-y-4">
						<div>
							<Label htmlFor="feedback">Email or Feedback</Label>
							<Textarea
								id="feedback"
								placeholder="Enter your email or any feedback..."
								value={feedback}
								onChange={(e) => setFeedback(e.target.value)}
								className="mt-1"
							/>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleProceedToTreatment}
							disabled={isSubmitting}
						>
							<i className="fas fa-calendar-plus mr-1"></i>
							{isSubmitting ? "Processing..." : "Proceed to detailed treatment plan"}
						</Button>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
					<div className="space-x-2">
						<Button variant="default" size="sm">
							<i className="fas fa-download mr-1"></i>
							Download Report
						</Button>
					</div>
					<Button variant="ghost" size="sm">
						<i className="fas fa-notes-medical mr-1"></i>
						Add Notes
					</Button>
				</div>
			</footer>
		</main>
	);
};

export default IntakeAnalysisResultPage;
