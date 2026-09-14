import * as React from 'react';

export interface IProps {
	children: string;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
}

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function ButtonModel({ children, disabled = false, className = '', ...rest }: IProps) {
		return (
			<View {...rest} disabled={disabled} className={className}>
				{children}
			</View>
		);
	}

	return ButtonModel;
}

export default Model;
