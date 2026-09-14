import type { UserId, IPlayer, IUser, Letters, LetterId } from './index';

export type Field = (string | null)[][];

export type GameId = string;

export type ISearchParam = string;

export interface IAddLetter {
	letterId: string;
	position: {
		x: number;
		y: number;
	};
}

export interface IRemoveLetter {
	letterId: string;
}

export interface ITimer {
	time: number;
	total: number;
}

export interface IWord {
	start: string;
	letterIds: LetterId[];
	kind: 'vertical' | 'horizontal';
	score?: number;
	isValid?: boolean;
	isPrevious?: boolean;
}

export interface IWords {
	[id: string]: IWord;
}

export interface IGameState {
	activePlayer: UserId;
	players: {
		[playerId: string]: IPlayer;
	};
	spectators: IUser[];
	letters: Letters;
	words?: IWords;
	field: Field;
	timer: ITimer;
	turn?: {
		droppedLetters: string[];
		words: IWords;
	};
}
