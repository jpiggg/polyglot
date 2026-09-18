import * as React from 'react';
import useEventBus from '../../hooks/useEventBus';
import { EVENTS } from '../../../constants';
import type { IProps as IViewProps } from './view';
import type { IGameState, ITimer } from '../../../types';
import { useAppDispatch } from '../../hooks';
import {
	updateLetters,
	updateTimer,
	updateActivePlayer,
	updatePlayers,
	updateField,
	updateWords,
	updateHand,
} from '../../reducers';

function Model(View: React.ComponentType<Omit<IViewProps, 'classes'>>): React.ComponentType<{}> {
	function GameModel() {
		const [fieldLetters, updateFieldLetters] = React.useState<string[]>([]);
		const [gameState, updateGameState] = React.useState<IGameState | null>(null);
		const [currentUserId, updateCurrentUserId] = React.useState<string>();
		const eventBus = useEventBus();
		const dispatch = useAppDispatch();

		React.useEffect(() => {
			eventBus.emit(EVENTS.REQUEST_GAME_STATE);
		}, [eventBus]);

		const loadGame = (payload: any) => {
			const data: { game: IGameState; gameId: string; hand: any } = JSON.parse(payload);

			updateGameState(() => ({ ...data.game }));
			updateCurrentUserId((data as { userId?: string }).userId);
			dispatch(updateField(data.game.field));

			if (data.game.turn?.droppedLetters && data.game.turn?.droppedLetters.length) {
				updateFieldLetters(data.game.turn.droppedLetters);
			}

			dispatch(updateLetters({ ...data.game.letters }));
			dispatch(updateActivePlayer(data.game.activePlayer));
			dispatch(updatePlayers(data.game.players));
			dispatch(updateHand(data.hand));
		};

		eventBus.on(
			EVENTS.UPDATE_LETTERS,
			React.useCallback(
				(payload: any) => {
					dispatch(updateLetters({ ...payload.letters }));
				},
				[dispatch],
			),
		);
		eventBus.on(
			EVENTS.UPDATE_PLAYERS,
			React.useCallback(
				(payload: any) => {
					dispatch(updatePlayers(payload.players));
				},
				[dispatch],
			),
		);

		eventBus.on(
			EVENTS.UPDATE_ACTIVE_PLAYER,
			React.useCallback(
				(payload: any) => {
					dispatch(updateActivePlayer(payload.activePlayer));
				},
				[dispatch],
			),
		);

		eventBus.on(
			EVENTS.UPDATE_HAND,
			React.useCallback(
				(payload: any) => {
					dispatch(updateHand(payload.hand));
				},
				[dispatch],
			),
		);

		eventBus.on(EVENTS.GAME_SESSION_RECONNECT, React.useCallback(loadGame, [dispatch]));

		eventBus.on(
			EVENTS.ON_TIMER_TICK,
			React.useCallback(
				(payload: { data: ITimer }) => {
					dispatch(updateTimer(payload.data));
				},
				[dispatch],
			),
		);

		eventBus.on(
			EVENTS.UPDATE_TURN_FIELD,
			React.useCallback(
				(payload: any) => {
					dispatch(updateField(payload.field));
				},
				[dispatch],
			),
		);

		eventBus.on(
			EVENTS.UPDATE_TURN_LETTERS,
			React.useCallback((payload: any) => {
				updateFieldLetters(payload.dropppedLetters);
			}, []),
		);

		eventBus.on(
			EVENTS.UPDATE_TURN_WORDS,
			React.useCallback(
				(payload: any) => {
					dispatch(updateWords(payload.words));
				},
				[dispatch],
			),
		);

		const onAddLetter = (payload: any) => {
			eventBus.emit(EVENTS.ADD_LETTER, payload);
		};
		const onRemoveLetter = (payload: any) => {
			eventBus.emit(EVENTS.REMOVE_LETTER, payload);
		};

		const onNextTurn = () => {
			eventBus.emit(EVENTS.ON_NEXT_TURN);
		};

		const onChangeLetters = (selectedLetters: string[]) => {
			eventBus.emit(EVENTS.CHANGE_LETTERS, { letters: selectedLetters });
		};

		return (
			<View
				game={gameState}
				currentUserId={currentUserId}
				fieldLetters={fieldLetters}
				onAddLetter={onAddLetter}
				onRemoveLetter={onRemoveLetter}
				onNextTurn={onNextTurn}
				onChangeLetters={onChangeLetters}
			/>
		);
	}

	GameModel.displayName = 'GameModel';
	return GameModel;
}

export default Model;
