import { Column, Row } from 'angular-google-charts';

export interface ChartData {
	columns: Column[];
	rows: Row[];
	options: object;
}

export enum SelectKeydown {
	SPACE = 'Space',
	SPACE_2 = ' ',
	ENTER = 'Enter',
}

export const POSSIBLE_KEYDOWNS = [SelectKeydown.ENTER, SelectKeydown.SPACE, SelectKeydown.SPACE_2];

export const BitoviPackageNames = [
	'@bitovi/eslint-config',
	'@bitovi/react-numerics',
	'@bitovi/use-simple-reducer',
	'ngx-feature-flag-router',
	'react-to-webcomponent',
];
