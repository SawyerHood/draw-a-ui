import { useBreakpoint, useEditor, useValue } from '@tldraw/tldraw'
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
			<FAQLink breakpoint={breakpoint} />
			<a
				href="https://twitter.com/tldraw"
				onClick={() => track('lockup_clicked', { timestamp: Date.now() })}
			>
				<img alt="tldraw logo" className="lockup" src="/lockup.svg" />
			</a>
		</span>
	)
}

function FAQLink({ breakpoint }: { breakpoint: number }) {
	return (
		<a
			className={`help__button ${breakpoint < 6 ? 'help__button__mobile' : ''}`}
			href="https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e?pvs=4"
		>
			<div className="bg-[rgb(244 244 244)]  border border-[rgb(221 221 221)]  shadow-sm hover: font-bold p-1 rounded-full">
				<QuestionMarkIcon />
			</div>
		</a>
	)
}

function QuestionMarkIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M5 5.36809C5 3.71949 6.51929 2.5 8 2.5C9.48071 2.5 11 3.71949 11 5.36809C11 8.23784 8 8.15538 8 11"
				stroke="#222222"
				stroke-linecap="round"
			/>
			<path
				d="M8.75 13.75C8.75 14.1642 8.41421 14.5 8 14.5C7.58579 14.5 7.25 14.1642 7.25 13.75C7.25 13.3358 7.58579 13 8 13C8.41421 13 8.75 13.3358 8.75 13.75Z"
				fill="#222222"
			/>
		</svg>
	)
}
