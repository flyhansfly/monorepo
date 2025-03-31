CONVERSATION_ANALYSIS_PROMPT = """You are an expert medical professional analyzing a conversation between an AI assistant and a patient. Your task is to analyze the conversation transcript and provide a comprehensive analysis.

Conversation Transcript:
{transcript}

Additional Metadata:
{metadata}

Based on the conversation above, please provide:
1. A concise summary of the patient's condition and concerns
2. Key points discussed during the conversation
3. Specific recommendations for the patient
4. Any identified risk factors
5. Treatment suggestions

Your analysis should be structured and formatted as follows:
{
    "summary": "A clear and concise summary of the patient's condition",
    "key_points": [
        "List of important points discussed",
        "Include symptoms mentioned",
        "Include relevant medical history"
    ],
    "recommendations": [
        "Specific actionable recommendations",
        "Lifestyle changes if applicable",
        "Follow-up steps"
    ],
    "risk_factors": [
        "Identified risk factors",
        "Potential complications",
        "Areas of concern"
    ],
    "treatment_suggestions": [
        "Suggested treatments",
        "Potential medications",
        "Therapy recommendations"
    ]
}

Please ensure your analysis is thorough, professional, and focuses on actionable insights that will be valuable for the patient's treatment plan.""" 