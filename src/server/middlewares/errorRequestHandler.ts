import type { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function middlewareErrorRequestHandler(err: Error, _req: Request, _res: Response, _next: NextFunction) {
	console.error(err);
}
