import { atom } from "jotai";

export const conversationAtom = atom({
    questions: [],
    answers: [],
    isComplete: false,
}); 