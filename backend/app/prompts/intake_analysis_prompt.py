INTAKE_ANALYSIS_PROMPT = """
You are a medical assistant helping a physical therapist analyze patient data. Based on the information provided below, return a JSON object with the following fields:
1. "serious_vs_treatable": A classification of whether the case is serious or treatable.
2. "differentiation_probabilities": Probabilities for the following categories: "muscle-related", "psychological", and "other".
3. "icd10_codes": A list of potential ICD-10 codes.
4. "recommendations": General advice or next steps, if applicable.

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

Respond with only a valid JSON object.
"""
