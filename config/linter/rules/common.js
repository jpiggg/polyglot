module.exports = {
	// https://eslint.org/docs/rules/no-tabs
	'no-tabs': 'off',

	// https://eslint.org/docs/rules/indent
	indent: 'off',

	// https://eslint.org/docs/rules/operator-linebreak
	'operator-linebreak': 'off',

	// https://eslint.org/docs/rules/arrow-parens
	'arrow-parens': 'off',

	// https://eslint.org/docs/rules/max-len
	'max-len': ['error', { code: 120, ignoreUrls: true }],

	// https://eslint.org/docs/rules/no-use-before-define
	'no-use-before-define': 'off',

	// https://eslint.org/docs/rules/object-curly-newline
	'object-curly-newline': 'off',

	// https://eslint.org/docs/rules/no-mixed-spaces-and-tabs
	'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],

	// https://eslint.org/docs/rules/implicit-arrow-linebreak
	'implicit-arrow-linebreak': 'off',

	// https://eslint.org/docs/rules/no-confusing-arrow
	'no-confusing-arrow': 'off',

	// https://eslint.org/docs/rules/no-bitwise
	'no-bitwise': ['error', { allow: ['~'] }],

	// https://eslint.org/docs/rules/consistent-return
	'consistent-return': 'off',

	// https://eslint.org/docs/rules/no-restricted-globals
	'no-restricted-globals': 'off',

	// https://eslint.org/docs/rules/spaced-comment
	// for typescript directives ///<reference path="value">
	'spaced-comment': ['error', 'always', { markers: ['/<'] }],

	'lines-between-class-members': 'off',

	// https://www.npmjs.com/package/eslint-plugin-react-hooks
	'react-hooks/rules-of-hooks': 'error',
	'react-hooks/exhaustive-deps': 'error',

	// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-indent.md
	'react/jsx-indent': ['error', 'tab'],

	// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-indent-props.md
	'react/jsx-indent-props': ['error', 'tab'],

	// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prop-types.md
	'react/prop-types': 'off',

	// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-props-no-spreading.md
	'react/jsx-props-no-spreading': 'off',

	// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/prefer-default-export.md
	'import/prefer-default-export': 'off',

	// https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-dynamic-require.md
	'import/no-dynamic-require': 'off',

	// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-danger.md
	'react/no-danger': 'off',

	// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
	'react/jsx-key': 'error',

	// https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/default-props-match-prop-types.md
	'react/default-props-match-prop-types': 'off',

	// https://eslint.org/docs/rules/global-require
	'global-require': 'off',

	// https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/click-events-have-key-events.md
	'jsx-a11y/click-events-have-key-events': 'off',

	// https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-static-element-interactions.md
	'jsx-a11y/no-static-element-interactions': 'off',

	// https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/alt-text.md
	'jsx-a11y/alt-text': [
		1,
		{
			elements: ['img', 'object', 'area', 'input[type="image"]'],
			img: ['Image'],
			object: ['Object'],
			area: ['Area'],
			'input[type="image"]': ['InputImage'],
		},
	],

	// https://eslint.org/docs/rules/no-plusplus
	'no-plusplus': 'off',

	// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/static-property-placement.md
	'react/static-property-placement': ['error', 'static public field'],

	// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/state-in-constructor.md
	'react/state-in-constructor': 'off',

	// https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md
	'react/destructuring-assignment': 'off',

	// React function components should use parameter defaults instead of defaultProps.
	'react/require-default-props': ['error', { functions: 'defaultArguments' }],
};
