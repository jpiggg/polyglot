import * as React from 'react';
import Model from './model';
import View, { IEncapsulatedProps, IWithClassesProps } from './view';
import { useAppSelector } from '../../hooks';
import { selectLetter } from '../../reducers';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Component = Model(
	withStyles(React.forwardRef<HTMLDivElement, IEncapsulatedProps & IWithClassesProps>(View), styles),
);

const Letter: React.FunctionComponent<any> = React.forwardRef(
	(
		{
			letterId,
			isSelected = false,
			onClick = () => {},
			onRightClick = () => {},
			onDoubleClick = () => {},
			...rest
		},
		ref,
	) => {
		const letter = useAppSelector((state) => selectLetter(state, letterId));

		return (
			<Component
				ref={ref}
				letter={letter}
				isSelected={isSelected}
				onClick={onClick}
				onRightClick={onRightClick}
				onDoubleClick={onDoubleClick}
				{...rest}
			/>
		);
	},
);
Letter.displayName = 'Letter';

export default Letter;
