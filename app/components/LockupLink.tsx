import { useBreakpoint, useEditor, useValue } from '@tldraw/tldraw'
import { track } from '@vercel/analytics/react'

export function LockupLink() {
	const breakpoint = useBreakpoint()
	const editor = useEditor()
	const isFocusMode = useValue('isFocusMode', () => editor.getInstanceState().isFocusMode, [editor])

	if (isFocusMode) return null

	return (
		<a
			className={`lockup__link ${breakpoint < 6 ? 'lockup__link__mobile' : ''}`}
			href="https://twitter.com/tldraw"
			onClick={() => track('lockup_clicked', { timestamp: Date.now() })}
		>
			<img alt="tldraw logo" className="lockup" src="/lockup.svg" />
		</a>
	)
}
