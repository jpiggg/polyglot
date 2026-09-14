import * as React from 'react';
import clsx from 'clsx';
import TimerIcon from './assets/timer.svg';

export interface IProps {
	remainSeconds: number;
	initialSeconds: number;
	threshold?: number;
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function numPad(n: number): string {
	return n.toString().padStart(2, '0');
}

function formatTime(seconds: number): string {
	const date = new Date(seconds * 1000);
	return `${numPad(date.getMinutes())}:${numPad(date.getSeconds())}`;
}

function TimerView({ classes, remainSeconds, initialSeconds, threshold = 30 }: IEncapsulatedProps) {
	return (
		<div className={classes.container}>
			<span
				className={clsx({
					[classes.highlighted]: true,
					[classes.threshold]: remainSeconds <= threshold,
				})}
			>
				<img src={TimerIcon} alt="⏱️" className={classes.icon} />
				{formatTime(remainSeconds)}
			</span>
			&ensp;/&ensp;
			{formatTime(initialSeconds)}
		</div>
	);
}

export default TimerView;
