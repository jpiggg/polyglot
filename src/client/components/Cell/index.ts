import * as React from 'react';
import View, { IProps as IViewProps, IEncapsulatedProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Cell = withStyles<IViewProps, HTMLDivElement>(React.forwardRef<HTMLDivElement, IEncapsulatedProps>(View), styles);
Cell.displayName = 'Cell';

export default Cell;
