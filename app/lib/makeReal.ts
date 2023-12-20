import { Editor, createShapeId, getSvgAsImage } from '@tldraw/tldraw'
import { track } from '@vercel/analytics/react'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { getHtmlFromOpenAI } from './getHtmlFromOpenAI'
import { uploadLink } from './uploadLink'

export async function makeReal(editor: Editor, apiKey: string) {
	const newShapeId = createShapeId()
	const selectedShapes = editor.getSelectedShapes()

	if (selectedShapes.length === 0) {
		throw Error('First select something to make real.')
	}

	const { maxX, midY } = editor.getSelectionPageBounds()

	const previousPreviews = selectedShapes.filter((shape) => {
		return shape.type === 'preview'
	}) as PreviewShape[]

	const svg = await editor.getSvg(selectedShapes, {
		scale: 1,
		background: true,
	})

	if (!svg) throw Error(`Could not get the SVG.`)

	{
		const [x, y, w, h] = svg
			.getAttribute('viewBox')!
			.split(' ')
			.map((v) => +v)

		const steps = Math.ceil(Math.max(h, w) / 100)

		const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g')
		grid.setAttribute('transform', `translate(${x}, ${y})`)
		grid.setAttribute('id', 'grid')
		grid.setAttribute('stroke', '#0F0')
		grid.setAttribute('stroke-width', '1')
		grid.setAttribute('font', '10px/10px normal Serif')
		grid.setAttribute('fill', '#0F0')
		grid.setAttribute('text-anchor', 'middle')

		for (let i = 0; i < steps; i++) {
			if (i > 0) {
				const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
				verticalLine.setAttribute('x1', `${i * 100}`)
				verticalLine.setAttribute('y1', '0')
				verticalLine.setAttribute('x2', `${i * 100}`)
				verticalLine.setAttribute('y2', `${h}`)

				const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line')
				horizontalLine.setAttribute('x1', '0')
				horizontalLine.setAttribute('y1', `${i * 100}`)
				horizontalLine.setAttribute('x2', `${w}`)
				horizontalLine.setAttribute('y2', `${i * 100}`)
				grid.appendChild(verticalLine)
				grid.appendChild(horizontalLine)
			}

			// abcdefg etc
			const colLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
			colLabel.setAttribute('x', `${i * 100 + 50}`)
			colLabel.setAttribute('y', '16')
			colLabel.textContent = String.fromCharCode(97 + i).toUpperCase()

			// abcdefg etc
			const rowLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text')
			rowLabel.setAttribute('x', '12')
			rowLabel.setAttribute('y', `${i * 100 + 50}`)
			rowLabel.textContent = `${i}`

			grid.appendChild(colLabel)
			grid.appendChild(rowLabel)
		}

		svg.appendChild(grid)
	}

	const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

	const blob = await getSvgAsImage(svg, IS_SAFARI, {
		type: 'png',
		quality: 0.8,
		scale: 1,
	})

	const dataUrl = await blobToBase64(blob!)

	// {
	// 	// For testing, let's see the image
	downloadDataURLAsFile(dataUrl, 'tldraw.png')
	// 	return
	// }

	editor.createShape<PreviewShape>({
		id: newShapeId,
		type: 'preview',
		x: maxX + 60, // to the right of the selection
		y: midY - (540 * 2) / 3 / 2, // half the height of the preview's initial shape
		props: { html: '', source: dataUrl as string },
	})

	if (previousPreviews.length > 0) {
		track('repeat_make_real', { timestamp: Date.now() })
	}

	const textFromShapes = getSelectionAsText(editor)

	try {
		const json = await getHtmlFromOpenAI({
			image: dataUrl,
			apiKey,
			text: textFromShapes,
			previousPreviews,
			theme: editor.user.getUserPreferences().isDarkMode ? 'dark' : 'light',
		})

		if (json.error) {
			throw Error(`${json.error.message?.slice(0, 100)}...`)
		}

		console.log(`Response: ${json.choices[0].message.content}`)

		const message = json.choices[0].message.content
		const start = message.indexOf('<!DOCTYPE html>')
		const end = message.indexOf('</html>')
		const html = message.slice(start, end + '</html>'.length)

		if (html.length < 100) {
			console.warn(message)
			throw Error('Could not generate a design from those wireframes.')
		}

		await uploadLink(newShapeId, html)

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
	} catch (e) {
		editor.deleteShape(newShapeId)
		throw e
	}
}

export function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, _) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result as string)
		reader.readAsDataURL(blob)
	})
}

function getSelectionAsText(editor: Editor) {
	const selectedShapeIds = editor.getSelectedShapeIds()
	const selectedShapeDescendantIds = editor.getShapeAndDescendantIds(selectedShapeIds)

	const texts = Array.from(selectedShapeDescendantIds)
		.map((id) => {
			const shape = editor.getShape(id)!
			return shape
		})
		.filter((shape) => {
			return (
				shape.type === 'text' ||
				shape.type === 'geo' ||
				shape.type === 'arrow' ||
				shape.type === 'note'
			)
		})
		.sort((a, b) => {
			// top first, then left, based on page position
			const pageBoundsA = editor.getShapePageBounds(a)
			const pageBoundsB = editor.getShapePageBounds(b)

			return pageBoundsA.y === pageBoundsB.y
				? pageBoundsA.x < pageBoundsB.x
					? -1
					: 1
				: pageBoundsA.y < pageBoundsB.y
					? -1
					: 1
		})
		.map((shape) => {
			if (!shape) return null
			// @ts-expect-error
			return shape.props.text ?? null
		})
		.filter((v) => !!v)

	return texts.join('\n')
}

function downloadDataURLAsFile(dataUrl: string, filename: string) {
	const link = document.createElement('a')
	link.href = dataUrl
	link.download = filename
	link.click()
}
