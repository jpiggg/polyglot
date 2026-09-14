import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { IGameState, Letters, ITimer, IPlayer, UserId, Field, IWord } from '../../types';
import initialState from '../../store/initialState';
import { deepClone } from '../helpers/object';

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        updateLetters: (state, action: PayloadAction<Letters>) => {
            state.letters = deepClone(action.payload);
        },
        updateActivePlayer: (state, action: PayloadAction<UserId> ) => {
            state.activePlayer = action.payload;
        },
        updatePlayers: (state, action: PayloadAction<Record<string, IPlayer>>) => {
            state.players = action.payload;
        },
        updateTimer: (state, action: PayloadAction<ITimer>) => {
            state.timer = action.payload;
        },
        updateField: (state, action: PayloadAction<Field>) => {
            state.field = action.payload;
        },
        updateWords: (state, action: PayloadAction<IWord[]>) => {
            state.words = action.payload;
        }
    },
});

export const { updateLetters, updateTimer, updateActivePlayer, updatePlayers, updateField, updateWords } = gameSlice.actions;

export const selectLetter = (state: { game: IGameState | Record<string, any> }, letterId: string) => state?.game?.letters[letterId];
export const selectLetters = (state: {game: IGameState | Record<string, any>}) => state?.game.letters;
export const selectTimer = (state:  { game: IGameState | Record<string, any> }) => state?.game?.timer;
export const selectActivePlayer = (state: {game: IGameState | Record<string, any>}) => state.game.activePlayer
export const selectPlayers = (state:  {game: IGameState | Record<string, any>}) => state?.game?.players;
export const selectField = (state:  {game: IGameState | Record<string, any>}) => state?.game.field;
export const selectWords = (state:  {game: IGameState | Record<string, any>}) => state?.game.words;

export const gameReducer = gameSlice.reducer;
