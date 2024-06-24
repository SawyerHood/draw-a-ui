import { track } from '@vercel/analytics/react'
import { useCallback } from 'react'
import { useEditor, useToasts } from 'tldraw'
import { makeReal } from '../lib/makeReal'

export function useMakeReal() {
	const editor = useEditor()
	const toast = useToasts()

	return useCallback(async () => {
		track('make_real', { timestamp: Date.now() })

		try {
			await makeReal(editor)
		} catch (e: any) {
			track('no_luck', { timestamp: Date.now() })

			console.error(e)

			toast.addToast({
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
	}, [editor, toast])
}
