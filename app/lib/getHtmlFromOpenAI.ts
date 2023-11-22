import {
	OPENAI_USER_PROMPT,
	OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN,
	OPEN_AI_SYSTEM_PROMPT,
} from '../prompt'

export async function getHtmlFromOpenAI({
	image,
	html,
	apiKey,
	text,
	theme = 'light',
	includesPreviousDesign,
}: {
	image: string
	html: string
	apiKey: string
	text: string
	theme?: string
	includesPreviousDesign?: boolean
}) {
	const body: GPT4VCompletionRequest = {
		model: 'gpt-4-vision-preview',
		max_tokens: 4096,
		temperature: 0,
		messages: [
			{
				role: 'system',
				content: OPEN_AI_SYSTEM_PROMPT,
			},
			{
				role: 'user',
				content: [
					{
						type: 'image_url',
						image_url: {
							url: image,
							detail: 'high',
						},
					},
					{
						type: 'text',
						text: `${
							includesPreviousDesign ? OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN : OPENAI_USER_PROMPT
						} Oh, and could you make it for the ${theme} theme?`,
					},
					{
						type: 'text',
						text: html,
					},
					{
						type: 'text',
						text: 'Oh, it looks like there was not any text in this design!',
					},
				],
			},
		],
	}

	let json = null
	if (!apiKey) {
		throw Error('You need to provide an API key (sorry)')
	}
	try {
		const resp = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
		})
		json = await resp.json()
	} catch (e) {
		console.log(e)
	}

	return json
}

type MessageContent =
	| string
	| (
			| string
			| {
					type: 'image_url'
					image_url:
						| string
						| {
								url: string
								detail: 'low' | 'high' | 'auto'
						  }
			  }
			| {
					type: 'text'
					text: string
			  }
	  )[]

export type GPT4VCompletionRequest = {
	model: 'gpt-4-vision-preview'
	messages: {
		role: 'system' | 'user' | 'assistant' | 'function'
		content: MessageContent
		name?: string | undefined
	}[]
	functions?: any[] | undefined
	function_call?: any | undefined
	stream?: boolean | undefined
	temperature?: number | undefined
	top_p?: number | undefined
	max_tokens?: number | undefined
	n?: number | undefined
	best_of?: number | undefined
	frequency_penalty?: number | undefined
	presence_penalty?: number | undefined
	logit_bias?:
		| {
				[x: string]: number
		  }
		| undefined
	stop?: (string[] | string) | undefined
}
