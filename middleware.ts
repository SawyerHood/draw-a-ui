import { NextRequest, NextResponse } from 'next/server'
import { APP_HOST, LINK_HOST } from './app/lib/hosts'

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _vercel (Vercel internals)
		 * - _next (next internals)
		 * - some-file.extension (static files)
		 */
		'/((?!_vercel|_next/|[\\w-]+\\.\\w+).*)',
	],
}

export function middleware(req: NextRequest) {
	const url = req.nextUrl

	const host = req.headers.get('host').toLowerCase()

	const rewrittenUrl = new URL(url.toString())

	if (host === LINK_HOST) {
		// rewrite requests on the link host to the link site:
		rewrittenUrl.pathname = `/makereal.tldraw.link${rewrittenUrl.pathname}`
	} else {
		// rewrite everything else to the main site:
		rewrittenUrl.pathname = `/makereal.tldraw.com${rewrittenUrl.pathname}`
	}

	console.log(`rewriting ${url} to ${rewrittenUrl}`)

	return NextResponse.rewrite(rewrittenUrl)
}
