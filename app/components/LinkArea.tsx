import { useBreakpoint, useEditor, useValue } from 'tldraw'
import { track } from '@vercel/analytics/react'

export function LinkArea() {
	const breakpoint = useBreakpoint()
	const editor = useEditor()
	const isFocusMode = useValue('isFocusMode', () => editor.getInstanceState().isFocusMode, [editor])

	if (isFocusMode) return null

	return (
		<span
			className={`lockup__link ${
				breakpoint < 6 ? 'lockup__link__mobile' : ''
			} flex mb-1 items-center justify-center`}
		>
			<a
				href="https://twitter.com/tldraw"
				onClick={() => track('lockup_clicked', { timestamp: Date.now() })}
			>
				<img alt="tldraw logo" className="lockup" src="/lockup.svg" />
			</a>
		</span>
	)
}
