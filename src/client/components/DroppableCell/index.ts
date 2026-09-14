import * as React from 'react';
import Model from './model';
import View from './view';
import type { IProps as ICellProps } from '../Cell/view';
import type { IProps } from './model';

const DroppableCell = Model(React.forwardRef<unknown, ICellProps & IProps>(View));

DroppableCell.displayName = 'DroppableCell';

export default DroppableCell;
