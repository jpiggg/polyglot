import * as React from 'react';
import Cell from '../Cell';
import type { IProps as ICellProps } from '../Cell/view';

export interface IProps {}

function DroppableCell({ ...rest }: React.PropsWithoutRef<IProps & ICellProps>, ref: any) {
	return <Cell ref={ref} {...rest} />;
}

DroppableCell.displayName = 'DroppableCellView';

export default DroppableCell;
