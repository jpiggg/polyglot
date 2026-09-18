import uuid4 from 'uuid4';
import { ITimerInstance, Timer } from '../server/services/Timer';
import type { IDictionary } from '../server/services/dictionary';
import type {
	Letters,
	LetterId,
	UserId,
	GameId,
	Field,
	IPlayer,
	IUser,
	IWord,
	IWords,
	IAddLetter,
	IRemoveLetter,
} from '../types';
import { generateFieldSchema } from './helpers';
import type { EventBus } from '../controller/eventBus';
import { EVENTS, DEFAULT_TIMER_VALUE_SEC, PLAYER_DEFAULT_LETTERS_COUNT, ROLES } from '../constants';
import { LettersService } from '../server/services/Letters';
import letterConfig from '../server/config/letters_rus.json';

export interface IGameSettings {
	timer: number;
	max_score: number;
}

export interface ITurn {
	droppedLetters: string[];
	words: IWord[];
}

export type IPrevTurn = ITurn;

export interface IState {
	activePlayer: UserId;
	players: {
		[playerId: string]: IPlayer;
	};
	spectators: IUser[];
	letters?: Letters;
	field: Field;
	timer: {
		time: number;
		total: number;
	};
	turn?: {
		droppedLetters: string[];
		words: IWord[];
	};
}

export interface IGame {
	start: () => void;
	eventBus: EventBus;
	canJoin: (max_players: number) => boolean;
	getPlayers: () => Array<string>;
	join: (sessionId: string, user: IUser) => void;
	reconnect: () => void;
	getState: () => IState;
	sessions: string[];
	addLetter: (actorId: UserId, payload: IAddLetter) => void;
	removeLetter: (actorId: UserId, payload: IRemoveLetter) => void;
	changeLetters: (actorId: UserId, letters: string[]) => void;
	nextTurn: (actorId: UserId) => void;
	getPlayerHand: (userId: UserId) => LetterId[];
}

export class GameEngine implements IGame {
	private state: IState;
	private timer: ITimerInstance;
	public id: GameId;
	private letters: LettersService;
	private initialField: Field;
	private max_score: number;
	public eventBus: EventBus;
	private dictionary: IDictionary;
	public sessions: string[];
	private previousWords: IWord[] = [];
	private turnField: Field;
	private playersHands: Record<UserId, LetterId[]> = {};

	constructor(eventBus: EventBus, settings: IGameSettings, user: IUser, dictionary: IDictionary, sessionId: string) {
		const timer = new Timer(settings.timer || DEFAULT_TIMER_VALUE_SEC, this.onTimerTick, this.onTimerEnd);
		const lettersService = new LettersService(letterConfig);
		const initialWord = dictionary.getInitialWord();
		const initialField = generateFieldSchema();
		const field = structuredClone(initialField);

		this.letters = lettersService;

		this.state = {
			activePlayer: user.id,
			spectators: [],
			players: {},
			field,
			timer: {
				time: settings.timer,
				total: settings.timer,
			},
			turn: {
				droppedLetters: [],
				words: [],
			},
		};

		this.createPlayer(user);

		const letters = this.placeWordOnTheField(initialWord, lettersService.getLetters());
		this.turnField = structuredClone(this.state.field);

		this.state.letters = letters;
		this.sessions = [sessionId];

		this.id = uuid4();
		this.timer = timer;
		this.max_score = settings.max_score;
		this.eventBus = eventBus;
		this.dictionary = dictionary;
		this.initialField = initialField;
	}

	public start() {
		this.timer.start();
	}

	public getPlayers() {
		return Object.keys(this.state.players);
	}

	private handleWords = () => {
		const data = this.generateWords();

		const res = Object.values(data).map((item) => {
			const { letterIds } = item;
			const word = letterIds.map((letterId) => this.state!.letters![letterId].value).join('');
			const isValid = this.validateWord(word.toLowerCase());
			const score = this.calculateWordScore(item);

			return { ...item, isValid, score, __debug: word };
		});

		this.state.turn!.words = res;

		this.previousWords = [];

		this.eventBus.emit(EVENTS.UPDATE_TURN_WORDS, { words: this.state.turn!.words, sessions: this.sessions });
	};

