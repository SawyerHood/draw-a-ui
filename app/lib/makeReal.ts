import { Editor, createShapeId, getSvgAsImage, uniqueId } from '@tldraw/tldraw'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { getHtmlFromOpenAI } from './getHtmlFromOpenAI'
import { track } from '@vercel/analytics/react'
import { kv } from '@vercel/kv'
import { sql } from '@vercel/postgres'
import { nanoid } from 'nanoid'
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

	if (previousPreviews.length > 1) {
		throw Error(`You can only have one previous design selected.`)
	}

	const previousHtml =
		previousPreviews.length === 1
			? previousPreviews[0].props.html
			: 'No previous design has been provided this time.'

	const svg = await editor.getSvg(selectedShapes)
	if (!svg) throw Error(`Could not get the SVG.`)

	const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

	const blob = await getSvgAsImage(svg, IS_SAFARI, {
		type: 'png',
		quality: 1,
		scale: 1,
	})

	const dataUrl = await blobToBase64(blob!)

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
			html: previousHtml,
			apiKey,
			text: textFromShapes,
			includesPreviousDesign: previousPreviews.length > 0,
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
			const shape = editor.getShape(id)
			if (!shape) return null
			if (
				shape.type === 'text' ||
				shape.type === 'geo' ||
				shape.type === 'arrow' ||
				shape.type === 'note'
			) {
				// @ts-expect-error
				return shape.props.text
			}
			return null
		})
		.filter((v) => v !== null && v !== '')

	return texts.join('\n')
}
