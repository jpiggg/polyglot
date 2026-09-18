import words from './ru.json';

const INITIAL_WORD_LENGTH = 7;

export interface IConfig {
	lang: string;
}

export interface IDictionary {
	load: () => Promise<void>;
	getInitialWord: () => string;
	checkWord: (word: string) => boolean;
}

export class Dictionary {
	public initialWords: any;

	constructor() {
		this.initialWords = [];
	}

	load = async () => {
		for (let i = 0; i < words.length; i++) {
			const word = words[i];

			if (word.length === INITIAL_WORD_LENGTH) {
				this.initialWords.push(word);
			}
		}
	};

	getInitialWord() {
		const word = this.initialWords[Math.floor(Math.random() * this.initialWords.length)];

		return word;
	}

	// eslint-disable-next-line class-methods-use-this
	checkWord(word: string) {
		return words.includes(word);
	}
}
