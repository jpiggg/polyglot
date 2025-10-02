import createStore from '../store/getState';
import initialState from '../store/initialState';

const store = createStore({game: initialState});

export default store;
