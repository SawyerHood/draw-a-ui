import { sql } from '@vercel/postgres'

export default async function LinkPage({ params }: { params: { id: string } }) {
	const { id } = params
	const row = await sql`SELECT html FROM links WHERE shape_id = ${id}`

	return (
		<div>
			{JSON.stringify(row)}
			<iframe
				srcDoc={row.rows[0].html}
				width={'100%'}
				height={'100%'}
				draggable={false}
				style={{ position: 'fixed', inset: 0 }}
			/>
		</div>
	)
}
