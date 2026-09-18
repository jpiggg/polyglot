import * as React from 'react';
import clsx from 'clsx';

export interface IProps {
	className?: string;
	children: React.ReactNode;
}

export interface IEncapsulatedProps extends IProps {
	classes: Record<string, string>;
}

function FieldView({ classes, children, className = '' }: IEncapsulatedProps) {
	return (
		<div className={clsx(classes.container, className)}>
			<div className={classes.field}>{children}</div>
		</div>
	);
}

FieldView.displayName = 'FieldView';

export default FieldView;
