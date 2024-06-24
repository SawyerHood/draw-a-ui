import { atom } from 'tldraw'

export const makeRealSettings = atom('make real settings', {
	provider: 'openai' as 'openai' | 'anthropic' | 'google' | 'all',
	keys: {
		openai: '',
		anthropic: '',
		google: '',
	},
})
