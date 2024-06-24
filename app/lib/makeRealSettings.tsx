import { atom } from 'tldraw'

export const makeRealSettings = atom('make real settings', {
	provider: 'openai' as 'openai' | 'anthropic' | 'all',
	keys: {
		openai: '',
		anthropic: '',
	},
})
