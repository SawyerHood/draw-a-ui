import { sql } from '@vercel/postgres'
import { track } from '@vercel/analytics'
import { LinkLockupLink } from '../../components/LinkLockupLink'

export default async function LinkPage({ params }: { params: { id: string } }) {
	const { id } = params
	try {
		const row = await sql`SELECT html FROM links WHERE shape_id = ${id}`

		return (
			<div>
				<iframe
					srcDoc={row.rows[0].html}
					width={'100%'}
					height={'100%'}
					draggable={false}
					style={{ position: 'fixed', inset: 0 }}
				/>
				<LinkLockupLink />
			</div>
		)
	} catch (e) {
		return (
			<div style={{ padding: 12 }}>
				Sorry, no link for this one. It must have been made before we added links! <br />
				<br />
				<a style={{ color: 'blue' }} href="https://makereal.tldraw.com/">
					Go back
				</a>
			</div>
		)
	}
}
