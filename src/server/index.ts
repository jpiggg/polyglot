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

const eventBus = new EventBus();

const app = Express();
const controller = new Controller(eventBus);

// @TODO: remove placeholder
app.all("*", (_, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

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
		// @TODO: remove placeholdder
		origin: "*"
	}
});

io.use((socket, next) => {
	const accessToken = { id: '7301cf16-5e08-4019-bf84-734d3d73f7bd', name: 'jpig' };

	socket.data.accessToken = accessToken;

	next();
});

const gameSessions: Record<string, Socket> = {};

io.on('connection', (ws: Socket) => {
	const sessionId = ws.handshake.headers['x-session-id']

	gameSessions[sessionId as string] = ws;
	const gameData = controller.getGameState(sessionId as string);

	if (Object.keys(gameData).length) {
		ws.emit(EVENTS.GAME_SESSION_RECONNECT, JSON.stringify(gameData));
	}
});

const emitAll = (eventName: string, payload: any) => {
	const { sessions } = payload;

	sessions.forEach((sessionId: string) => {
		const client = gameSessions[sessionId];

		client.emit(eventName, payload)
	});
}

eventBus.on(EVENTS.ON_NEXT_TURN, (payload) => {
	emitAll(EVENTS.ON_NEXT_TURN, payload);
});

eventBus.on(EVENTS.ON_TIMER_TICK, (payload) => {
	emitAll(EVENTS.ON_TIMER_TICK, payload);
});

eventBus.on(EVENTS.ON_FINISH_GAME, (payload) => {
	emitAll(EVENTS.ON_FINISH_GAME, payload);
});

eventBus.on(EVENTS.UPDATE_TURN_FIELD, payload => {
	emitAll(EVENTS.UPDATE_TURN_FIELD, payload);
});

eventBus.on(EVENTS.UPDATE_TURN_LETTERS, payload => {
	emitAll(EVENTS.UPDATE_TURN_LETTERS, payload);
});

eventBus.on(EVENTS.UPDATE_TURN_WORDS, payload => {
	emitAll(EVENTS.UPDATE_TURN_WORDS, payload);
});

eventBus.on(EVENTS.UPDATE_LETTERS, payload => {
	emitAll(EVENTS.UPDATE_LETTERS, payload);
});

eventBus.on(EVENTS.UPDATE_PLAYERS, payload => {
	emitAll(EVENTS.UPDATE_PLAYERS, payload);
});

io.use(connect(controller));

const server = app.listen(env.port, env.host, () => {
	console.log(`Server @ http://${env.host}:${env.port}`);
	console.log("Game server was started");
});

enableGracefulShutdown(server);
