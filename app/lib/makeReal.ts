import { Editor, createShapeId, getSvgAsImage } from 'tldraw'
import { track } from '@vercel/analytics/react'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { addGridToSvg } from './addGridToSvg'
import { blobToBase64 } from './blobToBase64'
import { getHtmlFromOpenAI } from './getHtmlFromOpenAI'
import { getSelectionAsText } from './getSelectionAsText'
import { uploadLink } from './uploadLink'

export async function makeReal(editor: Editor, apiKey: string) {
	// Get the selected shapes (we need at least one)
	const selectedShapes = editor.getSelectedShapes()

	if (selectedShapes.length === 0) throw Error('First select something to make real.')

	// Create the preview shape
	const { maxX, midY } = editor.getSelectionPageBounds()
	const newShapeId = createShapeId()
	editor.createShape<PreviewShape>({
		id: newShapeId,
		type: 'preview',
		x: maxX + 60, // to the right of the selection
		y: midY - (540 * 2) / 3 / 2, // half the height of the preview's initial shape
		props: { html: '', source: '' },
	})

	// Get an SVG based on the selected shapes
	const svg = await editor.getSvg(selectedShapes, {
		scale: 1,
		background: true,
	})

	// Add the grid lines to the SVG
	// const grid = { color: 'red', size: 100, labels: true }
	// addGridToSvg(svg, grid)

	if (!svg) throw Error(`Could not get the SVG.`)

	// Turn the SVG into a DataUrl
	const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
	const blob = await getSvgAsImage(svg, IS_SAFARI, {
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
		const json = await getHtmlFromOpenAI({
			image: dataUrl,
			apiKey,
			text: getSelectionAsText(editor),
			previousPreviews,
			// grid,
			theme: editor.user.getUserPreferences().isDarkMode ? 'dark' : 'light',
		})

		if (!json) {
			throw Error('Could not contact OpenAI.')
		}

		if (json?.error) {
			throw Error(`${json.error.message?.slice(0, 128)}...`)
		}

		// Extract the HTML from the response
		const message = json.choices[0].message.content
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
}
