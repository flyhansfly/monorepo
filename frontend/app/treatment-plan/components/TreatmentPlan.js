import React from 'react';

const TreatmentPlan = ({ treatmentPlan }) => {
  const { treatment_focus, treatment_recommendations, reasoning, next_phase_focus } = treatmentPlan;

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      {/* Treatment Focus */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Current Focus</h2>
        <p className="text-gray-700 capitalize">{treatment_focus}</p>
      </div>

      {/* Exercises */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Recommended Exercises</h2>
        <div className="space-y-4">
          {treatment_recommendations.map((exercise, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{exercise.name}</h3>
              <div className="space-y-2">
                <p className="text-gray-700"><span className="font-medium">Description:</span> {exercise.description}</p>
                <p className="text-gray-700"><span className="font-medium">Sets:</span> {exercise.sets}</p>
                <p className="text-gray-700"><span className="font-medium">Reps:</span> {exercise.reps}</p>
                <p className="text-gray-700"><span className="font-medium">Frequency:</span> {exercise.frequency}</p>
                <p className="text-gray-700"><span className="font-medium">Duration:</span> {exercise.duration}</p>
                <p className="text-gray-700"><span className="font-medium">Precautions:</span> {exercise.precautions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Reasoning */}
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Clinical Reasoning</h2>
        <p className="text-gray-700">{reasoning}</p>
      </div>

      {/* Next Phase */}
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Next Phase Focus</h2>
        <p className="text-gray-700 capitalize">{next_phase_focus}</p>
      </div>
    </div>
  );
};

export default TreatmentPlan; 