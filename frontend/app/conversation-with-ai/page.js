'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { conversationAtom } from '../atoms/conversationAtom';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConversationWithAI() {
    const [conversation, setConversation] = useAtom(conversationAtom);
    const [showWidget, setShowWidget] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Initialize ElevenLabs widget
        const script = document.createElement('script');
        script.src = 'https://widget.elevenlabs.io/widget.js';
        script.async = true;
        script.onload = () => {
            // Initialize the widget with your API key
            if (window.ElevenLabs) {
                window.ElevenLabs.init({
                    apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
                    voiceId: 'your_voice_id_here', // Replace with your voice ID
                    onComplete: handleConversationComplete
                });
                setShowWidget(true);
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleConversationComplete = async (data) => {
        try {
            // Send conversation data to backend
            const response = await fetch('http://localhost:8000/api/process_conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    questions: data.questions || [],
                    answers: data.answers || [],
                    patient_story: data.patient_story
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to process conversation');
            }

            const result = await response.json();
            
            // Update conversation state
            setConversation(prev => ({
                ...prev,
                questions: data.questions || [],
                answers: data.answers || [],
                isComplete: true
            }));

            // Navigate to the final analysis page
            router.push('/final-analysis-treatment-plan');
        } catch (error) {
            console.error('Error processing conversation:', error);
            alert('Failed to process conversation. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversation with AI Assistant</h1>
                        <p className="text-gray-600">Please interact with our AI assistant to provide additional information about your condition.</p>
                    </div>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>AI Assistant</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {showWidget && (
                                <div id="elevenlabs-widget" className="w-full"></div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Conversation History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {conversation.questions.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">Your conversation will appear here once you start interacting with the AI assistant.</p>
                                ) : (
                                    conversation.questions.map((question, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <p className="font-medium text-blue-900">AI: {question}</p>
                                            </div>
                                            {conversation.answers[index] && (
                                                <div className="bg-green-50 p-4 rounded-lg">
                                                    <p className="font-medium text-green-900">You: {conversation.answers[index]}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {conversation.isComplete && (
                        <div className="mt-8 text-center">
                            <Button
                                onClick={() => router.push('/final-analysis-treatment-plan')}
                                className="bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                View Treatment Plan
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 