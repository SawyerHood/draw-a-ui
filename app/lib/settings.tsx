import { atom } from 'tldraw'
import { SYSTEM_PROMPT } from '../prompt'

export const PROVIDERS = [
	{
		id: 'openai',
		name: 'OpenAI',
		model: 'GPT-4o',
		help: 'https://tldraw.notion.site/Make-Real-Help-93be8b5273d14f7386e14eb142575e6e#a9b75e58b1824962a1a69a2f29ace9be',
		validate: (key: string) => key.startsWith('sk-proj'),
	},
	{
		id: 'anthropic',
		name: 'Anthropic',
		model: 'Claude Sonnet 3.5',
		help: 'https://tldraw.notion.site/Make-Real-Help-93be8b5273d14f7386e14eb142575e6e#3444b55a2ede405286929956d0be6e77',
		validate: (key: string) => key.startsWith('sk-ant-api'),
	},
	// { id: 'google', name: 'Google', model: 'Gemeni 1.5 Flash', validate: (key: string) => true },
]

export const makeRealSettings = atom('make real settings', {
	provider: 'openai' as (typeof PROVIDERS)[number]['id'] | 'all',
	keys: {
		openai: '',
		anthropic: '',
		google: '',
	},
	prompts: {
		system: SYSTEM_PROMPT,
	},
})
