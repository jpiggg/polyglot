import View, { IProps as IViewProps } from './view';
import withStyles from '../withStyles';
import styles from './styles.scss';

const Greetings = withStyles<IViewProps>(View, styles);

export default Greetings;
