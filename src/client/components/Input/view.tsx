import React from 'react';
import clsx from 'clsx';

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
	onChange?: (e: any) => void;
	onSubmit?: (e: any) => void;
	label?: string;
	hint?: string;
}

function InputView({
	classes,
	disabled = false,
	invalid = false,
	placeholder = '',
	className = '',
	value = undefined,
	Icon = undefined,
	onChange = undefined,
	onSubmit = undefined,
	type = 'text',
	label = '',
	hint = '',
	...rest
}: IProps) {
	const inputId = React.useId();

	const [isFocused, setFocused] = React.useState(false);

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			onSubmit?.(value);
		}
	};

	return (
		<div className={clsx(classes.wrapper, className)}>
			{label && (
				<label
					htmlFor={inputId}
					className={clsx(classes.label, {
						[classes.disabled]: disabled,
						[classes.invalid]: invalid,
					})}
				>
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
					onKeyDown={onKeyDown}
					className={clsx(classes.input)}
					placeholder={placeholder}
					value={value}
					{...rest}
				/>
				{Icon && <img src={Icon} alt="search" className={classes.icon} />}
			</div>
			{hint && (
				<div
					className={clsx(classes.label, {
						[classes.disabled]: disabled,
						[classes.invalid]: invalid,
					})}
				>
					{hint}
				</div>
			)}
		</div>
	);
}

export default InputView;
