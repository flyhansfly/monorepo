'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAtom } from 'jotai';
import { finalAnalysisResultAtom } from '../atoms/finalAnalysisResultAtom';

// Define constants to match backend enum values
const POSITION_CHANGE_PAIN = {
    NO_PAIN: "no pain",
    EXTENSION: "extension",
    FLEXION: "flexion"
};

const ACTIVITY_LEVEL = {
    NONE: "none",
    LIGHT: "light",
    MODERATE: "moderate",
    HEAVY: "heavy"
};

const PAIN_TIME = {
    AM: "AM",
    PM: "PM"
};

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function FinalAnalysis() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [, setAnalysisResult] = useAtom(finalAnalysisResultAtom);
    const [formData, setFormData] = useState({
        position_change_pain: POSITION_CHANGE_PAIN.NO_PAIN,
        activity_level: ACTIVITY_LEVEL.NONE,
        leg_pain: "no",
        pain_time: PAIN_TIME.AM,
        accidents: "no",
        bowel_bladder: "no",
        fever: "no"
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate all fields are filled
        const emptyFields = Object.entries(formData).filter(([_, value]) => !value);
        if (emptyFields.length > 0) {
            setError(`Please answer all questions. Missing: ${emptyFields.map(([key]) => key).join(', ')}`);
            setLoading(false);
            return;
        }

        try {
            console.log('Submitting form data:', formData);
            
            // First check if the backend is accessible
            try {
                const healthCheck = await fetch(`${API_BASE_URL}/api/health`);
                if (!healthCheck.ok) {
                    throw new Error('Backend server is not responding properly');
                }
            } catch (error) {
                console.error('Health check failed:', error);
                throw new Error('Cannot connect to the backend server. Please make sure it is running and accessible at ' + API_BASE_URL);
            }

            const response = await fetch(`${API_BASE_URL}/api/final-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    position_change_pain: formData.position_change_pain,
                    activity_level: formData.activity_level,
                    leg_pain: formData.leg_pain,
                    pain_time: formData.pain_time,
                    accidents: formData.accidents,
                    bowel_bladder: formData.bowel_bladder,
                    fever: formData.fever
                }),
            });

            let data;
            try {
                data = await response.json();
            } catch (error) {
                console.error('Failed to parse response:', error);
                throw new Error('Invalid response from server');
            }

            if (!response.ok) {
                console.error('Error response:', data);
                
                // Handle validation errors
                if (response.status === 422) {
                    throw new Error('Invalid form data. Please check your inputs and try again.');
                }
                
                // Handle empty response
                if (!data || Object.keys(data).length === 0) {
                    throw new Error('Server returned an empty response. Please try again later.');
                }
                
                // Handle specific error messages
                if (data.detail) {
                    throw new Error(data.detail);
                }
                
                throw new Error(`Server error (${response.status}): ${response.statusText}`);
            }

            // Handle successful response
            console.log('Success response:', data);
            // Store the result in the atom
            setAnalysisResult(data);
            // Navigate to treatment plan page
            router.push('/final-analysis-treatment-plan');
        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Final Analysis Questionnaire</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600">{error}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Position Change Pain */}
                            <div className="space-y-4">
                                <Label>Does your position change pain?</Label>
                                <RadioGroup
                                    onValueChange={(value) => handleChange('position_change_pain', value)}
                                    value={formData.position_change_pain}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={POSITION_CHANGE_PAIN.NO_PAIN} id="position-no-pain" />
                                        <Label htmlFor="position-no-pain">No Pain</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={POSITION_CHANGE_PAIN.EXTENSION} id="position-extension" />
                                        <Label htmlFor="position-extension">Yes, during extension</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={POSITION_CHANGE_PAIN.FLEXION} id="position-flexion" />
                                        <Label htmlFor="position-flexion">Yes, during flexion</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Activity Level */}
                            <div className="space-y-4">
                                <Label>How active have you been in the past 3 days?</Label>
                                <RadioGroup
                                    onValueChange={(value) => handleChange('activity_level', value)}
                                    value={formData.activity_level}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={ACTIVITY_LEVEL.NONE} id="activity-none" />
                                        <Label htmlFor="activity-none">None</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={ACTIVITY_LEVEL.LIGHT} id="activity-light" />
                                        <Label htmlFor="activity-light">Light</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={ACTIVITY_LEVEL.MODERATE} id="activity-moderate" />
                                        <Label htmlFor="activity-moderate">Moderate</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={ACTIVITY_LEVEL.HEAVY} id="activity-heavy" />
                                        <Label htmlFor="activity-heavy">Heavy</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Leg Pain */}
                            <div className="space-y-4">
                                <Label>Any pain down in your leg? (hip as well)</Label>
                                <RadioGroup
                                    onValueChange={(value) => handleChange('leg_pain', value)}
                                    value={formData.leg_pain}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="leg-yes" />
                                        <Label htmlFor="leg-yes">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="leg-no" />
                                        <Label htmlFor="leg-no">No</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Pain Time */}
                            <div className="space-y-4">
                                <Label>Is pain worse in the AM or PM?</Label>
                                <RadioGroup
                                    onValueChange={(value) => handleChange('pain_time', value)}
                                    value={formData.pain_time}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={PAIN_TIME.AM} id="time-am" />
                                        <Label htmlFor="time-am">AM</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value={PAIN_TIME.PM} id="time-pm" />
                                        <Label htmlFor="time-pm">PM</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Accidents */}
                            <div className="space-y-4">
                                <Label>Any accidents or falls in the past 3 days?</Label>
                                <RadioGroup
                                    onValueChange={(value) => handleChange('accidents', value)}
                                    value={formData.accidents}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="accidents-yes" />
                                        <Label htmlFor="accidents-yes">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="accidents-no" />
                                        <Label htmlFor="accidents-no">No</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Bowel/Bladder */}
                            <div className="space-y-4">
                                <Label>Any change in bowel or bladder function?</Label>
                                <RadioGroup
                                    onValueChange={(value) => handleChange('bowel_bladder', value)}
                                    value={formData.bowel_bladder}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="bowel-yes" />
                                        <Label htmlFor="bowel-yes">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="bowel-no" />
                                        <Label htmlFor="bowel-no">No</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Fever */}
                            <div className="space-y-4">
                                <Label>Any fever or infection in the past 3 days?</Label>
                                <RadioGroup
                                    onValueChange={(value) => handleChange('fever', value)}
                                    value={formData.fever}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="fever-yes" />
                                        <Label htmlFor="fever-yes">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="fever-no" />
                                        <Label htmlFor="fever-no">No</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/intake-analysis-result')}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Submit Analysis'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 