import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function POST(request: Request): Promise<NextResponse> {
	const { searchParams } = new URL(request.url)

	const id = searchParams.get('id')
	const { html } = await request.json()

	await sql`INSERT INTO links (shape_id, html) VALUES (${id.split(':')[1]}, ${html})`

	return NextResponse.json({ success: true })
}
