import * as React from 'react';
import View, { IProps } from './view';
import withStyles from '../withStyles';
import { useAppSelector } from '../../hooks';
import { selectActivePlayer, selectPlayers } from '../../reducers';
import styles from './styles.scss';

const Component = withStyles<IProps>(View, styles);

function Score() {
	const activePlayer = useAppSelector(selectActivePlayer);
	const players = useAppSelector(selectPlayers);

	if (!Object.keys(players).length) {
		return null;
	}

	return <Component players={players} activePlayer={activePlayer} />;
}

export default Score;
