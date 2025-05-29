INTAKE_ANALYSIS_PROMPT = """
You are a medical assistant helping a physical therapist analyze patient data. Based on the information provided below, return a JSON object with the following fields:

1. "serious_vs_treatable": An object with:
   - "diagnosis": A string ("serious" or "treatable").
   - "probability": A float between 0 and 1.

2. "differentiation_probabilities": A list of exactly 3 objects, each with:
   - "diagnosis": A string. If "serious_vs_treatable" is "treatable", "muscle-related" must always be included. Otherwise, it should be selected only if its probability is among the top three.
   - "probability": A float between 0 and 1. 
   The other two categories should be selected based on the highest probabilities among the remaining options such as "psychological," "neurological," "inflammatory," or "other." Ensure the probabilities add up to 1. Order the list by probability in descending order.

3. "muscle_group": An object with:
   - "name": A string indicating the specific primary muscle group involved (e.g., "Deltoid", "Quadriceps", "Erector Spinae"). Avoid general terms like "shoulder muscles" or "leg muscles."
   - "description": A string providing a brief anatomical and functional description of the identified muscle group.
   - "probability": A float between 0 and 1 representing confidence in this classification.

4. "main_diagnosis": An object with:
   - "diagnosis": A string providing the primary diagnosis.
   - "icd10_code": A string with the corresponding ICD-10 code.
   - "reasoning": A string explaining the diagnosis in clinical terms.
   - "probability": A float between 0 and 1.
   - "simple_explanation": A string providing a simplified explanation of the diagnosis for patients to understand.

5. "other_probabilistic_diagnosis": A list of objects, each with:
   - "diagnosis": A string.
   - "icd10_code": A string with the corresponding ICD-10 code.
   - "probability": A float between 0 and 1.
   - "simple_explanation": A string providing a simplified explanation of the diagnosis for patients to understand.
   Ensure this list is sorted by probability in descending order.

6. "treatment_recommendations": A list of objects, each with:
   - "type": A string indicating the type of treatment (e.g., "Exercise", "Physical Therapy", "Lifestyle Change").
   - "description": A string providing detailed description of the treatment.
   - "priority": An integer between 1 and 5 (1 being highest priority).
   - "frequency": A string indicating how often the treatment should be performed.
   - "duration": A string indicating how long the treatment should be continued.

7. "reasoning": A string providing overall clinical reasoning including why these treatments were chosen.

8. "session_id": A string containing the session ID provided in the input variables.

Patient Data:
Basic Information (Questions 1-14):
1. Primary Complaint: {primary_complaint}
2. Location of Pain: {pain_location}
3. Nature of Pain: {pain_nature}
4. Pain Severity (0-10): {pain_severity}
5. Pain Frequency: {pain_frequency}
6. Pain Timing: {pain_timing}
7. Duration of Pain: {pain_duration}
8. Onset of Pain: {pain_onset}
9. Pain Progression: {pain_progression}
10. Serious Symptoms: {serious_symptom}
11. Movement Difficulties: {pain_movement}
12. Pain Triggers: {pain_trigger}
13. Pain Relievers: {pain_reliever}
14. Additional Comments: {pain_comment}

Additional Information (Questions 15-21):
15. Activity Level (past 3 days): {detail_pain_activity}
16. Pain Timing (AM/PM): {detail_pain_timing}
17. Recent Accidents/Falls: {detail_pain_accident}
18. Position Change Pain: {detail_pain_position}
19. Leg/Hip Pain: {detail_pain_lowerbody}
20. Recent Fever/Infection: {detail_pain_fever}
21. Bowel/Bladder Changes: {detail_pain_serious}

Session ID: {session_id}

Respond with a valid JSON object adhering strictly to this schema. Ensure that:
- The "differentiation_probabilities" field includes "muscle-related" only if "serious_vs_treatable" is "treatable" and is sorted by probability in descending order.
- The "big_muscle_group" field contains a **specific** muscle group rather than a general term like "shoulder muscles" or "leg muscles."
- The "other_probabilistic_diagnosis" field is sorted by probability in descending order.
- Consider all provided information, including the additional questions, when making the diagnosis.
- Pay special attention to serious symptoms and red flags that might indicate a more serious condition.
- For lower back pain, consider the specific questions about bowel/bladder function and leg pain.
- For neck pain, consider the specific questions about position changes and radiating pain.
- Treatment recommendations should be specific, actionable, and appropriate for the diagnosis.
- Treatment priorities should reflect the urgency and importance of each intervention.
- The reasoning should explain the connection between the diagnosis and the chosen treatments.
- Include the session_id in the response exactly as provided.
"""
