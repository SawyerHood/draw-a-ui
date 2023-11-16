import { Icon, useBreakpoint } from '@tldraw/tldraw'
import { ChangeEvent, useCallback } from 'react'

export function APIKeyInput() {
	const breakpoint = useBreakpoint()

	// Store the API key locally, but ONLY in development mode
	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		if (process.env.NODE_ENV === 'development') {
			localStorage.setItem('makeitreal_key', e.target.value)
		}
	}, [])

	return (
		<div className={`your-own-api-key ${breakpoint < 5 ? 'your-own-api-key__mobile' : ''}`}>
			<div className="your-own-api-key__inner">
				<div className="input__wrapper">
					<input
						id="openai_key_risky_but_cool"
						defaultValue={localStorage.getItem('makeitreal_key') ?? ''}
						onChange={handleChange}
					/>
				</div>
				<button
					className="question__button"
					onClick={() =>
						window.alert(
							`Sorry, this is weird. The OpenAI APIs that we use are very new. If you have an OpenAI developer key, you can put it in this input and we'll use it. We don't save / store / upload these.\n\nSee https://platform.openai.com/api-keys to get a key.\n\nThis app's source code: https://github.com/tldraw/draw-a-ui`
						)
					}
				>
					<Icon icon="question" />
				</button>
			</div>
		</div>
	)
}
