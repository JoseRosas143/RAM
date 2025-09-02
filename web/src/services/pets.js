import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

export const addPet = httpsCallable(functions, 'addPet');
export const updatePet = httpsCallable(functions, 'updatePet');
export const deletePet = httpsCallable(functions, 'deletePet');
