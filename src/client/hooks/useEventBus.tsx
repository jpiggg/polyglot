import { useContext } from 'react';
import EventBusContext from '../eventBusProvider';
import type { EventBusInstance } from '../transport/eventBus';

function useEventBus() {
	const eventBus = useContext<EventBusInstance>(EventBusContext);
	const hasBeenConnected = eventBus.getConnectedState();

	if (!hasBeenConnected) {
		eventBus.connect();
	}

	return eventBus;
}

export default useEventBus;
