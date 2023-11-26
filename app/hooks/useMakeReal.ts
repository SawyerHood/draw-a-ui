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
				description: `${e.message.slice(0, 100)}`,
				actions: [
					{
						type: 'primary',
						label: 'Learn more',
						onClick: () => {
							// open a new tab with the url...
							window.open('https://discord.gg/QHqp9f7ejq', '_blank')
						},
					},
				],
			})
		}
	}, [editor, toast])
}
