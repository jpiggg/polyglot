import * as React from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import Letter from '../Letter';
import type { IProps as ILetterModelProps } from '../Letter/model';

export type SyntheticListenerMap = Record<string, Function>;

export interface IEncapsulatedProps {
	classes: Record<string, string>;
}

export interface IProps {
	isDragging?: boolean;
	letters: any; // вынести в редакс
	style?: Record<string, string | undefined>;
	attributes: DraggableAttributes;
	listeners: SyntheticListenerMap | undefined;
}

function DraggableLetter(props: React.PropsWithoutRef<IProps & ILetterModelProps & IEncapsulatedProps>, ref: any) {
	return (
		<Letter
			ref={ref}
			letters={props.letters}
			letterId={props.letterId}
			onClick={props.onClick}
			onDoubleClick={props.onDoubleClick}
			onRightClick={props.onRightClick}
			classes={{ ...props.classes, elevated: props.isDragging ? props.classes.elevated : '' }}
			attributes={props.attributes}
			listeners={props.listeners}
			isSelected={props.isSelected}
			style={props.style}
		/>
	);
}

DraggableLetter.displayName = 'DraggableLetterView';

export default DraggableLetter;
