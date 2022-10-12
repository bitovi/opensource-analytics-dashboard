/**
 * Date tuple where the first value is expected
 * to be before or equal to the second value
 */
export type DateRange = [Date, Date];

export type DateRangeTimeline = 'weeks' | 'months' | 'years';
export interface DateRangeDropdown {
	/* Name that will be display on the UI, i.e: '1 week' */
	name: string;

	/* Value that will be used for subscracting from current data, for 1 week -> 1 */
	rangeValue: number;

	/* Type from DateRangeTimeline how much we have to subscript from current date */
	rangeTimeline: DateRangeTimeline;
}

/* constant used to display data in DateRangeDropdownComponent */
export const DATE_RANGE_DROPDOWN_DATA: DateRangeDropdown[] = [
	{ name: '1 week', rangeValue: 1, rangeTimeline: 'weeks' },
	{ name: '2 weeks', rangeValue: 2, rangeTimeline: 'weeks' },
	{ name: '1 month', rangeValue: 1, rangeTimeline: 'months' },
	{ name: '3 month', rangeValue: 3, rangeTimeline: 'months' },
	{ name: '1 year', rangeValue: 1, rangeTimeline: 'years' },
	{ name: '2 years', rangeValue: 2, rangeTimeline: 'years' },
	{ name: '5 years', rangeValue: 5, rangeTimeline: 'years' },
];
