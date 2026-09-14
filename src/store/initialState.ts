import type { IGameState } from '../types/game';

const initialState: IGameState | Record<string, any> = {
    timer: {
        time: 120,
        total: 120
    },
    players: {}
};

export default initialState;