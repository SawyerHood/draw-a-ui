import { useEditor, getSvgAsImage, useToasts, createShapeId } from '@tldraw/tldraw'
import { useState } from 'react'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { makeReal } from '../lib/makeReal'

export function ExportButton() {
	const editor = useEditor()
	const [loading, setLoading] = useState(false)
	const toast = useToasts()

	// A tailwind styled button that is pinned to the bottom right of the screen
	return (
		<button
			onClick={async (e) => {
				setLoading(true)
				try {
					e.preventDefault()

					const selectedShapes = editor.getSelectedShapes()

					if (selectedShapes.length === 0) {
						toast.addToast({
							title: 'Nothing selected',
							description: 'First select something to make real.',
							id: 'nothing_selected: First select something to make real.',
						})
						return
					}

					const previewPosition = selectedShapes.reduce(
						(acc, shape) => {
							const bounds = editor.getShapePageBounds(shape)
							const right = bounds?.maxX ?? 0
							const top = bounds?.minY ?? 0
							return {
								x: Math.max(acc.x, right),
								y: Math.min(acc.y, top),
							}
						},
						{ x: 0, y: Infinity }
					)

					const previousPreviews = selectedShapes.filter((shape) => {
						return shape.type === 'preview'
					}) as PreviewShape[]

					if (previousPreviews.length > 1) {
						toast.addToast({
							title: 'Too many previous designs',
							description:
								'Currently, you can only give the developer one previous design to work with.',
							id: 'too_many_previous_designs',
						})
						return
					}

					const previousHtml =
						previousPreviews.length === 1
							? previousPreviews[0].props.html
							: 'No previous design has been provided this time.'

					const svg = await editor.getSvg(selectedShapes)
					if (!svg) {
						return
					}

					const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

					const blob = await getSvgAsImage(svg, IS_SAFARI, {
						type: 'png',
						quality: 1,
						scale: 1,
					})

					const dataUrl = await blobToBase64(blob!)

					const id = createShapeId()
					editor.createShape<PreviewShape>({
						id,
						type: 'preview',
						x: previewPosition.x,
						y: previewPosition.y,
						props: { html: '', source: dataUrl as string },
					})

					const resp = await makeReal({
						image: dataUrl,
						html: previousHtml,
						apiKey:
							(document.getElementById('openai_key_risky_but_cool') as HTMLInputElement)?.value ??
							null,
					})

					const json = await resp.json()

					if (json.error) {
						console.error(json)
						toast.addToast({
							icon: 'cross-2',
							title: 'OpenAI API Error',
							description: `${json.error.message?.slice(0, 100)}...`,
						})
						editor.deleteShape(id)
						return
					}

					const message = json.choices[0].message.content
					const start = message.indexOf('<!DOCTYPE html>')
					const end = message.indexOf('</html>')
					const html = message.slice(start, end + '</html>'.length)

					editor.updateShape<PreviewShape>({
						id,
						type: 'preview',
						props: { html, source: dataUrl as string },
					})
				} catch (e: any) {
					console.error(e)
					toast.addToast({
						icon: 'cross-2',
						title: 'Error',
						description: `Something went wrong: ${e.message.slice(0, 100)}`,
					})
				} finally {
					setLoading(false)
				}
			}}
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
			style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
		>
			{loading ? (
				<div className="flex justify-center items-center ">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
				</div>
			) : (
				'Make Real'
			)}
		</button>
	)
}

export function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, _) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result as string)
		reader.readAsDataURL(blob)
	})
}
