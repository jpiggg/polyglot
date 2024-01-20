import * as React from 'react';
import NoSSR from './components/NoSSR';
import Greetings from './components/Greetings';
import GameList from './components/GameList';

import GamePage from './pages/Game';

function App() {
	return (
	    <React.StrictMode>
	        <Greetings />
	        <NoSSR>
	            <GameList />
	        </NoSSR>
	    </React.StrictMode>
	);

	// return (
	// 	<React.StrictMode>
	// 		<NoSSR>
	// 			<GamePage />
	// 		</NoSSR>
	// 	</React.StrictMode>
	// );
}

export default App;
