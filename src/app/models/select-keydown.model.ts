export enum SelectKeydown {
	SPACE = 'Space',
	SPACE_2 = ' ',
	ENTER = 'Enter',
}

export const POSSIBLE_SELECT_KEYDOWNS = [SelectKeydown.ENTER, SelectKeydown.SPACE, SelectKeydown.SPACE_2] as const;
