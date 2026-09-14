import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { IProps as ICellProps } from '../Cell/view';

export interface IProps {
	disabled?: boolean;
	id?: string;
	position: {
		x: number;
		y: number;
	};
}

function Model(
	View: React.ForwardRefExoticComponent<React.PropsWithoutRef<ICellProps & IProps> & React.RefAttributes<unknown>>,
): React.ComponentType<ICellProps & IProps> {
	function DroppableCellModel({ disabled = false, id = '', ...props }: ICellProps & IProps) {
		const { setNodeRef } = useDroppable({
			id,
			disabled,
			data: {
				position: props.position,
			},
		});

		return <View ref={setNodeRef} {...props} />;
	}

	return DroppableCellModel;
}

export default Model;
