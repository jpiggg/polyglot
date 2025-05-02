import * as React from 'react';
import useEventBus from '../../hooks/useEventBus';
import { EVENTS } from '../../../constants';
import type { IProps as IViewProps } from './view';
import type { IGameState, IUser, ITimer } from '../../../types';
import { useAppDispatch } from '../../hooks';
import {
	updateLetters,
	updateTimer,
	updateActivePlayer,
	updatePlayers,
	updateField,
	updateWords,
} from '../../reducers';

function Model(View: React.ComponentType<Omit<IViewProps, 'classes'>>): React.ComponentType<{}> {
	function GameModel() {
		const [user, setUser] = React.useState<IUser | null>(null);
		const [fieldLetters, updateFieldLetters] = React.useState<string[]>([]);
		const [gameState, updateGameState] = React.useState<IGameState | null>(null);
		const eventBus = useEventBus();
		const dispatch = useAppDispatch();

		React.useEffect(() => {
			setUser({ id: '7301cf16-5e08-4019-bf84-734d3d73f7bd', name: 'jpig' });
		}, []);

		const loadGame = (payload: any) => {
			const data: { game: IGameState; gameId: string } = JSON.parse(payload);

			updateGameState(() => ({ ...data.game }));
			dispatch(updateField(data.game.field));

			if (data.game.turn?.droppedLetters && data.game.turn?.droppedLetters.length) {
				updateFieldLetters(data.game.turn.droppedLetters);
			}

			dispatch(updateLetters({ ...data.game.letters }));
			dispatch(updateActivePlayer(data.game.activePlayer));
			dispatch(updatePlayers(data.game.players));
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

		eventBus.on(EVENTS.CREATE_GAME, React.useCallback(loadGame, [dispatch]));

		eventBus.on(EVENTS.GAME_SESSION_RECONNECT, React.useCallback(loadGame, [dispatch]));

		eventBus.on(
			EVENTS.GET_CURRENT_USER,
			React.useCallback((payload: IUser) => {
				setUser(() => payload);
			}, []),
		);

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

		const onCreateGame = () => {
			eventBus.emit(EVENTS.CREATE_GAME, {
				settings: {
					max_players: 2,
				},
				user,
			});
		};

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

		if (!user) {
			return null;
		}

		return (
			<View
				game={gameState}
				fieldLetters={fieldLetters}
				userId={user!.id}
				onCreateGame={onCreateGame}
				onAddLetter={onAddLetter}
				onRemoveLetter={onRemoveLetter}
				onNextTurn={onNextTurn}
				onChangeLetters={onChangeLetters}
			/>
		);
	}

	GameModel.displayName = 'GameModel';
	GameModel.defaultProps = {};

	return GameModel;
}

export default Model;
