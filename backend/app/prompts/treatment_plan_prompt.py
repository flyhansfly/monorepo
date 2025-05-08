"""
Treatment Plan Prompt

IMPORTANT: This prompt uses double curly braces {{}} for JSON examples to ensure proper string formatting.
The LLM service expects a single line of JSON with no indentation.

Example format:
{{"field": "value", "array": [{{"nested": "value"}}]}}

See LLM service documentation for more details about JSON formatting requirements.
"""

TREATMENT_PLAN_PROMPT = """You are a physical therapist creating a treatment plan for a patient. Based on the analysis of their intake form and feedback, create a personalized treatment plan.

Patient Information:
{intake_analysis}

The treatment plan should include:
1. Treatment focus (e.g., pain management, strength building, flexibility)
2. Specific treatment recommendations with:
   - Exercise name
   - Description
   - Sets and reps
   - Frequency
   - Duration
   - Precautions
3. Reasoning for the treatment approach
4. Focus for the next phase of treatment

Your response must be a single line of valid JSON with no formatting or indentation. Example:
{{"treatment_focus":"pain management and mobility","treatment_recommendations":[{{"name":"Neck Retraction Exercise","description":"Gentle exercise to improve neck posture and reduce strain","sets":"3","reps":"10","frequency":"Twice daily","duration":"2 weeks","precautions":"Stop if pain increases. Keep movements slow and controlled."}}],"reasoning":"This treatment plan focuses on reducing pain and improving neck mobility through gentle exercises.","next_phase_focus":"strength building"}}

Required fields:
- treatment_focus (string)
- treatment_recommendations (array of exactly 3 objects with: name, description, sets, reps, frequency, duration, precautions)
- reasoning (string)
- next_phase_focus (string)

Session ID: {session_id}""" 