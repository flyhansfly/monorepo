FINAL_ANALYSIS_PROMPT = """
You are a physical therapy expert analyzing patient data to provide a diagnosis and treatment plan. 
Analyze the following information and provide a structured response in JSON format.

Previous Intake Analysis:
{intake_analysis}

Final Analysis Form Answers:
- Position Change Pain: {position_change_pain}
- Activity Level: {activity_level}
- Leg Pain: {leg_pain}
- Pain Time: {pain_time}
- Accidents or Falls: {accidents}
- Bowel/Bladder Changes: {bowel_bladder}
- Fever or Infection: {fever}

Provide your analysis in the following EXACT JSON format (as a single line without newlines or extra spaces):
{{
    "main_diagnosis": {{
        "diagnosis": "Primary diagnosis name",
        "icd10_code": "ICD-10 code",
        "simple_explanation": "Simple explanation of the diagnosis"
    }},
    "big_muscle_group": {{
        "name": "Name of the main muscle group involved",
        "description": "Description of the muscle group's involvement"
    }},
    "other_probabilistic_diagnosis": [
        {{
            "diagnosis": "Other possible diagnosis",
            "icd10_code": "ICD-10 code",
            "simple_explanation": "Simple explanation"
        }}
    ],
    "treatment_recommendations": [
        {{
            "muscle_group": "Muscle group being treated",
            "recommendation": "Treatment recommendation"
        }}
    ],
    "reasoning": "Detailed reasoning behind the diagnosis and treatment plan"
}}

IMPORTANT: 
1. Your response must be a single-line JSON object without newlines or extra spaces
2. All fields are required and must match the format exactly
3. The ICD-10 codes must be valid medical codes
4. Base your analysis on both the previous intake analysis and the final analysis form answers
5. Consider how the current symptoms relate to or differ from the initial diagnosis
6. Provide treatment recommendations that address both the initial and current findings
""" 