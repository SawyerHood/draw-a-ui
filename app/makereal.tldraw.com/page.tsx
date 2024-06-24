/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'
import { PreviewShapeUtil } from '../PreviewShape/PreviewShape'
import { MakeRealButton } from '../components/MakeRealButton'

import { useEffect } from 'react'
import { LinkArea } from '../components/LinkArea'
import { makeRealSettings } from '../lib/makeRealSettings'

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]

export default function Home() {
	useEffect(() => {
		const value = localStorage.getItem('makereal_settings_2')
		if (value) {
			const json = JSON.parse(value)
			makeRealSettings.set(json)
		}
	}, [])

	return (
		<div className="tldraw__editor">
			<Tldraw
				persistenceKey="tldraw"
				shapeUtils={shapeUtils}
				components={{ SharePanel: () => <MakeRealButton /> }}
			>
				<LinkArea />
			</Tldraw>
		</div>
	)
}
