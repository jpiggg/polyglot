import React from 'react';
import clsx from 'clsx';

export interface IProps {
	classes: Record<string, string>;
	className?: string;
	children: string;
	onClick: () => void;
	disabled?: boolean;
}

function ButtonView({ classes, children, className = '', disabled = false, ...rest }: IProps) {
	return (
		<button
			type="button"
			className={clsx(classes.button, className, 'default-focusable')}
			disabled={disabled}
			{...rest}
		>
			{children}
		</button>
	);
}

export default ButtonView;
