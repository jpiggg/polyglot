import * as React from 'react';
import type { IGameState, IWord } from '../../../types';
import { IProps as IViewProps } from './view';

export interface IProps {
	activePlayer?: IGameState['activePlayer'];
	words: IWord[];
	onNextTurn: () => void;
	players: IGameState['players'];
}

function Model(View: React.ComponentType<IViewProps>): React.ComponentType<IProps> {
	function SidebarModel({ activePlayer = undefined, ...props }: IProps) {
		return <View activePlayer={activePlayer} {...props} />;
	}

	SidebarModel.displayName = 'SidebarModel';
	return SidebarModel;
}

export default Model;
