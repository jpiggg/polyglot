import type { IRroles } from '../types';

export const PLAYER_MAX_LETTERS_CAPACITY = 7;
export const DEFAULT_FIELD_SIZE = {
    x: 15,
    y: 15
};

export const DEFAULT_TIMER_VALUE_SEC = 60 * 2; // 2 min

export const PLAYER_DEFAULT_LETTERS_COUNT = 7;

export enum EVENTS {
    CREATE_GAME = "CREATE_GAME",
    JOIN_GAME = "JOIN_GAME",
    UPDATE_GAME_LIST = "UPDATE_GAME_LIST",
    ON_NEXT_TURN = "ON_NEXT_TURN",
    ON_TIMER_TICK = "ON_TIMER_TICK",
    ON_FINISH_GAME = "ON_FINISH_GAME",
    ADD_SESSION_ID = "ADD_SESSION_ID",
    GAME_START = "GAME_START",
    GET_CURRENT_USER = "GET_CURRENT_USER"
};

export const ROLES: IRroles = {
    PARTICIPANT: 'PARTICIPANT',
    SPECTATOR: 'SPECTATOR'
};
