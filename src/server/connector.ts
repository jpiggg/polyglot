import type { Socket } from 'socket.io';
import { EVENTS } from '../constants';
import { setGuestName } from './services/guestSession';

export function connect(controller: any) {
	return function (socket: Socket, next: () => void) {
		const { guestSession } = socket.data;
		const actor = guestSession.user;

		socket.on(EVENTS.GAME_START, (payload: any) => {
			controller.onStartGame(payload);
		});

		socket.on(EVENTS.CREATE_GAME, (payload: any) => {
			setGuestName(guestSession, payload.username);

			controller.onCreateGame({ ...payload, sessionId: actor.id, user: actor }).then((data: any) => {
				socket.emit(EVENTS.CREATE_GAME, JSON.stringify({ ...data, userId: actor.id }));
			});
		});

		socket.on(EVENTS.JOIN_GAME, (payload: any) => {
			setGuestName(guestSession, payload?.username);
			const data = controller.onJoin({ ...payload, sessionId: actor.id, user: actor });

			socket.emit(EVENTS.JOIN_GAME, JSON.stringify({ ...data, userId: actor.id }));
		});

		socket.on(EVENTS.REQUEST_GAME_STATE, () => {
			const sessionId = actor.id;
			const gameData = controller.getGameState(sessionId as string);
			const hand = controller.getPlayerHand(gameData.gameId!, sessionId);

			if (Object.keys(gameData).length) {
				socket.emit(EVENTS.GAME_SESSION_RECONNECT, JSON.stringify({ ...gameData, hand }));
			}
		});

		socket.on(EVENTS.ADD_LETTER, (payload: any) => {
			controller.onAddLetter(actor.id, payload);
		});
		socket.on(EVENTS.REMOVE_LETTER, (payload: any) => {
			controller.onRemoveLetter(actor.id, payload);
		});

		socket.on(EVENTS.ON_NEXT_TURN, (payload: any) => {
			controller.onNextTurn(actor.id, payload);
		});

		socket.on(EVENTS.CHANGE_LETTERS, (payload: any) => {
			controller.onChangeLetters(actor.id, payload);
		});

		next();
	};
}
