import * as React from 'react';
import clsx from 'clsx';
import rawColors from '../theme/palette.scss?raw';
import styles from './Palette.scss';

const rawList = rawColors
	.split('\n')
	.filter((line) => Boolean(line.trim()) && line.trim().startsWith('--color-'))
	.map((line) => line.trim().replace('--color-', '').split(': '));

const groups: Record<string, Array<[string, string]>> = rawList.reduce(
	(acc, pair) => {
		const [name, value] = pair;

		if (/([a-z]+)-\d\d\d/i.test(name)) {
			const groupName = name.split('-')[0] as string;
			acc[groupName] = acc[groupName] ?? [];
			acc[groupName].push([name.replace('-', ' '), value.replace(';', '')]);
		} else {
			acc.$rest.push([name.replace('-', ' '), value.replace(';', '')]);
		}
		return acc;
	},
	{ $rest: [] } as Record<string, Array<[string, string]>>,
);

const groupNames = Object.keys(groups).filter((name) => name !== '$rest');

export default function Palette() {
	return (
		<div className={styles.container}>
			{groupNames.map((groupName) => (
				<div className={styles.group} key={groupName}>
					{groups[groupName].map(([name, value], index) => (
						<div className={styles.row} key={name}>
							<div className={styles.name}>{name}</div>
							<div
								className={clsx({
									[styles.value]: true,
									[styles.valueHighlighted]: index > 4,
								})}
								style={{ backgroundColor: value } as any}
							>
								{value}
								<br />
								{`--color-${name.replace(' ', '-')}`}
							</div>
						</div>
					))}
				</div>
			))}
			<div className={styles.group} key="rest">
				{groups.$rest.map(([name, value]) => (
					<div className={styles.row} key={name}>
						<div className={styles.name}>{name}</div>
						<div
							className={clsx({
								[styles.value]: true,
								[styles.valueHighlighted]: name === 'black',
							})}
							style={{ backgroundColor: value } as any}
						>
							{value}
							<br />
							{`--color-${name.replace(' ', '-')}`}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
