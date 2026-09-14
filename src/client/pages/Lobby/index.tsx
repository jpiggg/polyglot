import Model from './model';
import View, { IProps } from './view';
import withStyles from '../../components/withStyles';
import styles from './styles.scss';

const Start = Model(withStyles<Omit<IProps, 'classes'>>(View, styles));

export default Start;
