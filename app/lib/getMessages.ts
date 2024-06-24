import { CoreUserMessage, UserContent } from 'ai'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { USER_PROMPT, USER_PROMPT_WITH_PREVIOUS_DESIGN } from '../prompt'

export function getMessages({
	image,
	text,
	grid,
	apiKey,
	theme = 'light',
	previousPreviews,
}: {
	image: string
	text: string
	theme?: string
	grid?: {
		color: string
		size: number
		labels: boolean
	}
	apiKey: string
	previousPreviews?: PreviewShape[]
}) {
	if (!apiKey) throw Error('You need to provide an API key (sorry)')

	const messages: CoreUserMessage[] = [
		{
			role: 'user',
			content: [],
		},
	]

	const userContent = messages[0].content as Exclude<UserContent, string>

	// Add the prompt into
	userContent.push({
		type: 'text',
		text: `${previousPreviews.length > 0 ? USER_PROMPT_WITH_PREVIOUS_DESIGN : USER_PROMPT} Please make your result use the ${theme} theme.`,
	})

	// Add the image
	userContent.push({
		type: 'image',
		image: image,
	})

	// Add the strings of text
	if (text) {
		userContent.push({
			type: 'text',
			text: `Here's a list of all the text that we found in the design. Use it as a reference if anything is hard to read in the screenshot(s):\n${text}`,
		})
	}

	if (grid) {
		userContent.push({
			type: 'text',
			text: `The designs have a ${grid.color} grid overlaid on top. Each cell of the grid is ${grid.size}x${grid.size}px.`,
		})
	}

	// Add the previous previews as HTML
	for (let i = 0; i < previousPreviews.length; i++) {
		const preview = previousPreviews[i]
		userContent.push(
			{
				type: 'text',
				text: `The designs also included one of your previous result. Here's the image that you used as its source:`,
			},
			{
				type: 'image',
				image: preview.props.source,
			},
			{
				type: 'text',
				text: `And here's the HTML you came up with for it: ${preview.props.html}`,
			}
		)
	}

	return messages
}
