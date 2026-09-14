import React from 'react';
import clsx from 'clsx';
import uuid4 from 'uuid4';

export interface IProps {
	classes: Record<string, string>;
	disabled?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
	defaultValue?: string;
	value?: string;
	Icon?: string | null;
	type?: string;
	onChange: (e: any) => void;
	label?: string;
	hint?: string;
}

function InputView({
	classes,
	disabled,
	invalid,
	placeholder,
	className,
	defaultValue,
	value,
	Icon,
	onChange,
	type = 'text',
	label,
	hint,
	...rest
}: IProps) {
	const inputId = uuid4();

	const [isFocused, setFocused] = React.useState(false);

	return (
		<div className={clsx(classes.wrapper, className)}>
			{label && (
				<label htmlFor={inputId} className={clsx(classes.label, {
				[classes.disabled]: disabled,
				[classes.invalid]: invalid,
			})}>
				{label}
			</label>
			)}
			<div
				className={clsx(classes.inputWrapper, {
					focused: isFocused,
					invalid,
					[classes.invalid]: invalid,
				})}
			>
				<input
					id={inputId}
					type={type}
					disabled={disabled}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					onChange={onChange}
					className={clsx(classes.input)}
					placeholder={placeholder}
					value={value || defaultValue}
					{...rest}
				/>
				{Icon && <img src={Icon} alt="search" className={classes.icon} />}
			</div>
			{hint && (
				<div className={clsx(classes.label, {
				[classes.disabled]: disabled,
				[classes.invalid]: invalid,
			})}>

				{hint}
			</div>
			)}
		</div>
	);
}

InputView.defaultProps = {
	disabled: false,
	invalid: false,
	className: '',
	defaultValue: '',
	value: undefined,
	Icon: undefined,
	hint: '',
	label: '',
	placeholder: '',
};

export default InputView;
