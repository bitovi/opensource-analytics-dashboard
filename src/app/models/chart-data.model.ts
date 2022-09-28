import { Column, Row } from 'angular-google-charts';

export interface ChartData {
	columns: Column[];
	rows: Row[];
	options: object;
}
