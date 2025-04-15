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

IMPORTANT: Your response must be a valid JSON object with the following structure:
{{
    "main_diagnosis": {{
        "diagnosis": "Primary diagnosis name",
        "icd10_code": "ICD-10 code",
        "simple_explanation": "Simple explanation of the diagnosis",
        "probability": 0.85,
        "reasoning": "Clinical reasoning for this diagnosis"
    }},
    "big_muscle_group": {{
        "name": "Name of the main muscle group involved",
        "description": "Description of the muscle group's involvement",
        "probability": 0.9
    }},
    "other_probabilistic_diagnosis": [
        {{
            "diagnosis": "Other possible diagnosis",
            "icd10_code": "ICD-10 code",
            "simple_explanation": "Simple explanation",
            "probability": 0.15
        }}
    ],
    "treatment_recommendations": [
        {{
            "type": "Exercise/Physical Therapy/Lifestyle Change",
            "description": "Detailed description of the treatment",
            "priority": 1,
            "frequency": "3 times per week",
            "duration": "4 weeks"
        }}
    ],
    "reasoning": "Overall clinical reasoning including why these treatments were chosen",
    "serious_vs_treatable": {{
        "diagnosis": "Serious or Treatable",
        "probability": 0.95
    }},
    "differentiation_probabilities": [
        {{
            "diagnosis": "Diagnosis 1",
            "probability": 0.4
        }},
        {{
            "diagnosis": "Diagnosis 2",
            "probability": 0.3
        }},
        {{
            "diagnosis": "Diagnosis 3",
            "probability": 0.3
        }}
    ]
}}

CRITICAL INSTRUCTIONS:
1. Your response must be a valid JSON object that can be parsed by a JSON parser
2. Do not include any markdown formatting (no ```json or ```)
3. All fields are required and must match the format exactly
4. The ICD-10 codes must be valid medical codes
5. Base your analysis on both the previous intake analysis and the final analysis form answers
6. Consider how the current symptoms relate to or differ from the initial diagnosis
7. Provide treatment recommendations that address both the initial and current findings
8. Treatment priority should be 1-5 where 1 is highest priority
9. Probabilities should be between 0 and 1
10. The differentiation_probabilities must sum to 1
11. The serious_vs_treatable diagnosis should be either "Serious" or "Treatable"
12. Do not include any explanatory text before or after the JSON object
13. All strings must be properly escaped
14. All numeric values must be valid numbers (not strings)
15. The response must start with {{ and end with }}
""" 