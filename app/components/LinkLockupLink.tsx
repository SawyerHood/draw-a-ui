'use client'

import { track } from '@vercel/analytics'

export function LinkLockupLink() {
	return (
		<a
			className={`lockup__link`}
			href="https://twitter.com/tldraw"
			onClick={() => track('lockup_clicked', { timestamp: Date.now() })}
		>
			<img alt="tldraw logo" className="lockup" src="/lockup.svg" />
		</a>
	)
}
