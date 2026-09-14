import * as React from 'react';
import Model from './model';
import View, { IEncapsulatedProps, IProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const DraggableLetter = Model(withStyles(React.forwardRef<unknown, IProps & IEncapsulatedProps>(View), styles));

DraggableLetter.displayName = 'DraggableLetter';

export default DraggableLetter;
