import { atom } from "jotai";

export const treatmentPlanAtom = atom({
	diagnosis: null,
	exercises: [],
	triggerPoints: [],
});
