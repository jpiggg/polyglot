import { Server, Socket } from 'socket.io';
import type { UserId, GameId, IPlayer, ISpectator, IUser, IWords, IAddLetter, IRemoveLetter } from '../types';
import type { IGameSettings, IGame } from '../engine/game';
import { EVENTS, DEFAULT_TIMER_VALUE_SEC, DEFAULT_MAX_SCORE_VALUE } from '../constants';
import { GameEngine } from '../engine/game';
import { Dictionary } from '../server/services/dictionary';
import type { EventBus } from './eventBus';

export type ClientId = string;
export type SessionId = string;

export interface IConnectParams {
	gameId: GameId;
	userId: UserId;
	password?: string;
}

export interface IPayload {
	sessionId: SessionId;
}

export interface ICreateGamePayload extends IPayload {
	sessionId: string;
	settings: ISettings;
	user: IUser;
}

export interface IJoinGamePayload extends IPayload {
	params: IConnectParams;
	user: ISpectator | IPlayer;
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

const getCurrentUser = () => {
	// @TOGO: it should be jwt token in cookies
	// https://trello.com/c/3ojCGjWd/65-%D0%BF%D0%BE%D1%81%D0%BB%D0%B5-%D1%83%D1%81%D0%BF%D0%B5%D1%88%D0%BD%D0%BE%D0%B9-%D0%B0%D0%B2%D1%82%D0%BE%D1%80%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D0%B8-%D0%B2-cookies-%D0%BF%D1%80%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D0%BB%D1%8F%D0%B5%D1%82%D1%81%D1%8F-jwt-accesstoken
	const accessToken = { id: '7301cf16-5e08-4019-bf84-734d3d73f7bd', name: 'jpig' };

	return accessToken;
};

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
		for (const gameId of Object.keys(this.games)) {
			const gameInstance = this.games[gameId].instance;
			const { sessions } = gameInstance;

			if (sessions.includes(sessionId)) {
				res.gameId = gameId;
				res.game = gameInstance;
				return res;
			}
		}

		return res;
	}

	public onGameSessionReconnect = (sessionId: SessionId) => {
		const { game } = this.getGameBySessionId(sessionId);

		game?.reconnect();

	}

	public getGameState = (sessionId: SessionId) => {
		const { gameId, game } = this.getGameBySessionId(sessionId);

		if (gameId && game) {
			return {
				gameId,
				game: game.getState(),
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
		Object.keys(this.games).forEach(gameId => {
			const gameInstance = this.games[gameId].instance;
			const { sessions } = gameInstance;

			if (sessions.indexOf(sessionId) !== -1) {
				gameInstance.addLetter(payload);
			}
		});
	};

	public onRemoveLetter = (sessionId: string, payload: any) => {
		Object.keys(this.games).forEach(gameId => {
			const gameInstance = this.games[gameId].instance;
			const { sessions } = gameInstance;

			if (sessions.indexOf(sessionId) !== -1) {
				gameInstance.removeLetter(payload);
			}
		});
	};

	public onNextTurn = (sessionId: SessionId, payload: any) => {
		Object.keys(this.games).forEach(gameId => {
			const gameInstance = this.games[gameId].instance;
			const { sessions } = gameInstance;

			if (sessions.indexOf(sessionId) !== -1) {
				gameInstance.nextTurn(payload.turn, payload.secret);
			}
		});
	};

	public onChangeLetters = (sessionId: SessionId, payload: any) => {
		Object.keys(this.games).forEach(gameId => {
			const gameInstance = this.games[gameId].instance;
			const { sessions } = gameInstance;

			if (sessions.indexOf(sessionId) !== -1) {
				gameInstance.changeLetters(payload.letters);
			}
		});
	}

	private async createGame(sessionId: SessionId, { settings, user }: { settings: ISettings; user: IUser }) {
		const gameSettings = {
			timer: settings.timer || DEFAULT_TIMER_VALUE_SEC,
			max_score: settings.max_score || DEFAULT_MAX_SCORE_VALUE
		}

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

	private canJoinGame(gameId: GameId) {
		const game = this.games[gameId];
		const players = game.instance.getPlayers().length;

		return !(game.max_players === players);
	}

	public onJoin({ sessionId, params, user }: IJoinGamePayload) {
		const game = this.games[params.gameId];

		if (!game) {
			console.error('Cannot find game with id: ', params.gameId);
		} else {
			if (params.password !== game?.password) {
				console.error('Password is incorrect');
				return;
			}

			if (this.canJoinGame(params.gameId)) {
				console.error('The game already have maximum players');
				return;
			}

			game.instance.join(sessionId, user, params.password);
		}
	}
}
