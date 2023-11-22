import { sql } from '@vercel/postgres'
import { notFound } from 'next/navigation'
import { LinkLockupLink } from '../../components/LinkLockupLink'

export const dynamic = 'force-dynamic'

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

	const SCRIPT_TO_INJECT_FOR_PREVIEW = `
    // send the screenshot to the parent window
	// and prevent the user from pinch-zooming into the iframe
	html2canvas(document.body).then(function(canvas) {
		 const data = canvas.toDataURL('image/png');  window.parent.parent.postMessage({screenshot: data, shapeid:"shape:${linkId}"}, "*");
  });
    document.body.addEventListener('wheel', e => {
        if (!e.ctrlKey) return;
        e.preventDefault();
    }, { passive: false })
`

	if (isPreview) {
		html = html.includes('</body>')
			? html.replace(
					'</body>',
					`<script src="https://unpkg.com/html2canvas"></script><script>${SCRIPT_TO_INJECT_FOR_PREVIEW}</script></body>`
			  )
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
