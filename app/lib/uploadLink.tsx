'use server'

import { sql } from '@vercel/postgres'

export async function uploadLink(shapeId: string, html: string) {
	if (typeof shapeId !== 'string' || !shapeId.startsWith('shape:')) {
		throw new Error('shapeId must be a string starting with shape:')
	}
	if (typeof html !== 'string') {
		throw new Error('html must be a string')
	}

	shapeId = shapeId.replace(/^shape:/, '')
	console.log('Uploading', shapeId)
	await sql`INSERT INTO links (shape_id, html) VALUES (${shapeId}, ${html})`
}
