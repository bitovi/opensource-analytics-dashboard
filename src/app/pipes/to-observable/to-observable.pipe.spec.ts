import { ToObservablePipe } from './to-observable.pipe';

describe('ToObservablePipe', () => {
	it('create an instance', () => {
		const pipe = new ToObservablePipe();
		expect(pipe).toBeTruthy();
	});
});
