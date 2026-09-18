export type LetterId = string;

export interface Letters {
	[id: LetterId]: {
		value: string;
		price: number;
		located:
			| {
					in: 'player';
			  }
			| {
					in: 'field';
					position: {
						x: number;
						y: number;
					};
			  }
			| {
					in: 'stock';
			  };
	};
}
