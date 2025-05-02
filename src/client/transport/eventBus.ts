import uuid4 from 'uuid4';
import { io, Socket } from 'socket.io-client';

export interface EventBusInstance {
	emit: (eventName: string, payload?: Record<string, any>) => void;
	connect: () => Promise<void>;
	on: (eventName: string, listener: any) => void;
	getConnectedState: () => boolean;
}

export class EventBus {
	private socket?: Socket;
	private sessionId?: string;
	private connected: boolean = false;

	private initSessionId() {
		this.sessionId = undefined;

		let sessionId = window.localStorage.getItem('sessionId');

		if (!sessionId) {
			sessionId = uuid4();
			window.localStorage.setItem('sessionId', sessionId);
		}

		return sessionId;
	}

	public connect() {
		this.sessionId = this.initSessionId();

		// @TODO: add connection url from config
		this.socket = io('ws://127.0.0.1:8090', {
			autoConnect: false,
			extraHeaders: {
				'X-Session-Id': this.sessionId,
			},
		});
		this.socket?.connect();

		this.connected = true;
	}

	public getConnectedState() {
		return this.connected;
	}

	public on(eventName: string, listener: any) {
		this.socket?.on(eventName, listener);
	}

	public emit(eventName: string, payload?: Record<string, any>) {
		this.socket?.emit(eventName, { sessionId: this.sessionId, ...payload });
	}
}
