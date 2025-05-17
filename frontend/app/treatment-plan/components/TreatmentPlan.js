import React from 'react';

const TreatmentPlan = ({ treatmentPlan }) => {
  const { treatment_focus, treatment_recommendations, reasoning, next_phase_focus } = treatmentPlan;

  return (
    <div className="bg-card shadow-sm border border-slate-200 rounded-lg p-6 space-y-6">
      {/* Treatment Focus */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-card-foreground mb-2">Current Focus</h2>
        <p className="text-foreground capitalize">{treatment_focus}</p>
      </div>

      {/* Exercises */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-card-foreground">Recommended Exercises</h2>
        <div className="space-y-4">
          {treatment_recommendations.map((exercise, index) => (
            <div key={index} className="bg-muted border border-slate-100 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-medium text-card-foreground mb-2">{exercise.name}</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground"><span className="font-medium">Description:</span> {exercise.description}</p>
                <p className="text-muted-foreground"><span className="font-medium">Sets:</span> {exercise.sets}</p>
                <p className="text-muted-foreground"><span className="font-medium">Reps:</span> {exercise.reps}</p>
                <p className="text-muted-foreground"><span className="font-medium">Frequency:</span> {exercise.frequency}</p>
                <p className="text-muted-foreground"><span className="font-medium">Duration:</span> {exercise.duration}</p>
                <p className="text-muted-foreground"><span className="font-medium">Precautions:</span> {exercise.precautions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Reasoning */}
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold text-card-foreground mb-2">Clinical Reasoning</h2>
        <p className="text-muted-foreground">{reasoning}</p>
      </div>

      {/* Next Phase */}
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold text-card-foreground mb-2">Next Phase Focus</h2>
        <p className="text-foreground capitalize">{next_phase_focus}</p>
      </div>
    </div>
  );
};

export default TreatmentPlan; 