import React from 'react';
import clsx from 'clsx';
import { IGameState } from '../../../types';

export interface IProps {
	players: IGameState['players'];
	activePlayer: IGameState['activePlayer'];
}

interface IOuterProps {
	classes: Record<string, string>;
}

function Score({ players, activePlayer, classes }: IProps & IOuterProps) {
	return (
		<div className={classes.container}>
			Счёт
			{Object.keys(players).map((playerId) => (
				<div key={playerId} className={clsx(classes.row, { [classes.active]: playerId === activePlayer })}>
					<div className={classes.user}>{players[playerId].name}</div>
					<div className={classes.dotted} />
					<div className={classes.item}>{players[playerId].score}</div>
				</div>
			))}
		</div>
	);
}

export default Score;
