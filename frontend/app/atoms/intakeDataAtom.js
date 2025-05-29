// atoms/intakeDataAtom.js
import { atom } from "jotai";

export const intakeDataAtom = atom({
	primary_complaint: "",
	pain_location: [],
	pain_nature: [],
	pain_severity: 0,
	pain_frequency: "",
	pain_timing: [],
	pain_duration: "",
	pain_onset: "",
	pain_progression: "",
	serious_symptom: [],
	pain_movement: "",
	pain_trigger: [],
	pain_reliever: [],
	pain_comment: "",
	detail_pain_activity: null,
	detail_pain_timing: null,
	detail_pain_accident: null,
	detail_pain_position: null,
	detail_pain_lowerbody: null,
	detail_pain_fever: null,
	detail_pain_serious: null
});
