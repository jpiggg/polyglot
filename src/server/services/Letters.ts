import type { LetterId, Letters } from '../../types';

export interface ILetterConfig {
	name: string;
	count: number;
	price: number;
}

export interface ILettersService {
	getLetters: () => Letters;
	getRandomLetters: (count: number) => LetterId[];
}

export class LettersService implements ILettersService {
	private state: Letters;

	constructor(config: ILetterConfig[]) {
		let copiedConfig = JSON.parse(JSON.stringify(config));
		const letters: Letters = {};
		let index = 0;

		while (copiedConfig.length) {
			const letter = copiedConfig.shift() as ILetterConfig;

			letters[index] = {
				value: letter.name,
				price: letter.price,
				located: {
					in: 'stock',
				},
			};

			index++;

			--letter.count;

			if (letter.count > 0) {
				copiedConfig = [letter, ...copiedConfig];
			}
		}

		this.state = letters;
	}

	public getLetters() {
		return this.state;
	}

	public getRandomLetters(count: number) {
		let lettersCount = count;
		const res: LetterId[] = [];
		while (lettersCount) {
			const letters = Object.keys(this.state).filter((letterId) => this.state[letterId].located.in === 'stock');
			const letterId = letters[Math.floor(Math.random() * letters.length)];
			const letter = this.state[letterId];
			letter.located.in = 'player';

			this.state[letterId] = letter;
			res.push(letterId);
			--lettersCount;
		}

		return res;
	}
}
