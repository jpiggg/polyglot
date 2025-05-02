import * as React from 'react';
import NoSSR from './components/NoSSR';

import GamePage from './pages/Game';

function App() {
	return (
		<NoSSR>
			<GamePage />
		</NoSSR>
	);
}

export default App;
