export interface FilterData {
	SearchValue : string,
	From : string,
	Till : string,
	OnlyEmpty : boolean
}

export class Note {
	caseId = -1;
	conversationNoteTemplate = {};
	number = -1;
}