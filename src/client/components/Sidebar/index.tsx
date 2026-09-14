import * as React from 'react';

import Model from './model';
import View, { IProps } from './view';
import withStyles from '../withStyles';
import { useAppSelector } from '../../hooks';
import { selectActivePlayer, selectPlayers, selectWords } from '../../reducers';
import styles from './styles.scss';

const Component = Model(withStyles<IProps>(View, styles));

function Sidebar(props: any) {
	const activePlayer = useAppSelector(selectActivePlayer);
	const players = useAppSelector(selectPlayers);
	const words = useAppSelector(selectWords);

	return <Component activePlayer={activePlayer} players={players} words={words} {...props} />;
}

Sidebar.displayName = 'Sidebar';

export default Sidebar;
