import * as React from 'react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';

import GamePage from './pages/Game';
import LobbyPage from './pages/Lobby';

function NotFoundPage() {
	return <div>Page not found</div>;
}

interface IAppProps {
	initialPath?: string;
}

function App({ initialPath = '/' }: IAppProps) {
	const Router = typeof window === 'undefined' ? MemoryRouter : BrowserRouter;
	const routerProps = Router === MemoryRouter ? { initialEntries: [initialPath] } : {};

	return (
		<Router {...routerProps}>
			<Routes>
				<Route path="/" element={<LobbyPage />} />
				<Route path="/game/:gameId" element={<GamePage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Routes>
		</Router>
	);
}

export default App;
