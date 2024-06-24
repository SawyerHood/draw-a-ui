import { atom } from 'tldraw'
import { SYSTEM_PROMPT } from '../prompt'

export const makeRealSettings = atom('make real settings', {
	provider: 'openai' as 'openai' | 'anthropic' | 'google' | 'all',
	keys: {
		openai: '',
		anthropic: '',
		google: '',
	},
	prompts: {
		system: SYSTEM_PROMPT,
	},
})
