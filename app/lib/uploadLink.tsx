'use server'

import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function uploadLink(shapeId: string, html: string) {
	if (typeof shapeId !== 'string') {
		throw new Error('shapeId must be a string')
	}
	if (typeof html !== 'string') {
		throw new Error('html must be a string')
	}

	await sql`INSERT INTO links (shape_id, html) VALUES (${shapeId}, ${html})`
}
