import * as React from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import { IProps as IViewProps } from './view';

/* eslint-disable react/require-default-props */

export type SyntheticListenerMap = Record<string, Function>;

export interface IProps {
	letter: any;
	position?: Record<string, string | number>;
	styles?: Record<string, string | number>;
	isSelected?: boolean;
	onClick?: (e?: React.SyntheticEvent) => void;
	onRightClick?: (e?: React.SyntheticEvent) => void;
	onDoubleClick?: (e?: React.SyntheticEvent) => void;
}

export interface IEncapsulatedProps {
	classes?: Record<string, string>;
	style?: Record<string, string | undefined>;
	attributes?: DraggableAttributes;
	listeners?: SyntheticListenerMap | undefined;
}

function Model(
	View: React.ForwardRefExoticComponent<
		React.PropsWithoutRef<IEncapsulatedProps & IViewProps> & React.RefAttributes<HTMLDivElement>
	>,
): React.ForwardRefExoticComponent<
	React.PropsWithoutRef<IEncapsulatedProps & IProps> & React.RefAttributes<HTMLDivElement>
> {
	const LetterModel = React.forwardRef<HTMLDivElement, IEncapsulatedProps & IProps>(
		(
			{
				letter,
				isSelected = false,
				onClick = () => {},
				onRightClick = () => {},
				onDoubleClick = () => {},
				classes = {},
				style = undefined,
				position = undefined,
				styles = undefined,
				attributes = undefined,
				listeners = undefined,
				...rest
			}: React.PropsWithoutRef<IProps & IEncapsulatedProps>,
			ref: any,
		) => {
			if (!letter) {
				return null;
			}

			return (
				<View
					ref={ref}
					letter={letter}
					isSelected={isSelected}
					onClick={onClick}
					onRightClick={onRightClick}
					onDoubleClick={onDoubleClick}
					classes={classes}
					style={style}
					position={position}
					styles={styles}
					attributes={attributes}
					listeners={listeners}
					{...rest}
				/>
			);
		},
	);

	return LetterModel;
}

export default Model;
