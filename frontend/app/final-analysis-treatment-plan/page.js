"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { finalAnalysisResultAtom } from '../atoms/finalAnalysisResultAtom';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function FinalAnalysisTreatmentPlan() {
	const router = useRouter();
	const [analysisResult] = useAtom(finalAnalysisResultAtom);

	if (!analysisResult) {
		return (
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="max-w-4xl mx-auto px-4">
					<Card>
						<CardHeader>
							<CardTitle>No Analysis Results Available</CardTitle>
						</CardHeader>
						<CardContent>
							<p>Please complete the final analysis questionnaire first.</p>
							<Button 
								onClick={() => router.push('/final-analysis')}
								className="mt-4"
							>
								Go to Final Analysis
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	// Validate required fields
	const requiredFields = [
		'main_diagnosis',
		'big_muscle_group',
		'other_probabilistic_diagnosis',
		'treatment_recommendations',
		'serious_vs_treatable',
		'differentiation_probabilities'
	];

	const missingFields = requiredFields.filter(field => !analysisResult[field]);
	if (missingFields.length > 0) {
		return (
			<div className="min-h-screen bg-gray-50 py-12">
				<div className="max-w-4xl mx-auto px-4">
					<Card>
						<CardHeader>
							<CardTitle>Invalid Analysis Results</CardTitle>
						</CardHeader>
						<CardContent>
							<p>Some required data is missing from the analysis results:</p>
							<ul className="list-disc pl-5 mt-2">
								{missingFields.map(field => (
									<li key={field}>{field}</li>
								))}
							</ul>
							<Button 
								onClick={() => router.push('/final-analysis')}
								className="mt-4"
							>
								Try Again
							</Button>
						</CardContent>
					</Card>
				</div>
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
					<h1 className="text-xl font-semibold">Final Analysis Results</h1>
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

			{/* Treatment Recommendations */}
			<section className="mt-6">
				<Card>
					<CardHeader>
						<CardTitle>Treatment Recommendations</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{analysisResult.treatment_recommendations.map((rec, idx) => (
								<div key={idx} className="border-b last:border-0 pb-4">
									<div className="flex justify-between items-start">
										<div>
											<h3 className="font-semibold">{rec.type}</h3>
											<p className="text-sm text-muted-foreground mt-1">
												{rec.description}
											</p>
										</div>
										<Badge variant="outline">
											Priority {rec.priority}
										</Badge>
									</div>
									<div className="mt-2 text-sm text-muted-foreground">
										<p>Frequency: {rec.frequency}</p>
										<p>Duration: {rec.duration}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Footer */}
			<footer className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
				<div className="space-x-2">
					<Button variant="default" size="sm">
						<i className="fas fa-download mr-1"></i>
						Download Report
					</Button>
				</div>
			</footer>

			{/* Feedback Section */}
			<section className="mt-8">
				<Card>
					<CardHeader>
						<CardTitle>We'd Love to Hear from You!</CardTitle>
						<CardDescription className="text-lg">
							Put in your email for detailed analysis and treatment review OR to give us a feedback (we would love one!!)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={async (e) => {
							e.preventDefault();
							const formData = new FormData(e.target);
							const feedback = formData.get('feedback');
							
							try {
								const response = await fetch('/api/feedback', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({
										feedback,
										analysisResult
									}),
								});

								if (response.ok) {
									alert('Thank you for your feedback! We appreciate your input.');
								} else {
									alert('Failed to submit feedback. Please try again.');
								}
							} catch (error) {
								console.error('Error submitting feedback:', error);
								alert('An error occurred. Please try again.');
							}
						}} className="space-y-4">
							<textarea
								name="feedback"
								placeholder="Enter your email or feedback here..."
								className="w-full p-4 border rounded-md min-h-[100px] text-lg"
							/>
							<Button type="submit" variant="default" className="w-full">
								Submit
							</Button>
						</form>
					</CardContent>
				</Card>
			</section>
		</main>
	);
}
