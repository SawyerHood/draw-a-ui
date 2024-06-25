import { track } from '@vercel/analytics/react'
import { parseStreamPart } from 'ai'
import { useCompletion } from 'ai/react'
import { useCallback } from 'react'
import {
	TldrawUiButton,
	createShapeId,
	getSvgAsImage,
	sortByIndex,
	useDialogs,
	useEditor,
	useToasts,
} from 'tldraw'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { blobToBase64 } from '../lib/blobToBase64'
import { getMessages } from '../lib/getMessages'
import { getTextFromSelectedShapes } from '../lib/getTextFromSelectedShapes'
import { htmlify } from '../lib/htmlify'
import { PROVIDERS, makeRealSettings } from '../lib/settings'
import { uploadLink } from '../lib/uploadLink'
import { SettingsDialog } from './SettingsDialog'

export function MakeRealButton() {
	const editor = useEditor()
	const { addToast } = useToasts()
	const { addDialog } = useDialogs()
	const openaiCompletion = useCompletion({
		api: '/api/openai',
	})
	const anthropicCompletion = useCompletion({
		api: '/api/anthropic',
	})

	const handleClick = useCallback(async () => {
		track('make_real', { timestamp: Date.now() })

		const settings = makeRealSettings.get()
		let didError = false
		if (settings.provider === 'all') {
			for (const provider of PROVIDERS) {
				const apiKey = settings.keys[provider.id]
				if (apiKey && provider.validate(apiKey)) {
					continue
				}
				didError = true
			}
		} else {
			const provider = PROVIDERS.find((p) => p.id === settings.provider)
			const apiKey = settings.keys[settings.provider]
			if (apiKey && provider.validate(apiKey)) {
				// noop
			} else {
				didError = true
			}
		}

		if (didError) {
			addDialog({
				id: 'api keys',
				component: SettingsDialog,
			})
			return
		}

		// no valid key found, show the settings modal

		try {
			const { keys, provider, prompts } = makeRealSettings.get()

			// Get the selected shapes (we need at least one)
			const selectedShapes = editor.getSelectedShapes()

			if (selectedShapes.length === 0) throw Error('First select something to make real.')

			// Create the preview shape
			const { maxX, midY } = editor.getSelectionPageBounds()

			const providers = provider === 'all' ? ['openai', 'anthropic'] : [provider]

			let previewHeight = (540 * 2) / 3
			let previewWidth = (960 * 2) / 3

			const highestPreview = selectedShapes
				.filter((s) => s.type === 'preview')
				.sort(sortByIndex)
				.reverse()[0] as PreviewShape

			if (highestPreview) {
				previewHeight = highestPreview.props.h
				previewWidth = highestPreview.props.w
			}

			const totalHeight = (previewHeight + 40) * providers.length - 40
			let y = midY - totalHeight / 2

			if (highestPreview && Math.abs(y - highestPreview.y) < totalHeight) {
				y = highestPreview.y
			}

			await Promise.allSettled(
				providers.map(async (provider, i) => {
					const newShapeId = createShapeId()

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

					editor.createShape<PreviewShape>({
						id: newShapeId,
						type: 'preview',
						x: maxX + 60, // to the right of the selection
						y: y + (previewHeight + 40) * i, // half the height of the preview's initial shape
						props: { html: '', w: previewWidth, h: previewHeight, source: dataUrl },
						meta: {
							provider,
						},
					})

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
						let result: { text: string; finishReason: string }

						const messages = getMessages({
							image: dataUrl,
							text: getTextFromSelectedShapes(editor),
							previousPreviews,
							theme: editor.user.getUserPreferences().isDarkMode ? 'dark' : 'light',
						})

						const parts: string[] = []
						let text = ''
						let didStart = false
						let didEnd = false

						switch (provider) {
							case 'openai': {
								try {
									const apiKey = keys[provider]

									const abortController = new AbortController()

									const res = await fetch('/api/openai', {
										method: 'POST',
										body: JSON.stringify({
											apiKey,
											messages,
											systemPrompt: prompts.system,
											model: 'gpt-4o',
										}),
										headers: {
											'Content-Type': 'application/json',
										},
										signal: abortController.signal,
									}).catch((err) => {
										throw err
									})

									if (!res.ok) {
										throw new Error((await res.text()) || 'Failed to fetch the chat response.')
									}

									if (!res.body) {
										throw new Error('The response body is empty.')
									}

									let result = ''
									const reader = res.body.getReader()
									const decoder = createChunkDecoder(true)

									while (true) {
										const { done, value } = await reader.read()
										if (done) {
											break
										}

										// Update the completion state with the new message tokens.
										const decoded = decoder(value) as { value: string }[]
										for (const { value: delta } of decoded) {
											result += delta
											text += delta
											if (didEnd) {
												continue
											} else if (!didStart && text.includes('<!DOCTYPE html>')) {
												const startIndex = text.indexOf('<!DOCTYPE html>')
												parts.push(text.slice(startIndex))
												didStart = true
											} else if (didStart && text.includes('</html>')) {
												const endIndex = text.indexOf('</html>')
												parts.push(text.slice(endIndex, endIndex + 7))
												didEnd = true
											} else if (didStart) {
												parts.push(delta)
												editor.updateShape<PreviewShape>({
													id: newShapeId,
													type: 'preview',
													props: {
														parts: [...parts],
													},
												})
											}
										}

										// The request has been aborted, stop reading the stream.
										if (abortController === null) {
											reader.cancel()
											break
										}
									}
								} catch (err) {
									// Ignore abort errors as they are expected.
									if ((err as any).name === 'AbortError') {
										return null
									}

									if (err instanceof Error) {
										// handle error
									}
								}

								result = { text, finishReason: 'complete' }
								break
							}
							case 'anthropic': {
								try {
									const apiKey = keys[provider]

									const abortController = new AbortController()

									const res = await fetch('/api/anthropic', {
										method: 'POST',
										body: JSON.stringify({
											apiKey,
											messages,
											systemPrompt: prompts.system,
											model: 'claude-3-5-sonnet-20240620',
										}),
										headers: {
											'Content-Type': 'application/json',
										},
										signal: abortController.signal,
									}).catch((err) => {
										throw err
									})

									if (!res.ok) {
										throw new Error((await res.text()) || 'Failed to fetch the chat response.')
									}

									if (!res.body) {
										throw new Error('The response body is empty.')
									}

									let result = ''
									const reader = res.body.getReader()
									const decoder = createChunkDecoder(true)

									while (true) {
										const { done, value } = await reader.read()
										if (done) {
											break
										}

										// Update the completion state with the new message tokens.
										const decoded = decoder(value) as { value: string }[]
										for (const { value: delta } of decoded) {
											result += delta
											text += delta
											if (didEnd) {
												continue
											} else if (!didStart && text.includes('<!DOCTYPE html>')) {
												const startIndex = text.indexOf('<!DOCTYPE html>')
												parts.push(text.slice(startIndex))
												didStart = true
											} else if (didStart && text.includes('</html>')) {
												const endIndex = text.indexOf('</html>')
												parts.push(text.slice(endIndex, endIndex + 7))
												didEnd = true
											} else if (didStart) {
												parts.push(delta)
												editor.updateShape<PreviewShape>({
													id: newShapeId,
													type: 'preview',
													props: {
														parts: [...parts],
													},
												})
											}
										}

										// The request has been aborted, stop reading the stream.
										if (abortController === null) {
											reader.cancel()
											break
										}
									}
								} catch (err) {
									// Ignore abort errors as they are expected.
									if ((err as any).name === 'AbortError') {
										return null
									}

									if (err instanceof Error) {
										// handle error
									}
								}

								result = { text, finishReason: 'complete' }
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
						const html = htmlify(result.text)

						// No HTML? Something went wrong
						if (html.length < 100) {
							console.warn(result.text)
							throw Error('Could not generate a design from those wireframes.')
						}

						// Upload the HTML / link for the shape
						await uploadLink(newShapeId, html)

						editor.updateShape<PreviewShape>({
							id: newShapeId,
							type: 'preview',
							props: {
								parts: [],
								html: htmlify(text),
								linkUploadVersion: 1,
								uploadedShapeId: newShapeId,
							},
						})

						console.log(`Response: ${result.text}`)
					} catch (e) {
						console.error(e.message)
						// If anything went wrong, delete the shape.
						editor.deleteShape(newShapeId)
						throw e
					}
				})
			)
		} catch (e: any) {
			track('no_luck', { timestamp: Date.now() })

			console.error(e)

			addToast({
				title: 'Something went wrong',
				description: `${e.message.slice(0, 200)}`,
				actions: [
					{
						type: 'primary',
						label: 'Read the guide',
						onClick: () => {
							// open a new tab with the url...
							window.open(
								'https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e',
								'_blank'
							)
						},
					},
				],
			})
		}
	}, [editor, addDialog, addToast])

	return (
		<div style={{ display: 'flex' }}>
			<TldrawUiButton
				type="icon"
				style={{ height: 52, width: 52, padding: 'var(--space-2)' }}
				onClick={() => {
					addDialog({
						id: 'api keys',
						component: SettingsDialog,
					})
				}}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 15 15"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					style={{ backgroundColor: 'var(--color-background)', borderRadius: '100%' }}
				>
					<path
						d="M7.07095 0.650238C6.67391 0.650238 6.32977 0.925096 6.24198 1.31231L6.0039 2.36247C5.6249 2.47269 5.26335 2.62363 4.92436 2.81013L4.01335 2.23585C3.67748 2.02413 3.23978 2.07312 2.95903 2.35386L2.35294 2.95996C2.0722 3.2407 2.0232 3.6784 2.23493 4.01427L2.80942 4.92561C2.62307 5.2645 2.47227 5.62594 2.36216 6.00481L1.31209 6.24287C0.924883 6.33065 0.650024 6.6748 0.650024 7.07183V7.92897C0.650024 8.32601 0.924883 8.67015 1.31209 8.75794L2.36228 8.99603C2.47246 9.375 2.62335 9.73652 2.80979 10.0755L2.2354 10.9867C2.02367 11.3225 2.07267 11.7602 2.35341 12.041L2.95951 12.6471C3.24025 12.9278 3.67795 12.9768 4.01382 12.7651L4.92506 12.1907C5.26384 12.377 5.62516 12.5278 6.0039 12.6379L6.24198 13.6881C6.32977 14.0753 6.67391 14.3502 7.07095 14.3502H7.92809C8.32512 14.3502 8.66927 14.0753 8.75705 13.6881L8.99505 12.6383C9.37411 12.5282 9.73573 12.3773 10.0748 12.1909L10.986 12.7653C11.3218 12.977 11.7595 12.928 12.0403 12.6473L12.6464 12.0412C12.9271 11.7604 12.9761 11.3227 12.7644 10.9869L12.1902 10.076C12.3768 9.73688 12.5278 9.37515 12.638 8.99596L13.6879 8.75794C14.0751 8.67015 14.35 8.32601 14.35 7.92897V7.07183C14.35 6.6748 14.0751 6.33065 13.6879 6.24287L12.6381 6.00488C12.528 5.62578 12.3771 5.26414 12.1906 4.92507L12.7648 4.01407C12.9766 3.6782 12.9276 3.2405 12.6468 2.95975L12.0407 2.35366C11.76 2.07292 11.3223 2.02392 10.9864 2.23565L10.0755 2.80989C9.73622 2.62328 9.37437 2.47229 8.99505 2.36209L8.75705 1.31231C8.66927 0.925096 8.32512 0.650238 7.92809 0.650238H7.07095ZM4.92053 3.81251C5.44724 3.44339 6.05665 3.18424 6.71543 3.06839L7.07095 1.50024H7.92809L8.28355 3.06816C8.94267 3.18387 9.5524 3.44302 10.0794 3.81224L11.4397 2.9547L12.0458 3.56079L11.1882 4.92117C11.5573 5.44798 11.8164 6.0575 11.9321 6.71638L13.5 7.07183V7.92897L11.932 8.28444C11.8162 8.94342 11.557 9.55301 11.1878 10.0798L12.0453 11.4402L11.4392 12.0462L10.0787 11.1886C9.55192 11.5576 8.94241 11.8166 8.28355 11.9323L7.92809 13.5002H7.07095L6.71543 11.932C6.0569 11.8162 5.44772 11.5572 4.92116 11.1883L3.56055 12.046L2.95445 11.4399L3.81213 10.0794C3.4431 9.55266 3.18403 8.94326 3.06825 8.2845L1.50002 7.92897V7.07183L3.06818 6.71632C3.18388 6.05765 3.44283 5.44833 3.81171 4.92165L2.95398 3.561L3.56008 2.95491L4.92053 3.81251ZM9.02496 7.50008C9.02496 8.34226 8.34223 9.02499 7.50005 9.02499C6.65786 9.02499 5.97513 8.34226 5.97513 7.50008C5.97513 6.65789 6.65786 5.97516 7.50005 5.97516C8.34223 5.97516 9.02496 6.65789 9.02496 7.50008ZM9.92496 7.50008C9.92496 8.83932 8.83929 9.92499 7.50005 9.92499C6.1608 9.92499 5.07513 8.83932 5.07513 7.50008C5.07513 6.16084 6.1608 5.07516 7.50005 5.07516C8.83929 5.07516 9.92496 6.16084 9.92496 7.50008Z"
						fill="currentColor"
						fillRule="evenodd"
						clipRule="evenodd"
					></path>
				</svg>
			</TldrawUiButton>
			<button
				onClick={handleClick}
				className="pt-2 pb-2 pr-2"
				style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
			>
				<div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
					Make Real
				</div>
			</button>
		</div>
	)
}

function createChunkDecoder(complex?: boolean) {
	const decoder = new TextDecoder()

	if (!complex) {
		return function (chunk: Uint8Array | undefined): string {
			if (!chunk) return ''
			return decoder.decode(chunk, { stream: true })
		}
	}

	return function (chunk: Uint8Array | undefined) {
		const decoded = decoder
			.decode(chunk, { stream: true })
			.split('\n')
			.filter((line) => line !== '') // splitting leaves an empty string at the end

		return decoded.map(parseStreamPart).filter(Boolean)
	}
}
