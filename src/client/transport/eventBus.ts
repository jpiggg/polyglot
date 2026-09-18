import { io, Socket } from 'socket.io-client';

export interface EventBusInstance {
	emit: (eventName: string, payload?: Record<string, any>) => void;
	connect: () => Promise<void>;
	on: (eventName: string, listener: any) => void;
	getConnectedState: () => boolean;
}

export class EventBus {
	private socket?: Socket;
	private connected: boolean = false;

	public connect() {
		// @TODO: add connection url from config
		const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
		this.socket = io(`http://${host}:8090`, {
			autoConnect: false,
			withCredentials: true,
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
		this.socket?.emit(eventName, payload);
	}
}
