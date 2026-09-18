import type { Socket } from 'socket.io';
import type { UserId, GameId, IUser, IWords, IAddLetter } from '../types';
import type { IGameSettings, IGame } from '../engine/game';
import { DEFAULT_TIMER_VALUE_SEC, DEFAULT_MAX_SCORE_VALUE } from '../constants';
import { GameEngine } from '../engine/game';
import { Dictionary } from '../server/services/dictionary';
import type { EventBus } from './eventBus';

export type ClientId = string;
export type SessionId = string;

export interface IPayload {
	sessionId: SessionId;
}

export interface ICreateGamePayload extends IPayload {
	sessionId: string;
	settings: ISettings;
	user: IUser;
}

export interface IJoinGamePayload extends IPayload {
	gameId: GameId;
	user: IUser;
}

export interface IStartGamePayload extends IPayload {
	gameId: GameId;
}

export interface INextTurnPayload extends IPayload {
	gameId: GameId;
	turn: {
		words: IWords;
		playerId: UserId;
	};
	secret: string;
}

export interface Subscriptions {
	[gameId: GameId]: ClientId[];
}

export interface ActiveGameSessions {
	[sessionId: SessionId]: GameId;
}

export interface Sessions {
	[sessionId: SessionId]: Socket;
}

export interface ISettings extends IGameSettings {
	timer: number;
	password?: string;
	max_players: number;
	max_score: number;
}

/* const getCurrentUser = () => {
	// @TOGO: it should be jwt token in cookies
	// https://trello.com/c/3ojCGjWd/65-%D0%BF%D0%BE%D1%81%D0%BB%D0%B5-%D1%83%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D0%BE%D0%B9-%D0%B0%D0%B2%D1%82%D0%BE%D1%80%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D0%B8-%D0%B2-cookies-%D0%BF%D1%80%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D0%BB%D1%8F%D0%B5%D1%82%D1%81%D1%8F-jwt-accesstoken
	const accessToken = { id: '7301cf16-5e08-4019-bf84-734d3d73f7bd', name: 'jpig' };

	return accessToken;
}; */

export class Controller {
	private games: {
		[gameId: GameId]: {
			instance: IGame;
			password?: string;
			max_players: number;
		};
	};

	private gameIds: GameId[];
	private eventBus: EventBus;

	constructor(eventBus: EventBus) {
		this.games = {};
		this.gameIds = [];
		this.eventBus = eventBus;
	}

	private getGameBySessionId(sessionId: SessionId): { gameId: GameId | undefined; game: IGame | undefined } {
		const res: any = {
			gameId: undefined,
			game: undefined,
		};
		const matchingGame = Object.entries(this.games).find(([, { instance }]) =>
			instance.sessions.includes(sessionId),
		);

		if (matchingGame) {
			const [gameId, { instance }] = matchingGame;
			res.gameId = gameId;
			res.game = instance;
		}

		return res;
	}

	public onGameSessionReconnect = (sessionId: SessionId) => {
		const { game } = this.getGameBySessionId(sessionId);

		game?.reconnect();
	};

	public getGameState = (sessionId: SessionId) => {
		const { gameId, game } = this.getGameBySessionId(sessionId);

		if (gameId && game) {
			return {
				gameId,
				game: game.getState(),
				userId: sessionId,
			};
		}
		return {};
	};

	public onCreateGame = async (payload: ICreateGamePayload) => {
		const { game, gameId } = await this.createGame(payload.sessionId, payload);

		game.start();

		return { gameId, game: game.getState() };
	};

	public onStartGame = (payload: IStartGamePayload) => {
		this.games[payload.gameId].instance.start();
	};

	public onAddLetter = (sessionId: string, payload: IAddLetter) => {
		Object.keys(this.games).forEach((gameId) => {
			const gameInstance = this.games[gameId].instance;
			const { sessions } = gameInstance;

			if (sessions.indexOf(sessionId) !== -1) {
				gameInstance.addLetter(sessionId, payload);
			}
		});
	};

	public onRemoveLetter = (sessionId: string, payload: any) => {
		Object.keys(this.games).forEach((gameId) => {
			const gameInstance = this.games[gameId].instance;
			const { sessions } = gameInstance;

			if (sessions.indexOf(sessionId) !== -1) {
				gameInstance.removeLetter(sessionId, payload);
			}
		});
	};

	public onNextTurn = (sessionId: SessionId) => {
		Object.keys(this.games).forEach((gameId) => {
			const gameInstance = this.games[gameId].instance;
			const { sessions } = gameInstance;

			if (sessions.indexOf(sessionId) !== -1) {
				gameInstance.nextTurn(sessionId);
			}
		});
	};

	public onChangeLetters = (sessionId: SessionId, payload: any) => {
		Object.keys(this.games).forEach((gameId) => {
			const gameInstance = this.games[gameId].instance;
			const { sessions } = gameInstance;

			if (sessions.indexOf(sessionId) !== -1) {
				gameInstance.changeLetters(sessionId, payload.letters);
			}
		});
	};

	private async createGame(sessionId: SessionId, { settings, user }: { settings: ISettings; user: IUser }) {
		const gameSettings = {
			timer: settings.timer || DEFAULT_TIMER_VALUE_SEC,
			max_score: settings.max_score || DEFAULT_MAX_SCORE_VALUE,
		};

		const dictionary = new Dictionary();
		await dictionary.load();

		const game = new GameEngine(this.eventBus, gameSettings, user, dictionary, sessionId);

		const { id } = game;

		this.games[id] = {
			instance: game,
			password: settings.password,
			max_players: settings.max_players,
		};

		this.gameIds.push(id);

		return { gameId: id, game };
	}

	public canJoinGame(gameId: GameId) {
		const game = this.games[gameId];
		const players = game.instance.getPlayers().length;

		console.log('------> canJoinGame', gameId, players, game.max_players);

		return game.max_players === players;
	}

	public onJoin({ sessionId, gameId, user }: IJoinGamePayload) {
		const game = this.games[gameId];

		if (!game) {
			throw new Error(`Cannot find game with id: ${gameId}`);
		}

		if (this.canJoinGame(gameId)) {
			throw new Error('The game already have maximum players');
			return;
		}

		game.instance.join(sessionId, user);

		return { gameId, game: game.instance.getState() };
	}

	public getPlayerHand(gameId: GameId, userId: IUser['id']) {
		const game = this.games[gameId];

		if (!game) {
			throw new Error(`Cannot find game for user with id: ${userId}`);
		}
		return game.instance.getPlayerHand(userId);
	}
}
