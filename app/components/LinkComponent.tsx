'use client'
import { useEffect } from 'react'

export function LinkComponent({
	linkId,
	isPreview,
	html,
}: {
	linkId: string
	isPreview: boolean
	html: string
}) {
	useEffect(() => {
		//listen for screenshot messages
		if (typeof window !== 'undefined') {
			const windowListener = (event: MessageEvent) => {
				if (event.data.action === 'take-screenshot') {
					const iframe2 = document.getElementById(`iframe-2-shape:${linkId}`) as HTMLIFrameElement
					iframe2.contentWindow.postMessage(
						{ action: 'take-screenshot', shapeid: `shape:${linkId}` },
						'*'
					)
				}
			}
			window.addEventListener('message', windowListener)

			return () => {
				window.removeEventListener('message', windowListener)
			}
		}
	}, [linkId])

	return (
		<iframe
			id={`iframe-2-shape:${linkId}`}
			srcDoc={html}
			draggable={false}
			style={{
				position: 'fixed',
				inset: 0,
				width: '100%',
				height: '100%',
				border: 'none',
			}}
		/>
	)
}
