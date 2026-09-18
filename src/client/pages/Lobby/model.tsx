import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useEventBus from '../../hooks/useEventBus';
import { EVENTS } from '../../../constants';
import type { IProps as IViewProps } from './view';

function Model(View: React.ComponentType<Omit<IViewProps, 'classes'>>): React.ComponentType {
	function LobbyModel() {
		const eventBus = useEventBus();
		const navigate = useNavigate();

		const onGameCreated = React.useCallback(
			(payload: any) => {
				const { gameId } = JSON.parse(payload);
				navigate(`/game/${gameId}`);
			},
			[navigate],
		);

		const onCreateGame = (username: string) => {
			console.log('---> onCreateGame', username);
			eventBus.emit(EVENTS.CREATE_GAME, {
				settings: {
					max_players: 2,
				},
				username,
			});
		};

		const onJoinGame = (gameId: string, username: string) => {
			console.log('---> onJoinGame', gameId, username);
			eventBus.emit(EVENTS.JOIN_GAME, {
				gameId,
				username,
			});
		};

		eventBus.on(EVENTS.CREATE_GAME, onGameCreated);
		eventBus.on(EVENTS.JOIN_GAME, onGameCreated);

		return <View onCreateGame={onCreateGame} onJoinGame={onJoinGame} />;
	}

	LobbyModel.displayName = 'LobbyModel';

	return LobbyModel;
}

export default Model;
