'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { conversationAtom } from '../atoms/conversationAtom';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConversationWithAI() {
    const [conversation, setConversation] = useAtom(conversationAtom);
    const router = useRouter();

    const handleConversationEnd = async (event) => {
        try {
            // Get conversation details from the event
            const { conversationId } = event.detail;
            
            // Fetch conversation transcript from ElevenLabs API
            const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
                headers: {
                    'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch conversation transcript');
            }
            
            const conversationData = await response.json();
            
            // Send transcript to backend for analysis
            const analysisResponse = await fetch('/api/process-conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    transcript: conversationData.transcript,
                    metadata: conversationData.metadata
                }),
            });

            if (!analysisResponse.ok) {
                throw new Error('Failed to process conversation');
            }

            const analysisResult = await analysisResponse.json();
            
            // Update conversation state with analysis result
            setConversation(prev => ({
                ...prev,
                analysisResult,
                isComplete: true
            }));

            // Navigate to final analysis page
            router.push('/final-analysis-treatment-plan');
        } catch (error) {
            console.error('Error processing conversation:', error);
            alert('Failed to process conversation. Please try again.');
        }
    };

    useEffect(() => {
        // Add the ElevenLabs conversation widget script
        const script = document.createElement('script');
        script.src = 'https://elevenlabs.io/convai-widget/index.js';
        script.async = true;
        document.body.appendChild(script);

        // Add event listener for conversation end
        window.addEventListener('elevenlabs-conversation-end', handleConversationEnd);

        return () => {
            document.body.removeChild(script);
            window.removeEventListener('elevenlabs-conversation-end', handleConversationEnd);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversation with AI Assistant for Detailed Questionnaire</h1>
                        <p className="text-gray-600">Please interact with our AI assistant to provide additional information about your condition.</p>
                        <p className="text-gray-600">This will give as a better understanding of your condition and help us create a more personalized treatment plan.</p>
                    </div>

                    <Card className="mb-8 w-[400px] mx-auto">
                        <CardHeader className="border-b py-2">
                            <CardTitle className="text-xl">AI Assistant</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="w-full h-[300px] relative">
                                <elevenlabs-convai 
                                    agent-id="ojsxNAU3sV8Ox3qVEc9n"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%'
                                    }}
                                ></elevenlabs-convai>
                            </div>
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