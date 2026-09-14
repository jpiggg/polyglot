import type { Request, Response, NextFunction } from 'express';
import type {Controller} from '../../controller';

const setGamePageState = (controller: Controller) => (req: Request, res: Response, next: NextFunction) => {
  // This middleware is used to set the page state for the request.
  // It can be used to set the page title, description, and other metadata.
  const sessionId = req.headers['x-session-id'] as string;
  const state = controller.getGameState(sessionId);

  console.log('--------------> setGamePageState', sessionId, state);

  res.locals.pageState = {...state?.game};
  next();
};

export default setGamePageState;