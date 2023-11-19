import { useMakeReal } from '../hooks/useMakeReal'

export function ExportButton() {
	const makeReal = useMakeReal()

	// A tailwind styled button that is pinned to the bottom right of the screen
	return (
		<button
			onClick={makeReal}
			className="p-2"
			style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
		>
			<div className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
				Make Real
			</div>
		</button>
	)
}
