import { TldrawUiIcon, useBreakpoint, useEditor, useValue } from '@tldraw/tldraw'
import { ChangeEvent, useCallback, useState } from 'react'
import { setTimeout } from 'timers'

export function APIKeyInput() {
	const breakpoint = useBreakpoint()
	const [cool, setCool] = useState(false)

	const editor = useEditor()
	const isFocusMode = useValue('is focus mode', () => editor.getInstanceState().isFocusMode, [
		editor,
	])

	// Store the API key locally
	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		localStorage.setItem('makeitreal_key', e.target.value)
	}, [])

	const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			e.stopPropagation()
			e.currentTarget.blur()
			setCool(true) // its cool
			setTimeout(() => setCool(false), 1200)
		}
	}, [])

	if (isFocusMode) return null

	return (
		<div className={`your-own-api-key ${breakpoint < 6 ? 'your-own-api-key__mobile' : ''}`}>
			<div className="your-own-api-key__inner">
				<div className="input__wrapper">
					<input
						id="openai_key_risky_but_cool"
						defaultValue={localStorage.getItem('makeitreal_key') ?? ''}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						spellCheck={false}
						autoCapitalize="off"
					/>
				</div>
				<a
					className="question__button"
					target="_blank"
					href="https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e?pvs=4"
				>
					<TldrawUiIcon icon={cool ? 'check' : 'question'} />
				</a>
			</div>
		</div>
	)
}
