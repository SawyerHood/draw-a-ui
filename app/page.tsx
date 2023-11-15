/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import Lockup from './lockup.svg'

import dynamic from 'next/dynamic'
import '@tldraw/tldraw/tldraw.css'
import React, { useEffect, useState } from 'react'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'
import { ExportButton } from './components/ExportButton'
import { useDialogs, useEditor } from '@tldraw/tldraw'
import { APIKeyInput } from './components/APIKeyInput'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]

export default function Home() {
	return (
		<>
			<div className={`w-screen h-screen`}>
				<Tldraw
					persistenceKey="tldraw"
					shapeUtils={shapeUtils}
					shareZone={<ExportButton />}
				>
					<a
						href="https://www.tldraw.dev"
						style={{
							pointerEvents: 'all',
							position: 'fixed',
							zIndex: 100000,
							bottom: 0,
							right: 0,
						}}
					>
						<img
							className="lockup"
							src="/lockup.svg"
							style={{ padding: 8, height: 40 }}
						/>
						{/* <img src={lockup} style={{ height: 40, width: 'auto' }} /> */}
					</a>
					<DialogWarning />
					<APIKeyInput />
				</Tldraw>
			</div>
		</>
	)
}

function DialogWarning() {
	const [state, setState] = useState(
		() => localStorage.getItem('dialog_warning') ?? false
	)

	useEffect(() => {
		if (!state) {
			alert(
				'This is almost certainly not going to work due to rate limits on OpenAI keys. But it normally really does work! Sorry!'
			)
			localStorage.setItem('dialog_warning', 'true')
			setState(false)
		}
	}, [state])

	return null
}
