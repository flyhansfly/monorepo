"use client";

import React from "react";
import { useAtom } from "jotai";
import { treatmentPlanAtom } from "../../atoms/treatmentPlanAtom";

const TreatmentPlan = () => {
	const [treatmentPlan] = useAtom(treatmentPlanAtom);

	if (!treatmentPlan) {
		return (
			<p>
				No treatment plan available. Please complete the chatbot conversation.
			</p>
		);
	}

	return (
		<div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
			<h1 className="text-2xl font-bold mb-4">
				Final Analysis and Treatment Plan
			</h1>
			<p className="text-lg mb-6">{treatmentPlan.analysis}</p>
			<h2 className="text-xl font-semibold">Treatment Plan:</h2>
			<ul className="list-disc pl-5">
				{treatmentPlan.steps.map((step, index) => (
					<li key={index} className="mb-2">
						{step}
					</li>
				))}
			</ul>
		</div>
	);
};

export default TreatmentPlan;