	private validateWord = (word: string) => this.dictionary.checkWord(word);

	private calculateWordScore = (word: IWord) => {
		let [y, x] = word.start.split(';').map(Number);

		let score = 0;
		let wordMultiplier = 0;

		for (let i = 0; i < word.letterIds.length; i++) {
			const fieldBonus = this.initialField[y][x];

			let letterPrice = this.state.letters![word.letterIds[i]].price;

			if (fieldBonus) {
				switch (fieldBonus) {
					case 'w3':
						wordMultiplier += 3;
						break;
					case 'w2':
						wordMultiplier += 2;
						break;
					case 'l3':
						letterPrice *= 3;
						break;
					case 'l2':
						letterPrice *= 2;
						break;
					default:
						return undefined;
				}
			}

			score += letterPrice;

			if (word.kind === 'vertical') {
				y++;
			} else if (word.kind === 'horizontal') {
				x++;
			}
		}

		if (wordMultiplier) {
			score *= wordMultiplier;
		}

		return score;
	};

	private generateWords = () => {
		const data: IWords = this.state.turn!.droppedLetters.reduce((acc, droppedLetterId) => {
			const position = { y: 0, x: 0 };
			for (let i = 0; i < this.turnField.length; i++) {
				for (let j = 0; j < this.turnField[i].length; j++) {
					if (this.turnField[i][j] === droppedLetterId) {
						position.y = i;
						position.x = j;
						break;
					}
				}
			}

			if (Object.keys(acc).length) {
				const { changedWords } = GameEngine.updateCurrentWords(acc, droppedLetterId, position);
				const newWords = this.makeNewWords(droppedLetterId, position);
				Object.assign(acc, changedWords, newWords);
			} else {
				const newWords = this.makeNewWords(droppedLetterId, position);
				Object.assign(acc, newWords);
			}

			return acc;
		}, {});

		return data;
	};

	private makeNewWords = (letterId: string, position: { x: number; y: number }) => {
		const verticalWord = this.makeWord(letterId, position, 'y');
		const horizontalWord = this.makeWord(letterId, position, 'x');
		let response: IWords = {};

		if (!Object.keys(verticalWord).length && !Object.keys(horizontalWord).length) {
			// one letter word
			const wordId = [letterId].join(';');

			response[wordId] = {
				start: `${position.y};${position.x}`,
				letterIds: [letterId],
				kind: 'vertical',
			};
		}

		if (Object.keys(verticalWord).length) {
			response = { ...response, ...verticalWord };
		}

		if (Object.keys(horizontalWord).length) {
			response = { ...response, ...horizontalWord };
		}

		return response;
	};

	private makeWord = (letterId: string, startPosition: { x: number; y: number }, axis: 'y' | 'x') => {
		const letters = [letterId];
		const topLimit = 0;
		const bottomLimit = this.turnField.length - 1;
		let wordStartPosition = `${startPosition.y};${startPosition.x}`;
		let up = startPosition[axis] > topLimit;

		const result: IWords = {};

		const walk = (pos: { x: number; y: number }): any => {
			const position = { ...pos };
			if (up) {
				--position[axis];

				const data = this.turnField[position.y][position.x];
				const isLetter = data && !isNaN(Number(data));

				if (!isLetter) {
					up = false;
					return walk(startPosition);
				}

				wordStartPosition = `${position.y};${position.x}`;
				letters.unshift(data);

				return walk(position);
			}
			if (position[axis] === bottomLimit) {
				return;
			}

			++position[axis];

			const data = this.turnField[position.y][position.x];
			const isLetter = data && !isNaN(Number(data));

			if (!isLetter) {
				return;
			}

			letters.push(data);
			return walk(position);
		};

		walk(startPosition);

		if (letters.length > 1) {
			const wordId = letters.join(';');

			result[wordId] = {
				start: wordStartPosition,
				letterIds: letters,
				kind: axis === 'y' ? 'vertical' : 'horizontal',
			};
		}

		return result;
	};

