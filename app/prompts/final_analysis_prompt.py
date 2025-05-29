FINAL_ANALYSIS_PROMPT = """
You are a physical therapy expert reviewing a patient's intake analysis to provide a focused treatment plan. 
Based on the following intake analysis, provide a structured response in JSON format.

Previous Intake Analysis:
{intake_analysis}

IMPORTANT: Your response must be a valid JSON object with the following structure:
{
    "treatment_focus": "pain/mobility/strength",
    "treatment_recommendations": [
        {
            "type": "Exercise",
            "name": "Name of the exercise",
            "description": "Detailed description of how to perform the exercise, including proper form and technique",
            "sets": "Number of sets",
            "reps": "Number of repetitions per set",
            "frequency": "How many times per day",
            "duration": "1 week",
            "precautions": "Any specific precautions or modifications to consider"
        }
    ],
    "reasoning": "Overall clinical reasoning explaining why these specific exercises were chosen for this diagnosis",
    "next_phase_focus": "Brief explanation of which aspect (pain/mobility/strength) should be addressed in the next phase"
}

CRITICAL INSTRUCTIONS:
1. Your response must be a valid JSON object that can be parsed by a JSON parser
2. Do not include any markdown formatting (no ```json or ```)
3. All fields are required and must match the format exactly
4. Choose ONE primary focus area (pain, mobility, or strength) based on the patient's current condition and needs
5. Provide EXACTLY 3 exercises that:
   - Are appropriate for the patient's current condition
   - Can be performed safely at home
   - Are progressive in nature (start easier, get more challenging)
   - Target the specific muscle group or area identified in the diagnosis
6. For each exercise, include:
   - A clear, descriptive name
   - Detailed instructions for proper form
   - Specific number of sets and reps
   - Frequency (how many times per day)
   - Any necessary precautions or modifications
7. The reasoning should explain:
   - Why this specific focus area was chosen
   - How each exercise addresses the main diagnosis
   - What improvements to expect after one week
8. The next_phase_focus should explain which of the remaining aspects (pain/mobility/strength) should be addressed in the next phase and why
9. Do not include any explanatory text before or after the JSON object
10. All strings must be properly escaped
11. The response must start with { and end with }

Remember: This is a one-week treatment plan with exactly 3 exercises. The patient will return for re-evaluation after completing this phase, at which point we can address the other aspects of their condition. Choose exercises that are appropriate for the patient's current level and that will provide a good foundation for future progress.
""" 