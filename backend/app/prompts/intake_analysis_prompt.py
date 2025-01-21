INTAKE_ANALYSIS_PROMPT = """
You are a medical assistant helping a physical therapist analyze patient data. Based on the information provided below, return a JSON object with the following fields:

1. "serious_vs_treatable": An object with "diagnosis" (a string: "serious" or "treatable") and "probability" (a float between 0 and 1).
2. "differentiation_probabilities": A list of objects, each with "diagnosis" (a string: "muscle-related", "psychological", or "other") and "probability" (a float between 0 and 1). Ensure the probabilities add up to 1.
3. "main_diagnosis": An object with "diagnosis" (a string), "icd10_code" (a string), "reasoning" (a string explaining the diagnosis), and "probability" (a float between 0 and 1).
4. "other_probabilistic_diagnosis": A list of objects, each with "diagnosis" (a string), "icd10_code" (a string), and "probability" (a float between 0 and 1).

Patient Data:
Primary Complaint: {primary_complaint}
Location of Pain: {location_of_pain}
Describe the Pain: {describe_pain}
Severity (0-10): {severity}
Frequency: {frequency}
Timing: {timing}
Duration of Symptoms: {duration_of_symptoms}
Onset of Pain: {onset_of_pain}
Symptom Progression: {symptom_progression}
Red Flag Symptoms: {red_flag_symptoms}
Red Flag Details: {red_flag_details}
Movement Difficulties: {movement_difficulties}
Activities Affected: {activities_affected}
Symptom Triggers: {symptom_triggers}
Symptom Relievers: {symptom_relievers}

Respond with only a valid JSON object matching the schema exactly.
"""
