import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IGameState, Letters, LetterId, ITimer, IPlayer, UserId, Field, IWord } from '../../types';
import initialState from '../../store/initialState';
import { deepClone } from '../helpers/object';

type IState = { game: (IGameState & { hand: LetterId[] }) | Record<string, any> };

export const gameSlice = createSlice({
	name: 'game',
	initialState,
	reducers: {
		updateLetters: (state: IState['game'], action: PayloadAction<Letters>) => {
			// eslint-disable-next-line no-param-reassign
			state.letters = deepClone(action.payload);
		},
		updateActivePlayer: (state: IState['game'], action: PayloadAction<UserId>) => {
			// eslint-disable-next-line no-param-reassign
			state.activePlayer = action.payload;
		},
		updatePlayers: (state: IState['game'], action: PayloadAction<Record<string, IPlayer>>) => {
			// eslint-disable-next-line no-param-reassign
			state.players = action.payload;
		},
		updateTimer: (state: IState['game'], action: PayloadAction<ITimer>) => {
			// eslint-disable-next-line no-param-reassign
			state.timer = action.payload;
		},
		updateField: (state: IState['game'], action: PayloadAction<Field>) => {
			// eslint-disable-next-line no-param-reassign
			state.field = action.payload;
		},
		updateWords: (state: IState['game'], action: PayloadAction<IWord[]>) => {
			// eslint-disable-next-line no-param-reassign
			state.words = action.payload;
		},
		updateHand: (state: IState['game'], action: PayloadAction<LetterId[]>) => {
			state.hand = action.payload;
		},
	},
});

export const { updateLetters, updateTimer, updateActivePlayer, updatePlayers, updateField, updateWords, updateHand } =
	gameSlice.actions;

export const selectLetter = (state: IState, letterId: string) => state?.game?.letters[letterId];
export const selectLetters = (state: IState) => state?.game.letters;
export const selectTimer = (state: IState) => state?.game?.timer;
export const selectActivePlayer = (state: IState) => state.game.activePlayer;
export const selectPlayers = (state: IState) => state?.game?.players;
export const selectField = (state: IState) => state?.game.field;
export const selectWords = (state: IState) => state?.game.words;
export const selectHand = (state: IState) => state?.game.hand;

export const gameReducer = gameSlice.reducer;
