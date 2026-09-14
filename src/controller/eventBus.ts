export class EventBus {
	private listeners: Record<string, ((payload?: any) => void)[]> = {};

	public on(eventName: string, cb: (payload?: any) => void) {
		this.listeners[eventName] = this.listeners[eventName] ?? [];
		this.listeners[eventName].push(cb);
	}

	public off(eventName: string, cb: (payload?: any) => void) {
		if (!this.listeners[eventName]) {
			return;
		}

		const index = this.listeners[eventName].indexOf(cb);

		if (index !== -1) {
			this.listeners[eventName].splice(index, 1);
		}
	}

	public emit(eventName: string, eventPayload: Record<string, any>) {
		this.listeners[eventName]?.forEach((cb) => {
			cb(eventPayload);
		});
	}
}
