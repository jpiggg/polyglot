import type { Request, Response, NextFunction } from 'express';
import type { Controller } from '../../controller';

const setGamePageState = (controller: Controller) => (req: Request, res: Response, next: NextFunction) => {
	// This middleware is used to set the page state for the request.
	// It can be used to set the page title, description, and other metadata.
	const userId = res.locals.guestSession?.user.id;
	const { gameId } = req.params;

	console.log('-------res.locals-------', res.locals);
	const state = controller.getGameState(userId);
	const hand = controller.getPlayerHand(gameId, userId);

	console.log('--------------> setGamePageState', userId, state);

	res.locals.pageState = { ...state?.game, hand };
	next();
};

export default setGamePageState;
