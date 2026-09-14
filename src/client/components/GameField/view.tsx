import * as React from 'react';
import { h32 } from 'xxhashjs';
import type { Field as IField, IWord } from '../../../types';
import Letter from '../Letter';
import Field from '../Field';
import type { IProps as ICellProps } from '../Cell/view';
import DroppableCell from '../DroppableCell';
import WordHighlight from '../WordHighlight';

export interface IProps {
	fieldLetters: string[];
	isLocked?: boolean;
}

export interface IConnectedProps extends IProps {
	field: IField;
	words: IWord[];
}

export interface IEncapsulatedProps extends IConnectedProps {
	classes: Record<string, string>;
}

function FieldView({ classes, field, words, isLocked = false }: IEncapsulatedProps) {
	const renderLetter = (letterId: string) => <Letter key={h32(letterId, 0xabcd).toString()} letterId={letterId} />;

	const wordsList = words?.reduce((acc, word) => {
		acc.push(<WordHighlight key={h32(word.letterIds.join(','), 0xabcd).toString()} {...word} />);
		return acc;
	}, [] as React.ReactNode[]);

	return (
		<Field>
			{(field as ICellProps['bonus'][][]).map((row, index) => (
				<div key={h32(`${JSON.stringify(row) + index}row`, 0xabcd).toString()} className={classes.row}>
					{row.map((value, i) => {
						const id = i.toString() + index.toString();
						const position = {
							x: i,
							y: index,
						};

						const isLetterId: boolean = !!(value && !isNaN(Number(value)));

						return (
							<DroppableCell
								id={id}
								disabled={isLetterId || isLocked}
								position={position}
								key={h32(`${(value && !isLetterId ? value : '') + id}dr-cell`, 0xabcd).toString()}
								bonus={value && !isLetterId ? value : null}
							>
								{isLetterId && renderLetter(value as unknown as string)}
							</DroppableCell>
						);
					})}
				</div>
			))}
			{!!wordsList?.length && wordsList}
		</Field>
	);
}

FieldView.displayName = 'FieldView';

export default FieldView;
