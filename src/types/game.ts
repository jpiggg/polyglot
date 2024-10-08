import type { UserId, IPlayer, IUser, Letters, LetterId } from './index';

export type Field = (string | null)[][];

export type GameId = string;

export type ISearchParam = string;

export interface ITimer {
    time: number;
    total: number;
};

export interface IWords {
    [id: string]: {
        start: string;
        letterIds: LetterId[];
        kind: 'vertical' | 'horizontal';
        score?: number;
    }
}

export interface IGameState {
    activePlayer: UserId;
    players: {
        [playerId: string]: IPlayer
    };
    spectators: IUser[];
    letters: Letters;
    id: GameId;
    words?: IWords;
    field: Field
    timer: ITimer;
}