	private static updateCurrentWords = (data: IWords, letterId: string, position: { x: number; y: number }) => {
		const newLetterPosition = `${position.y};${position.x}`;

		const newWords = Object.keys(data).reduce<IWords>((acc, wordId) => {
			const word = data[wordId];
			const { start, letterIds, kind } = word;

			const newWord = { ...word };

			const [y, x] = start.split(';');

			let upperLetterPosition;
			let bottomLetterPosition;

			if (kind === 'vertical') {
				const verticalLimit = Number(y) + (letterIds.length - 1);

				upperLetterPosition = `${Number(y) - 1};${x}`;
				bottomLetterPosition = `${Number(verticalLimit) + 1};${x}`;
			} else {
				const horizontalLimit = Number(x) + (letterIds.length - 1);
				upperLetterPosition = `${y};${Number(x) - 1}`;
				bottomLetterPosition = `${y};${Number(horizontalLimit) + 1}`;
			}

			if (newLetterPosition === upperLetterPosition || newLetterPosition === bottomLetterPosition) {
				if (newLetterPosition === upperLetterPosition) {
					newWord.start = newLetterPosition;
					newWord.letterIds.unshift(letterId);
				} else if (newLetterPosition === bottomLetterPosition) {
					newWord.letterIds.push(letterId);
				}

				delete acc[wordId];
				const newId = newWord.letterIds.join(';');

				acc[newId] = newWord;
			} else {
				acc[wordId] = newWord;
			}

			return acc;
		}, {});

		return { changedWords: newWords };
	};

	private isActiveActor(actorId: UserId) {
		return actorId === this.state.activePlayer && Boolean(this.state.players[actorId]);
	}

