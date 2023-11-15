import { Input, useBreakpoint } from '@tldraw/tldraw'

export function APIKeyInput() {
	const breakpoint = useBreakpoint()
	return (
		<div
			className={`your-own-api-key ${
				breakpoint < 5 ? 'your-own-api-key__mobile' : ''
			}`}
		>
			<div className="your-own-api-key__inner">
				<div>Have your own OpenAI API key?</div>
				<div className="input__wrapper">
					<input id="openai_key_risky_but_cool" />
				</div>
			</div>
		</div>
	)
}
