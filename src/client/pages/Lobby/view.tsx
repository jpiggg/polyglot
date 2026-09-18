import * as React from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';

export interface IProps {
	classes: Record<string, string>;
	onCreateGame: (username: string) => void;
	onJoinGame: (gameId: string, username: string) => void;
}

function LobbyPage({ classes, onCreateGame, onJoinGame }: IProps) {
	const [username, setUsername] = React.useState('');
	const submitCreateGame = () => onCreateGame(username);
	const submitJoinGame = (gameId: string) => onJoinGame(gameId, username);

	const onNameChange = (value: string) => {
		setUsername(value);
	};

	return (
		<div className={classes.container}>
			<Input className={classes.item} label="Username" placeholder="Type your username" onChange={onNameChange} />
			<Button className={classes.item} onClick={submitCreateGame}>
				New game
			</Button>
			<span className={classes.item}>OR</span>
			<Input
				className={classes.item}
				label="Join game"
				placeholder="Type game id here"
				onSubmit={submitJoinGame}
			/>
		</div>
	);
}

LobbyPage.displayName = 'LobbyPage';

export default LobbyPage;
