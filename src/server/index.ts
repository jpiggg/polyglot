import morgan from 'morgan';
import Express from 'express';
import { Server, Socket } from 'socket.io';
import env from './environment';
import pageMeta from './middlewares/pageMeta';
import setGamePageState from './middlewares/gamePageState';
import pageTemplate from './middlewares/pageTemplate';
import middlewareHandler404 from './middlewares/handler404';
import errorRequestHandler from './middlewares/errorRequestHandler';
import healthcheck from './middlewares/healthcheck';
import { enableGracefulShutdown } from './modules/gracefulShutdown';
import { Controller } from '../controller';
import { connect } from './connector';
import { EVENTS } from '../constants';
import { EventBus } from '../controller/eventBus';
import { GUEST_SESSION_COOKIE, ensureGuestSession, resolveGuestSession } from './services/guestSession';

const eventBus = new EventBus();

const app = Express();
const controller = new Controller(eventBus);

// @TODO: remove placeholder
app.all('*', (_, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	next();
});

app.use(ensureGuestSession);
app.all('*', pageMeta);

app.disable('x-powered-by');
app.all('/healthcheck', healthcheck);
app.use(morgan('tiny'));
app.use('/dist', Express.static('dist/client'));
app.all('/', pageTemplate);
app.all('/game/:gameId', setGamePageState(controller));
app.all('/game/:gameId', pageTemplate);
app.use('/', Express.static('static'));
app.all('*', errorRequestHandler);
app.all('*', middlewareHandler404);

const io = new Server(8090, {
	cors: {
		origin: ['http://localhost:8080', 'http://0.0.0.0:8080', 'http://127.0.0.1:8090', 'http://127.0.0.1:8080'],
		credentials: true,
	},
});

io.use((socket, next) => {
	const token = socket.handshake.headers.cookie
		?.split(';')
		.find((value) => value.trim().startsWith(`${GUEST_SESSION_COOKIE}=`))
		?.trim()
		.slice(GUEST_SESSION_COOKIE.length + 1);
	const guestSession = resolveGuestSession(token);

	if (!guestSession) {
		return next(new Error('Guest session is required'));
	}

	Object.assign(socket.data, { guestSession });
	return next();
});

const gameSessions: Record<string, Socket> = {};

io.on('connection', (ws: Socket) => {
	const sessionId = ws.data.guestSession.user.id as string;

	gameSessions[sessionId as string] = ws;
	controller.onGameSessionReconnect(sessionId as string);
	const gameData = controller.getGameState(sessionId as string);

	if (Object.keys(gameData).length) {
		ws.emit(EVENTS.GAME_SESSION_RECONNECT, JSON.stringify({ gameData }));
	}
});

const emitAll = (eventName: string, payload: any) => {
	const { sessions } = payload;

	sessions.forEach((sessionId: string) => {
		const client = gameSessions[sessionId];

		client.emit(eventName, payload);
	});
};

eventBus.on(EVENTS.ON_NEXT_TURN, (payload) => {
	emitAll(EVENTS.ON_NEXT_TURN, payload);
});

eventBus.on(EVENTS.ON_TIMER_TICK, (payload) => {
	emitAll(EVENTS.ON_TIMER_TICK, payload);
});

eventBus.on(EVENTS.ON_FINISH_GAME, (payload) => {
	emitAll(EVENTS.ON_FINISH_GAME, payload);
});

eventBus.on(EVENTS.UPDATE_TURN_FIELD, (payload) => {
	emitAll(EVENTS.UPDATE_TURN_FIELD, payload);
});

eventBus.on(EVENTS.UPDATE_TURN_LETTERS, (payload) => {
	emitAll(EVENTS.UPDATE_TURN_LETTERS, payload);
});

eventBus.on(EVENTS.UPDATE_TURN_WORDS, (payload) => {
	emitAll(EVENTS.UPDATE_TURN_WORDS, payload);
});

eventBus.on(EVENTS.UPDATE_LETTERS, (payload) => {
	emitAll(EVENTS.UPDATE_LETTERS, payload);
});

eventBus.on(EVENTS.UPDATE_HAND, (payload) => {
	emitAll(EVENTS.UPDATE_HAND, payload);
});

eventBus.on(EVENTS.UPDATE_PLAYERS, (payload) => {
	emitAll(EVENTS.UPDATE_PLAYERS, payload);
});

eventBus.on(EVENTS.UPDATE_ACTIVE_PLAYER, (payload) => {
	emitAll(EVENTS.UPDATE_ACTIVE_PLAYER, payload);
});

io.use(connect(controller));

const server = app.listen(env.port, env.host, () => {
	console.log(`Server @ http://${env.host}:${env.port}`);
	console.log('Game server was started');
});

enableGracefulShutdown(server);
