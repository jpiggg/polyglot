import { configureStore } from '@reduxjs/toolkit';
import { gameReducer } from '../client/reducers';

const createStore = (preloadedState?: any) => {
  const store = configureStore({
    reducer: {
      game: gameReducer,
    },
    preloadedState,
  });
  return store;
}

export default createStore;