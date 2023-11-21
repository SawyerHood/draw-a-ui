import { sql } from '@vercel/postgres'
import { notFound } from 'next/navigation'
import { LinkLockupLink } from '../../components/LinkLockupLink'

export const dynamic = 'force-dynamic'

const SCRIPT_TO_INJECT_FOR_PREVIEW = `
    // prevent the user from pinch-zooming into the iframe
    document.body.addEventListener('wheel', e => {
        if (!e.ctrlKey) return;
        e.preventDefault();
    }, { passive: false })
`

export default async function LinkPage({
	params,
	searchParams,
}: {
	params: { linkId: string }
	searchParams: { preview?: string }
}) {
	const { linkId } = params
	const isPreview = !!searchParams.preview

	const result = await sql`SELECT html FROM links WHERE shape_id = ${linkId}`
	if (result.rows.length !== 1) notFound()

	let html: string = result.rows[0].html

	if (isPreview) {
		html = html.includes('</body>')
			? html.replace('</body>', `<script>${SCRIPT_TO_INJECT_FOR_PREVIEW}</script></body>`)
			: html + `<script>${SCRIPT_TO_INJECT_FOR_PREVIEW}</script>`
	}

	return (
		<>
			<iframe
				srcDoc={html}
				draggable={false}
				style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none' }}
			/>
			{!isPreview && <LinkLockupLink />}
		</>
	)
}
