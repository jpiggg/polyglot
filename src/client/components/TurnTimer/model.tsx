import * as React from 'react';
import type { IProps as IViewProps } from './view';

export interface IProps {
	seconds: number;
	remainSeconds: number;
	threshold?: number;
}

function Model(View: React.ComponentType<IViewProps>): React.ComponentType<IProps> {
	function TimerModel({ seconds, remainSeconds, threshold = 30 }: IProps) {
		const [remainSecondsState, setRemainSecondsState] = React.useState(remainSeconds);
		const [prevSeconds, setPrevSeconds] = React.useState<null | number>(null);
		const [prevRemainSeconds, setPrevRemainSeconds] = React.useState<null | number>(null);

		React.useEffect(() => {
			const intervalId = setInterval(() => {
				if (remainSecondsState > 0) {
					setRemainSecondsState(remainSecondsState - 1);
				} else {
					setRemainSecondsState(0);
					clearInterval(intervalId);
				}
			}, 1000);

			return () => clearInterval(intervalId);
		}, [remainSecondsState]);

		if (seconds !== prevSeconds || remainSeconds !== prevRemainSeconds) {
			setRemainSecondsState(remainSeconds);
			setPrevSeconds(seconds);
			setPrevRemainSeconds(remainSeconds);
		}

		return <View remainSeconds={remainSecondsState} initialSeconds={seconds} threshold={threshold} />;
	}

	return TimerModel;
}

export default Model;
