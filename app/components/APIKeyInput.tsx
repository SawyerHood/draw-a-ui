import { useBreakpoint } from '@tldraw/tldraw'
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
				<div>Have your own OpenAI API key?</div>
				<div className="input__wrapper">
					<input
						id="openai_key_risky_but_cool"
						defaultValue={localStorage.getItem('makeitreal_key') ?? ''}
						onChange={handleChange}
					/>
				</div>
			</div>
		</div>
	)
}