	public addLetter(actorId: UserId, payload: IAddLetter) {
		if (!this.isActiveActor(actorId) || !this.playersHands[actorId]?.includes(payload.letterId)) {
			return;
		}

		const { position, letterId } = payload;
		const row = this.turnField[position.y];
		if (
			!row ||
			position.x < 0 ||
			position.x >= row.length ||
			row[position.x] !== this.initialField[position.y][position.x]
		) {
			return;
		}

		this.turnField[position.y][position.x] = letterId;

		this.state.turn?.droppedLetters.push(letterId);

		this.handleWords();

		this.eventBus.emit(EVENTS.UPDATE_TURN_LETTERS, {
			dropppedLetters: this.state.turn?.droppedLetters,
			sessions: this.sessions,
		});
		this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.turnField, sessions: this.sessions });
	}

	public removeLetter(actorId: UserId, { letterId }: IRemoveLetter) {
		if (!this.isActiveActor(actorId) || !this.state.turn?.droppedLetters.includes(letterId)) {
			return;
		}

		const droppedLetter = this.state.turn?.droppedLetters.indexOf(letterId);

		if (typeof droppedLetter === 'number' && droppedLetter !== -1) {
			this.state.turn?.droppedLetters.splice(droppedLetter, 1);
		}

		this.turnField.forEach((row, rowIndex) => {
			row.forEach((cellContent, cellIndex) => {
				if (cellContent === letterId) {
					this.turnField[rowIndex][cellIndex] = generateFieldSchema()[rowIndex][cellIndex];
				}
			});
		});

		this.handleWords();

		this.eventBus.emit(EVENTS.UPDATE_TURN_LETTERS, {
			dropppedLetters: this.state.turn?.droppedLetters,
			sessions: this.sessions,
		});
		this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.turnField, sessions: this.sessions });
	}

	private placeWordOnTheField(word: string, letters: Letters) {
		let newLetters = { ...letters };
		const position = {
			x: 4,
			y: 7,
		};

		for (let i = 0; i < word.length; i++) {
			const wordLetter = word[i].toUpperCase();

			for (let j = 0; j < Object.keys(newLetters).length; j++) {
				const letterId = Object.keys(newLetters)[j];
				const letter = newLetters[letterId];

				if (letter.value === wordLetter) {
					if (letter.located.in === 'stock') {
						const top = position.y;
						const left = position.x + i;
						newLetters = {
							...newLetters,
							[letterId]: {
								...newLetters[letterId],
								located: {
									in: 'field',
									position: {
										x: left,
										y: top,
									},
								},
							},
						};

						this.state.field[top][left] = letterId;
						break;
					}
				}
			}
		}

		return newLetters;
	}

	private clearTurnState = () => {
		this.state.turn = {
			droppedLetters: [],
			words: [],
		};
	};

	public changeLetters(actorId: UserId, letters: string[]) {
		if (!this.isActiveActor(actorId)) {
			return;
		}

		const playerLetters = this.playersHands[actorId];
		if (letters.length > playerLetters.length || letters.some((letter) => !playerLetters.includes(letter))) {
			return;
		}
		const newLetters = this.letters.getRandomLetters(letters.length);

		letters.forEach((letter, i) => {
			const newLetter = newLetters[i];
			const prevLetterIndex = playerLetters.indexOf(letter);

			if (typeof newLetter !== 'undefined') {
				// replace for a new one
				this.playersHands[actorId].splice(prevLetterIndex, 1, newLetter);
			} else {
				// just delete letter
				this.playersHands[actorId].splice(prevLetterIndex, 1);
			}
		});

		this.state.letters = this.letters.getLetters();

		// clear all field letters that were put during the current turn
		if (this.state.turn?.droppedLetters && this.state.turn?.droppedLetters.length) {
			this.state.turn.droppedLetters.forEach((letterId) => {
				this.state.field.forEach((fieldRow, y) => {
					fieldRow.forEach((fieldCell, x) => {
						if (fieldCell === letterId) {
							this.state.field[y][x] = this.initialField[y][x];
						}
					});
				});
			});

			this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.state.field, sessions: this.sessions });
		}

		// just in case clear all current's turn data
		this.clearTurnState();

		this.eventBus.emit(EVENTS.UPDATE_LETTERS, { letters: this.state.letters, sessions: this.sessions });

		// force new turn
		this.forceNextTurn();
	}

	private forceNextTurn = () => {
		// Clear all field letters that were put during the current turn
		this.turnField = structuredClone(this.state.field);
		this.advanceTurn();
	};

	private advanceTurn() {
		// Reset the field when the current turn contains invalid words.
		this.state.field = structuredClone(this.turnField);

		const handLetters = this.playersHands[this.state.activePlayer];
		const newHandLetters =
			this.state.turn?.droppedLetters && this.letters.getRandomLetters(this.state.turn?.droppedLetters.length);
		// mark new letters that were put out the stock
		this.state.letters = this.letters.getLetters();

		// give new letters for the current player
		this.state.turn?.droppedLetters.forEach((dropppedLetter) => {
			const dropppedPlayerLetter = handLetters.indexOf(dropppedLetter);

			const newLetter = newHandLetters?.pop();

			if (newLetter) {
				this.playersHands[this.state.activePlayer].splice(dropppedPlayerLetter, 1, newLetter);
			}
		});

		const prevActivePlayer = this.state.activePlayer;

		// calculate new score for the current player
		const score = this.state.turn?.words.reduce<number>((acc, word) => acc + (word.score ?? 0), 0);

		this.state.players[this.state.activePlayer].score += score || 0;

		// switch to the next player
		const players = Object.keys(this.state.players);
		let currentPlayerIndex = players.indexOf(this.state.activePlayer);

		console.log('------> current player index', currentPlayerIndex);

		currentPlayerIndex++;

		console.log('------> [INCREASED] current player index', currentPlayerIndex, players.length);

		if (currentPlayerIndex === players.length) {
			currentPlayerIndex = 0;
		}

		this.state.activePlayer = players[currentPlayerIndex];

		this.previousWords = this.state.turn?.words || [];

		this.state.turn = {
			droppedLetters: [],
			words: [],
		};

		this.timer.stop();

		console.log('------> current player', this.state.activePlayer);

		this.eventBus.emit(EVENTS.UPDATE_HAND, {
			hand: this.playersHands[prevActivePlayer],
			sessions: [prevActivePlayer],
		});
		this.eventBus.emit(EVENTS.UPDATE_ACTIVE_PLAYER, {
			activePlayer: this.state.activePlayer,
			sessions: this.sessions,
		});
		this.eventBus.emit(EVENTS.UPDATE_PLAYERS, { players: this.state.players, sessions: this.sessions });
		this.eventBus.emit(EVENTS.UPDATE_LETTERS, { letters: this.state.letters, sessions: this.sessions });
		this.eventBus.emit(EVENTS.UPDATE_TURN_LETTERS, {
			dropppedLetters: this.state.turn?.droppedLetters,
			sessions: this.sessions,
		});

		this.eventBus.emit(EVENTS.UPDATE_TURN_WORDS, {
			words: this.previousWords.map((word) => ({ ...word, isPrevious: true })),
			sessions: this.sessions,
		});

		// set new timer
		this.timer = new Timer(DEFAULT_TIMER_VALUE_SEC, this.onTimerTick, this.onTimerEnd);
		this.timer.start();
	}

	public nextTurn(actorId: UserId) {
		if (this.isActiveActor(actorId)) {
			this.advanceTurn();
		}
	}

	public onTimerTick = (time: number, total: number) => {
		this.eventBus.emit(EVENTS.ON_TIMER_TICK, { gameId: this.id, data: { time, total }, sessions: this.sessions });
	};

	public onTimerEnd = () => {
		// clear all field letters that were put during the current turn
		if (this.state.turn?.droppedLetters && this.state.turn?.droppedLetters.length) {
			this.state.turn.droppedLetters.forEach((letterId) => {
				this.state.field.forEach((fieldRow, y) => {
					fieldRow.forEach((fieldCell, x) => {
						if (fieldCell === letterId) {
							this.state.field[y][x] = this.initialField[y][x];
						}
					});
				});
			});

			this.eventBus.emit(EVENTS.UPDATE_TURN_FIELD, { field: this.state.field, sessions: this.sessions });
		}

		// just in case clear all current's turn data
		this.state.turn = {
			droppedLetters: [],
			words: [],
		};

		this.eventBus.emit(EVENTS.UPDATE_LETTERS, { letters: this.state.letters, sessions: this.sessions });

		this.forceNextTurn();
	};

	public reconnect() {
		this.turnField = structuredClone(this.state.field);
		this.clearTurnState();
	}

	public getState() {
		return this.state;
	}

	public getPlayerHand(userId: UserId) {
		return this.playersHands[userId] || [];
	}

	public finish(player?: IPlayer) {
		this.eventBus.emit(EVENTS.ON_FINISH_GAME, {
			gameId: this.id,
			data: { winner: { name: player?.name, score: player?.score } },
			sessions: this.sessions,
		});
	}

	public canJoin(max_players: number) {
		return !(max_players === Object.keys(this.state.players).length);
	}

	private createPlayer(user: IUser): void {
		this.playersHands[user.id] = this.letters.getRandomLetters(PLAYER_DEFAULT_LETTERS_COUNT);

		this.state.players[user.id] = {
			...user,
			role: ROLES.PARTICIPANT,
			score: 0,
		};
	}

	public join(sessionId: string, user: IUser) {
		if (this.state.players[user.id]) {
			throw new Error(`Player with this id already exists in the game: ${user.id}`);
		}

		this.createPlayer(user);

		this.sessions.push(sessionId);

		this.eventBus.emit(EVENTS.UPDATE_PLAYERS, { players: this.state.players, sessions: this.sessions });
	}
}
