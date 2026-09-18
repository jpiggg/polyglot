import * as React from 'react';

import Model from './model';
import View, { IProps as IViewProps } from './view';
import { useAppSelector } from '../../hooks';
import { selectTimer } from '../../reducers';
import withStyles from '../withStyles';
import styles from './styles.scss';

const ModelComponent = Model(withStyles<IViewProps>(View, styles));

function Timer() {
	const data = useAppSelector(selectTimer);

	return <ModelComponent remainSeconds={data.time} seconds={data.total} />;
}

export default Timer;
