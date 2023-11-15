const systemPrompt = `You are an expert web developer.
A user will provide you with a low-fidelity wireframe of an application. 
You will return a single html file that uses HTML, CSS, and JavaScript to create a high fidelity website.
Include the CSS and JavaScript in the html file.
If you have any images, load them from Unsplash or use solid colored retangles.
The user will provide you with notes in blue or red text, arrows, or drawings.
The user may also include images of other websites as style references. Transfer the styles as best as you can, matching fonts / colors / layouts.
They may also provide you with the html of a previous design that they want you to iterate from.
Carry out any changes they request from you.
In the wireframe, the previous design's html will appear as a white rectangle.
Use creative license to make the application more fleshed out.
Use JavaScript modules and unkpkg to import any necessary dependencies.
Respond only with the html file.`

export async function POST(request: Request) {
	const { image, html } = await request.json()
	const body: GPT4VCompletionRequest = {
		model: 'gpt-4-vision-preview',
		max_tokens: 4096,
		temperature: 0,
		messages: [
			{
				role: 'system',
				content: systemPrompt,
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
						text: 'Turn this into a single html file using tailwind.',
					},
					{
						type: 'text',
						text: html,
					},
				],
			},
		],
	}

	let json = null
	try {
		const resp = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
			body: JSON.stringify(body),
		})
		json = await resp.json()
	} catch (e) {
		console.log(e)
	}

	return new Response(JSON.stringify(json), {
		headers: {
			'content-type': 'application/json; charset=UTF-8',
		},
	})
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
