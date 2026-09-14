import { Server } from 'node:http';
import { Socket } from 'node:net';

export function getShutdownHandler(server: Server): () => void {
	const sockets: Record<number, Socket> = {};
	let nextSocketId = 0;

	server.on('connection', (socket) => {
		const socketId = nextSocketId++;
		sockets[socketId] = socket;

		socket.once('close', () => {
			delete sockets[socketId];
		});
	});

	function waitForSocketsToClose(counter: number) {
		if (counter > 0) {
			console.info(`Waiting for ${counter}s for all connections to close...`);
			setTimeout(waitForSocketsToClose, 1000, counter - 1);
			return;
		}

		console.info('Forcing all connections to close now');

		Object.values(sockets).forEach((socket) => socket.destroy());
	}

	return function shutdown() {
		waitForSocketsToClose(10);

		server.close((err?: Error) => {
			if (err) {
				console.error(err);
				process.exitCode = 1;
			}
			process.exit();
		});
	};
}

export function enableGracefulShutdown(server: Server) {
	const shutdown = getShutdownHandler(server);

	process.on('SIGINT', () => {
		console.info(`\nGot SIGINT. Graceful shutdown @ ${new Date().toISOString()}`);
		shutdown();
	});

	process.on('SIGTERM', () => {
		console.info(`\nGot SIGTERM. Graceful shutdown @ ${new Date().toISOString()}`);
		shutdown();
	});

	process.on('unhandledRejection', (reason, promise) => {
		console.error('Unhandled rejection at:\n', promise, '\n\nReason: ', reason);
		process.exitCode = 1;
		shutdown();
	});

	process.on('uncaughtException', (error) => {
		console.error('Uncaught exception:\n', error);
		process.exitCode = 1;
		shutdown();
	});
}
