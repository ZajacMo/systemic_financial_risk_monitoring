module.exports = {
	"root": true,
	"env": {
		"node": true,
		"browser": true,
		"es2021": true
	},
	"extends": [
		"plugin:vue/essential",
		"eslint:recommended"
	],
	"parserOptions": {
		"parser": "@babel/eslint-parser",
		"ecmaVersion": 12,
		"sourceType": "module"
	},
	"plugins": [
		"vue"
	],
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		]
	}
};
