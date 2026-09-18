import createStore from '../store/getState';

// eslint-disable-next-line no-underscore-dangle
const store = createStore((window as any).__PRELOADED_STATE__);

// eslint-disable-next-line no-underscore-dangle
delete (window as any).__PRELOADED_STATE__;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
