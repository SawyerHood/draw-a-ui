import { Input } from '@tldraw/tldraw'

export function APIKeyInput() {
	return (
		<div
			style={{
				position: 'absolute',
				bottom: 100,
				width: '100%',
				height: 50,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 99999,
			}}
		>
			<div
				style={{
					background: 'var(--color-low)',
					padding: 12,
					borderRadius: 12,
					display: 'flex',
					gap: 8,
					flexDirection: 'column',
				}}
			>
				<div>
					Have your own OpenAI API key? Use it instead. (Risky but cool)
				</div>
				<input
					id="openai_key_risky_but_cool"
					placeholder="OpenAPI Key"
					style={{
						width: '100%',
						padding: 12,
						fontSize: 'inherit',
						fontFamily: 'inherit',
						borderRadius: 8,
					}}
				/>
			</div>
		</div>
	)
}
