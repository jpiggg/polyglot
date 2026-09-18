import * as React from 'react';
import { createPortal } from 'react-dom';
import {
	DndContext,
	MouseSensor,
	useSensor,
	useSensors,
	DragEndEvent,
	DragStartEvent,
	UniqueIdentifier,
} from '@dnd-kit/core';
import type { IGameState } from '../../../types';
import Sidebar from '../../components/Sidebar';
import GameField from '../../components/GameField';
import PlayerLetters from '../../components/PlayerLetters';

export interface IProps {
	classes: Record<string, string>;
	game: IGameState | null;
	currentUserId?: string;
	fieldLetters: string[];
	onNextTurn: () => void;
	onAddLetter: (payload: { letterId: string; position: { x: number; y: number }; cellId: UniqueIdentifier }) => void;
	onRemoveLetter: (payload: { letterId: string }) => void;
	onChangeLetters: (selectedLetters: string[]) => void;
}

function GamePage({
	game,
	currentUserId = undefined,
	fieldLetters,
	classes,
	onAddLetter,
	onRemoveLetter,
	onNextTurn,
	onChangeLetters,
}: IProps) {
	const [selectedLetters, setSelectedLetters] = React.useState<string[]>([]);

	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 10,
		},
	});

	const handleChangeLetters = () => {
		onChangeLetters(selectedLetters);
	};

	const sensors = useSensors(mouseSensor);

	const handleDragStart = ({ active }: DragStartEvent) => {
		const indexOf = selectedLetters.indexOf(active.id.toString());

		if (indexOf !== -1) {
			setSelectedLetters((state) => {
				const newState = [...state];
				newState.splice(indexOf, 1);
				return newState;
			});
		}
	};

	const handleDragEnd = ({ over, active }: DragEndEvent) => {
		const letterId = active.id as string;
		const letter = game!.letters[letterId];

		if (over) {
			const { position } = over.data.current as any;

			letter.located = {
				in: 'field',
				position,
			};

			if (fieldLetters.includes(letterId)) {
				onRemoveLetter({ letterId });
			}

			onAddLetter({ letterId, position, cellId: over.id });
		} else {
			onRemoveLetter({ letterId: active.id as string });
		}
	};

	if (!game) {
		return <div className={classes.game}>Loading game...</div>;
	}

	console.log('----------> current user id', currentUserId, game.activePlayer);

	return (
		<div className={classes.game}>
			<DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
				<GameField fieldLetters={fieldLetters} isLocked={currentUserId !== game.activePlayer} />
				<Sidebar onNextTurn={onNextTurn} onChangeLetters={handleChangeLetters} />
				{createPortal(
					<PlayerLetters
						selectedLetters={selectedLetters}
						setSelectedLetters={setSelectedLetters}
						fieldLetters={fieldLetters}
						onRemoveLetter={onRemoveLetter}
					/>,
					document.body,
				)}
			</DndContext>
		</div>
	);
}

GamePage.displayName = 'GamePage';

export default GamePage;
