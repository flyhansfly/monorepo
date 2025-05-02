"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { intakeAnalysisResultAtom } from "../atoms/intakeAnalysisResultAtom";
import { intakeDataAtom } from "../atoms/intakeDataAtom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";

// IntakeFormPage Component
// This component handles the medical intake form with 21 questions
// Questions 1-14 are always shown, while questions 15-21 are conditionally displayed
// based on the patient's pain location and other factors
const IntakeFormPage = () => {
	const router = useRouter();
	const [intakeData, setIntakeData] = useAtom(intakeDataAtom);
	const [, setAnalysisResult] = useAtom(intakeAnalysisResultAtom);
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: {
			primary_complaint: "",
			pain_location: [],
			pain_nature: [],
			pain_severity: "0",
			pain_frequency: "constant",
			pain_timing: [],
			pain_duration: "less_than_1_week",
			pain_onset: "gradually",
			pain_progression: "same",
			serious_symptom: [],
			pain_movement: "",
			pain_trigger: [],
			pain_reliever: [],
			pain_comment: "",
			detail_pain_activity: "medium",
			detail_pain_timing: "both",
			detail_pain_accident: "no",
			detail_pain_position: "no",
			detail_pain_lowerbody: "no",
			detail_pain_fever: "no",
			detail_pain_serious: "no",
		},
	});

	const painLocation = watch("pain_location");

	const onSubmit = async (data) => {
		setLoading(true);
		try {
			// Ensure all required fields are present and properly formatted
			const formData = {
				...data,
				pain_severity: parseInt(data.pain_severity || "0", 10),
				pain_frequency: data.pain_frequency || "constant",
				pain_duration: data.pain_duration || "less_than_1_week",
				pain_onset: data.pain_onset || "gradually",
				pain_progression: data.pain_progression || "same",
				detail_pain_activity: data.detail_pain_activity || "medium",
				detail_pain_timing: data.detail_pain_timing || "both",
				detail_pain_accident: data.detail_pain_accident || "no",
				detail_pain_position: data.detail_pain_position || "no",
				detail_pain_lowerbody: data.detail_pain_lowerbody || "no",
				detail_pain_fever: data.detail_pain_fever || "no",
				detail_pain_serious: data.detail_pain_serious || "no",
			};

			// Log the exact data being sent
			console.log("Form data before submission:", data);
			console.log("Processed data being sent to server:", formData);

			const response = await fetch("http://localhost:8000/api/intake_analysis", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Server error response:", errorData);
				console.error("Response status:", response.status);
				console.error("Response status text:", response.statusText);
				throw new Error(`Failed to analyze intake data: ${JSON.stringify(errorData.detail) || response.statusText}`);
			}

			const result = await response.json();
			console.log("Server response:", result);
			
			// Ensure the session ID is present
			if (!result.session_id) {
				throw new Error("No session ID received from server");
			}
			
			// Log state updates
			console.log("Setting intake data:", formData);
			setIntakeData(formData);
			console.log("Setting analysis result:", result);
			setAnalysisResult(result);
			
			// Add a small delay to ensure state is updated
			await new Promise(resolve => setTimeout(resolve, 100));
			
			console.log("Navigating to intake analysis result page...");
			router.push("/intake-analysis-result");
		} catch (error) {
			console.error("Error analyzing intake data:", error);
			alert("Unable to analyze the intake data. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-8">
			<h1 className="text-2xl font-bold mb-6">Patient Intake Form</h1>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* Basic Questions (1-14) */}
				<div className="space-y-4">
					<div>
						<Label htmlFor="primary_complaint">1. What is your primary complaint?</Label>
						<Input
							id="primary_complaint"
							{...register("primary_complaint", { required: true })}
						/>
					</div>

					<div>
						<Label>2. Where is the location of pain? (Check all that apply)</Label>
						<div className="space-y-2">
							{[
								"lower_back",
								"neck",
								"elbow",
								"knee",
								"ankle",
								"wrist",
								"foot",
								"upper_back",
								"shoulder",
								"hip",
								"other",
							].map((location) => (
								<div key={location} className="flex items-center space-x-2">
									<Checkbox
										id={location}
										{...register("pain_location")}
										value={location}
									/>
									<Label htmlFor={location}>
										{location.split("_").join(" ").toUpperCase()}
									</Label>
								</div>
							))}
						</div>
					</div>

					<div>
						<Label>3. What is the nature of pain? (Check all that apply)</Label>
						<div className="space-y-2">
							{[
								"sharp",
								"dull",
								"throbbing",
								"burning",
								"aching",
								"stabbing",
								"radiating",
								"tingling",
								"numbness",
							].map((nature) => (
								<div key={nature} className="flex items-center space-x-2">
									<Checkbox
										id={nature}
										{...register("pain_nature")}
										value={nature}
									/>
									<Label htmlFor={nature}>
										{nature.split("_").join(" ").toUpperCase()}
									</Label>
								</div>
							))}
						</div>
					</div>

					<div>
						<Label htmlFor="pain_severity">4. How severe is the pain on the scale of 0 to 10?</Label>
						<Select
							onValueChange={(value) =>
								register("pain_severity").onChange({ target: { value } })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select severity" />
							</SelectTrigger>
							<SelectContent>
								{[...Array(11)].map((_, i) => (
									<SelectItem key={i} value={i.toString()}>
										{i}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="pain_frequency">5. Is the pain constant or intermittent?</Label>
						<Select
							onValueChange={(value) =>
								register("pain_frequency").onChange({ target: { value } })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select frequency" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="constant">Constant</SelectItem>
								<SelectItem value="intermittent">Intermittent</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>6. When do you have pain? (Check all that apply)</Label>
						<div className="space-y-2">
							{[
								"morning",
								"afternoon",
								"evening",
								"night",
								"during_activity",
								"at_rest",
							].map((timing) => (
								<div key={timing} className="flex items-center space-x-2">
									<Checkbox
										id={timing}
										{...register("pain_timing")}
										value={timing}
									/>
									<Label htmlFor={timing}>
										{timing.split("_").join(" ").toUpperCase()}
									</Label>
								</div>
							))}
						</div>
					</div>

					<div>
						<Label htmlFor="pain_duration">7. How long did you have this pain?</Label>
						<Select
							onValueChange={(value) =>
								register("pain_duration").onChange({ target: { value } })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select duration" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="less_than_1_week">Less than 1 week</SelectItem>
								<SelectItem value="1_4_weeks">1-4 weeks</SelectItem>
								<SelectItem value="1_3_months">1-3 months</SelectItem>
								<SelectItem value="over_3_months">Over 3 months</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="pain_onset">8. When did the pain start?</Label>
						<Select
							onValueChange={(value) =>
								register("pain_onset").onChange({ target: { value } })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select onset" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="gradually">Gradually over time</SelectItem>
								<SelectItem value="after_surgery">After surgery</SelectItem>
								<SelectItem value="suddenly">Suddenly (e.g., injury, accident, heavy exercise)</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="pain_progression">9. How did the pain change?</Label>
						<Select
							onValueChange={(value) =>
								register("pain_progression").onChange({ target: { value } })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select progression" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="worse">Gotten worse</SelectItem>
								<SelectItem value="same">Stayed the same</SelectItem>
								<SelectItem value="improved">Improved</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>10. Do you have any of these symptoms? (Check all that apply)</Label>
						<div className="space-y-2">
							{[
								"unexplained_weight_loss",
								"bowel_bladder_issues",
								"numbness_spreading",
								"severe_leg_weakness",
								"fever_chills",
								"night_sweats",
								"recent_infection",
							].map((symptom) => (
								<div key={symptom} className="flex items-center space-x-2">
									<Checkbox
										id={symptom}
										{...register("serious_symptom")}
										value={symptom}
									/>
									<Label htmlFor={symptom}>
										{symptom.split("_").join(" ").toUpperCase()}
									</Label>
								</div>
							))}
						</div>
					</div>

					<div>
						<Label htmlFor="pain_movement">11. Do you have any movement difficulties in the area of or due to your primary complaint?</Label>
						<Textarea
							id="pain_movement"
							{...register("pain_movement", { required: true })}
						/>
					</div>

					<div>
						<Label>12. What triggers your pain? (Check all that apply)</Label>
						<div className="space-y-2">
							{[
								"sitting",
								"standing",
								"walking",
								"lifting",
								"bending",
								"physical_activity",
								"physical_stress",
								"other",
							].map((trigger) => (
								<div key={trigger} className="flex items-center space-x-2">
									<Checkbox
										id={trigger}
										{...register("pain_trigger")}
										value={trigger}
									/>
									<Label htmlFor={trigger}>
										{trigger.split("_").join(" ").toUpperCase()}
									</Label>
								</div>
							))}
						</div>
					</div>

					<div>
						<Label>13. What relieves your pain? (Check all that apply)</Label>
						<div className="space-y-2">
							{[
								"rest",
								"heat",
								"cold",
								"medication",
								"stretching",
								"massage",
								"physical_therapy",
								"changing_positions",
								"exercise",
								"other",
							].map((reliever) => (
								<div key={reliever} className="flex items-center space-x-2">
									<Checkbox
										id={reliever}
										{...register("pain_reliever")}
										value={reliever}
									/>
									<Label htmlFor={reliever}>
										{reliever.split("_").join(" ").toUpperCase()}
									</Label>
								</div>
							))}
						</div>
					</div>

					<div>
						<Label htmlFor="pain_comment">14. If you have any details or comments to add, please do so.</Label>
						<Textarea
							id="pain_comment"
							{...register("pain_comment")}
						/>
					</div>
				</div>

				{/* Additional Questions (15-21) based on pain location */}
				{!painLocation?.includes("other") && (
					<div className="space-y-4 mt-6">
						<h2 className="text-xl font-semibold">More Questions for Detailed Analysis</h2>

						<div>
							<Label htmlFor="detail_pain_activity">15. How active have you been in the past 3 days?</Label>
							<Select
								onValueChange={(value) =>
									register("detail_pain_activity").onChange({ target: { value } })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select activity level" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="low">Low</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="detail_pain_timing">16. Is pain worse in the AM or PM?</Label>
							<Select
								onValueChange={(value) =>
									register("detail_pain_timing").onChange({ target: { value } })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select timing" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="am">AM</SelectItem>
									<SelectItem value="pm">PM</SelectItem>
									<SelectItem value="both">Both</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="detail_pain_accident">17. Any accidents or falls in the past 3 days?</Label>
							<Select
								onValueChange={(value) =>
									register("detail_pain_accident").onChange({ target: { value } })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select answer" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="yes">Yes</SelectItem>
									<SelectItem value="no">No</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{(painLocation?.includes("lower_back") || painLocation?.includes("neck")) && (
							<>
								<div>
									<Label htmlFor="detail_pain_position">18. Does your position change pain?</Label>
									<Select
										onValueChange={(value) =>
											register("detail_pain_position").onChange({ target: { value } })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select answer" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="no">No</SelectItem>
											<SelectItem value="yes_flexion">Yes during flexion</SelectItem>
											<SelectItem value="yes_extension">Yes during extension</SelectItem>
											<SelectItem value="yes_both">Yes during both</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="detail_pain_lowerbody">19. Any pain down in your leg (hip as well)?</Label>
									<Select
										onValueChange={(value) =>
											register("detail_pain_lowerbody").onChange({ target: { value } })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select answer" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="yes">Yes</SelectItem>
											<SelectItem value="no">No</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="detail_pain_fever">20. Any fever or infection in the past 3 days?</Label>
									<Select
										onValueChange={(value) =>
											register("detail_pain_fever").onChange({ target: { value } })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select answer" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="yes">Yes</SelectItem>
											<SelectItem value="no">No</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</>
						)}

						{painLocation?.includes("lower_back") && (
							<div>
								<Label htmlFor="detail_pain_serious">21. Any change in bowel or bladder function?</Label>
								<Select
									onValueChange={(value) =>
										register("detail_pain_serious").onChange({ target: { value } })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select answer" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="no">No</SelectItem>
										<SelectItem value="yes_bowel">Yes (change in bowel function)</SelectItem>
										<SelectItem value="yes_bladder">Yes (change in bladder)</SelectItem>
										<SelectItem value="both">Both</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</div>
				)}

				<div className="flex justify-end space-x-4">
					<Button
						type="submit"
						disabled={loading}
						className="bg-blue-600 hover:bg-blue-700"
					>
						{loading ? "Submitting..." : "Submit"}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default IntakeFormPage;
