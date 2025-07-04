import createStore from '../store/getState'

const store = createStore((window as any).__PRELOADED_STATE__);

delete (window as any).__PRELOADED_STATE__;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;