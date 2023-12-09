import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const res = await req.json()
		const { html } = res
		const response = await fetch('https://replit.com/external/v1/claims', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title: 'My Tldraw Repl',
				files: [{ path: 'index.html', content: html }],
				secret: process.env.REPLIT_CLAIMS_KEY,
			}),
		}).then((r) => r.json())

		return Response.json(response)
	} catch (e) {
		return Response.json({ message: `Something went wrong: ${e.message}` })
	}
}
