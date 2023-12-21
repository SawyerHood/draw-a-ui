import { useMakeReal } from '../hooks/useMakeReal'

export function ExportButton() {
	const makeReal = useMakeReal()

	return (
		<button
			onClick={makeReal}
			className="p-2"
			style={{ cursor: 'pointer', zIndex: 100000, pointerEvents: 'all' }}
		>
			<div className="bg-[rgb(230,0,75)] hover:bg-[rgb(210,0,55)] text-white font-bold py-2 px-4 rounded">
				Make Up
			</div>
		</button>
	)
}
