import * as React from 'react';
import { h32 } from 'xxhashjs';
import type { Field } from '../../../types';
import DraggableLetter from '../DraggableLetter';

export interface IProps {
	playerLetters: any;
	field: Field;
	fieldLetters: string[];
	setSelectedLetters: any;
	onRemoveLetter: any;
	selectedLetters: any;
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

const FIELD_POSITION_START_X = 59;
const FIELD_POSITION_START_Y = 9;

const LETTERS_POSITION_START_X = 727;
const LETTERS_POSITION_START_Y = 89;

const LETTER_WIDTH = 40;

const calculatePosition = (start: number, offset: number) => start + LETTER_WIDTH * offset + offset;

function PlaterLettersView({
	classes,
	field,
	playerLetters,
	fieldLetters,
	onRemoveLetter,
	selectedLetters,
	setSelectedLetters,
}: IEncapsulatedProps) {
	const toogleSelected = (id: string) => {
		if (!fieldLetters.includes(id)) {
			setSelectedLetters((state: any) => {
				const indexOf = state.indexOf(id);

				if (indexOf !== -1) {
					const newState = [...state];
					newState.splice(indexOf, 1);

					return newState;
				}
				return [...state, id];
			});
		}
	};

	const handleRightClick = (id: string, e: React.SyntheticEvent) => {
		e.preventDefault();

		if (fieldLetters.includes(id)) {
			onRemoveLetter({ letterId: id });
		} else {
			toogleSelected(id);
		}
	};

	if (!playerLetters) {
		return null;
	}

	return (
		<div className={classes.lettersContainer}>
			{playerLetters?.map((letterId: string, i: number) => {
				const posLeft = calculatePosition(LETTERS_POSITION_START_X, i);

				const position: { top: number; left: number } = {
					top: LETTERS_POSITION_START_Y,
					left: posLeft,
				};

				if (fieldLetters.includes(letterId)) {
					(field as Field).forEach((row, rowIndex) => {
						row.forEach((cell, cellIndex) => {
							if (cell === letterId) {
								position.top = calculatePosition(FIELD_POSITION_START_Y, rowIndex);
								position.left = calculatePosition(FIELD_POSITION_START_X, cellIndex);
							}
						});
					});
				}

				return (
					<DraggableLetter
						key={h32(letterId, 0xabcd).toString()}
						styles={{
							top: position.top,
							left: position.left,
						}}
						isSelected={selectedLetters.includes(letterId)}
						letterId={letterId}
						onClick={() => toogleSelected(letterId)}
						onRightClick={(e: any) => handleRightClick(letterId, e)}
						onDoubleClick={() => {
							onRemoveLetter({ letterId });
						}}
					/>
				);
			})}
		</div>
	);
}

export default PlaterLettersView;
