import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './app';

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('app');
	hydrateRoot(
		container!,
		<Provider store={store}>
			<App />
		</Provider>,
	);
});
