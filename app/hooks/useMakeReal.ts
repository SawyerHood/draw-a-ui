import { useEditor, useToasts } from '@tldraw/tldraw'
import { useCallback } from 'react'
import { makeReal } from '../lib/makeReal'
import { track } from '@vercel/analytics/react'

export function useMakeReal() {
	const editor = useEditor()
	const toast = useToasts()

	return useCallback(async () => {
		const input = document.getElementById('openai_key_risky_but_cool') as HTMLInputElement
		const apiKey = input?.value ?? null

		track('make_real', { timestamp: Date.now() })

		try {
			await makeReal(editor, apiKey)
		} catch (e: any) {
			track('no_luck', { timestamp: Date.now() })

			console.error(e)
			toast.addToast({
				title: 'Something went wrong',
				description: `${e.message.slice(0, 200)}`,
				actions: [
					{
						type: 'primary',
						label: 'Join Discord',
						onClick: () => {
							// open a new tab with the url...
							window.open('https://discord.gg/QHqp9f7ejq', '_blank')
						},
					},
					{
						type: 'normal',
						label: 'FAQs',
						onClick: () => {
							window.open(
								'https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e?pvs=4',
								'_blank'
							)
						},
					},
				],
			})
		}
	}, [editor, toast])
}
