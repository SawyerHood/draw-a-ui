import { track } from '@vercel/analytics/react'
import { Editor, createShapeId, getSvgAsImage } from 'tldraw'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { ResultType, getContentFromAnthropic, getContentFromOpenAI } from './actions'
import { blobToBase64 } from './blobToBase64'
import { getMessages } from './getMessages'
import { getTextFromSelectedShapes } from './getTextFromSelectedShapes'
import { makeRealSettings } from './settings'
import { uploadLink } from './uploadLink'

export async function makeReal(editor: Editor) {
	const { keys, provider, prompts } = makeRealSettings.get()

	// Get the selected shapes (we need at least one)
	const selectedShapes = editor.getSelectedShapes()

	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// Create the preview shape
	const { maxX, midY } = editor.getSelectionPageBounds()

	const providers = provider === 'all' ? ['openai', 'anthropic'] : [provider]

	const previewHeight = (540 * 2) / 3
	const totalHeight = (previewHeight + 40) * providers.length - 40
	let y = midY - totalHeight / 2

	await Promise.allSettled(
		providers.map(async (provider, i) => {
			const newShapeId = createShapeId()
			editor.createShape<PreviewShape>({
				id: newShapeId,
				type: 'preview',
				x: maxX + 60, // to the right of the selection
				y: y + (previewHeight + 40) * i, // half the height of the preview's initial shape
				props: { html: '', source: '' },
				meta: {
					provider,
				},
			})

			// Get an SVG based on the selected shapes
			const svgResult = await editor.getSvgString(selectedShapes, {
				scale: 1,
				background: true,
			})

			// Add the grid lines to the SVG
			// const grid = { color: 'red', size: 100, labels: true }
			// addGridToSvg(svg, grid)

			if (!svgResult) throw Error(`Could not get the SVG.`)

			// Turn the SVG into a DataUrl
			const blob = await getSvgAsImage(editor, svgResult.svg, {
				height: svgResult.height,
				width: svgResult.width,
				type: 'png',
				quality: 0.8,
				scale: 1,
			})
			const dataUrl = await blobToBase64(blob!)
			// downloadDataURLAsFile(dataUrl, 'tldraw.png')

			// Get any previous previews among the selected shapes
			const previousPreviews = selectedShapes.filter((shape) => {
				return shape.type === 'preview'
			}) as PreviewShape[]

			if (previousPreviews.length > 0) {
				track('repeat_make_real', { timestamp: Date.now() })
			}

			// Send everything to OpenAI and get some HTML back
			try {
				let result: ResultType

				const messages = getMessages({
					image: dataUrl,
					text: getTextFromSelectedShapes(editor),
					previousPreviews,
					theme: editor.user.getUserPreferences().isDarkMode ? 'dark' : 'light',
				})

				switch (provider) {
					case 'openai': {
						const apiKey = keys[provider]
						result = await getContentFromOpenAI({
							apiKey,
							messages,
							systemPrompt: prompts.system,
							model: 'gpt-4o',
						})
						break
					}
					case 'anthropic': {
						const apiKey = keys[provider]
						result = await getContentFromAnthropic({
							apiKey,
							messages,
							systemPrompt: prompts.system,
							model: 'claude-3-5-sonnet-20240620',
						})
						break
					}
					case 'google': {
						throw Error('not implemented')
					}
				}

				if (!result) {
					throw Error('Could not contact provider.')
				}

				if (result?.finishReason === 'error') {
					console.error(result.finishReason)
					throw Error(`${result.finishReason?.slice(0, 128)}...`)
				}

				// Extract the HTML from the response
				const message = result.text
				const start = message.indexOf('<!DOCTYPE html>')
				const end = message.indexOf('</html>')
				const html = message.slice(start, end + '</html>'.length)

				// No HTML? Something went wrong
				if (html.length < 100) {
					console.warn(message)
					throw Error('Could not generate a design from those wireframes.')
				}

				// Upload the HTML / link for the shape
				await uploadLink(newShapeId, html)

				// Update the shape with the new props
				editor.updateShape<PreviewShape>({
					id: newShapeId,
					type: 'preview',
					props: {
						html,
						source: dataUrl as string,
						linkUploadVersion: 1,
						uploadedShapeId: newShapeId,
					},
				})

				console.log(`Response: ${message}`)
			} catch (e) {
				// If anything went wrong, delete the shape.
				editor.deleteShape(newShapeId)
				throw e
			}
		})
	)
}
