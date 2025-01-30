// atoms/patientStoryAtom.js
import { atom } from "jotai";

export const intakeDataAtom = atom({
	primaryComplaint: "",
	locationOfPain: [],
	describePain: [],
	severity: 0,
	frequency: "",
	timing: [],
	duration: "",
	onset: "",
	progression: "",
	redFlags: [],
	redFlagDetails: "",
	movementDifficulties: [],
	affectedActivities: [],
	triggers: [],
	relievers: [],
});
