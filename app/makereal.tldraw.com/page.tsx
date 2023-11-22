/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import '@tldraw/tldraw/tldraw.css'
import dynamic from 'next/dynamic'
import { PreviewShapeUtil } from '../PreviewShape/PreviewShape'
import { APIKeyInput } from '../components/APIKeyInput'
import { ExportButton } from '../components/ExportButton'
import { LockupLink } from '../components/LockupLink'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]

export default function Home() {
	return (
		<div className="tldraw__editor">
			<Tldraw persistenceKey="tldraw" shapeUtils={shapeUtils} shareZone={<ExportButton />}>
				<APIKeyInput />
				<LockupLink />
			</Tldraw>
		</div>
	)
}
