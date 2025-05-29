import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const { feedback, analysisResult } = await request.json();
        
        // Create feedback directory in the data folder if it doesn't exist
        const feedbackDir = path.join(process.cwd(), '..', 'data', 'feedback');
        if (!fs.existsSync(feedbackDir)) {
            fs.mkdirSync(feedbackDir, { recursive: true });
        }

        // Use a single JSON file for all feedback
        const filePath = path.join(feedbackDir, 'feedback.json');

        // Create new feedback entry matching the final_analysis_responses.jsonl structure
        const newEntry = {
            timestamp: new Date().toISOString(),
            session_id: "session_id", // Default session ID
            form_data: {}, // Empty form data since we don't have it
            analysis_result: analysisResult, // The full analysis result
            feedback: feedback,
            source: "user_generated"
        };

        let feedbackData = [];
        
        // If file exists, read current data
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            feedbackData = JSON.parse(fileContent);
        }

        // Add new entry
        feedbackData.push(newEntry);

        // Write updated data back to file
        fs.writeFileSync(filePath, JSON.stringify(feedbackData, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving feedback:', error);
        return NextResponse.json(
            { error: 'Failed to save feedback' },
            { status: 500 }
        );
    }
} 