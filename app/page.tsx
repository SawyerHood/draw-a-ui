/* eslint-disable react-hooks/rules-of-hooks */

'use client'

import dynamic from 'next/dynamic'
import '@tldraw/tldraw/tldraw.css'
import React from 'react'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'
import { ExportButton } from './components/ExportButton'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]

export default function Home() {
	return (
		<>
			<div className={`w-screen h-screen`}>
				<Tldraw persistenceKey="tldraw" shapeUtils={shapeUtils}>
					<ExportButton />
				</Tldraw>
			</div>
		</>
	)
}
