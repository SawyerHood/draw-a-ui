import { useEditor, getSvgAsImage, useToasts, createShapeId } from '@tldraw/tldraw'
import { useState } from 'react'
import { PreviewShape } from '../PreviewShape/PreviewShape'
import { getHtmlFromOpenAI } from '../lib/getHtmlFromOpenAI'
import { useMakeReal } from '../hooks/useMakeReal'

export function ExportButton() {
	const makeReal = useMakeReal()

	// A tailwind styled button that is pinned to the bottom right of the screen
	return (
		<button
			onClick={makeReal}
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-2"
			style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
		>
			Make Real
		</button>
	)
}
