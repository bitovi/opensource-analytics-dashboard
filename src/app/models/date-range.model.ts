/**
 * Date tuple where the first value is expected
 * to be before or equal to the second value
 */
export type DateRange = [Date, Date];

export enum DateRangeTimeline {
	WEEKS = 'WEEKS',
	MONTHS = 'MONTHS',
	YEARS = 'YEARS',
}
export interface DateRangeDropdown {
	/* Name that will be display on the UI, i.e: '1 week' */
	name: string;

	/* Value that will be used for subscracting from current data, for 1 week -> 1 */
	rangeValue: number;

	/* Type from DateRangeTimeline how much we have to subscript from current date */
	rangeTimeline: DateRangeTimeline;
}

/* constant used to display data in DateRangeDropdownComponent */
export const DATE_RANGE_DROPDOWN_DATA = [
	{ name: '1 week', rangeValue: 1, rangeTimeline: DateRangeTimeline.WEEKS },
	{ name: '2 weeks', rangeValue: 2, rangeTimeline: DateRangeTimeline.WEEKS },
	{ name: '1 month', rangeValue: 1, rangeTimeline: DateRangeTimeline.MONTHS },
	{ name: '3 month', rangeValue: 3, rangeTimeline: DateRangeTimeline.MONTHS },
	{ name: '1 year', rangeValue: 1, rangeTimeline: DateRangeTimeline.YEARS },
	{ name: '2 years', rangeValue: 2, rangeTimeline: DateRangeTimeline.YEARS },
	{ name: '5 years', rangeValue: 5, rangeTimeline: DateRangeTimeline.YEARS },
] as const;
