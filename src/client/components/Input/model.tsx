import * as React from 'react';

export interface IProps {
	disabled?: boolean;
	invalid?: boolean;
	placeholder?: string;
	className?: string;
	onChange: () => void;
	label?: string;
	hint?: string;
	value?: string;
}

function Model(View: React.ComponentType<IProps>): React.ComponentType<IProps> {
	function InputModel({ children, onChange: onChangeProp, ...rest }: IProps) {
		const [value, setValue] = React.useState<string>('');

		const onChange = (e) => {
			setValue(e.target.value);
			onChangeProp();
		};

		return (
			<View value={value} onChange={onChange} {...rest}>
				{children}
			</View>
		);
	}

	InputModel.defaultProps = {
		disabled: false,
		invalid: false,
		placeholder: '',
		className: '',
		label: '',
		hint: '',
		value: '',
	};

	return InputModel;
}

export default Model;
