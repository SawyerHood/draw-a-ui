/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import Lockup from './lockup.svg'

import dynamic from 'next/dynamic'
import '@tldraw/tldraw/tldraw.css'
import React, { useEffect, useState } from 'react'
import { PreviewShapeUtil } from './PreviewShape/PreviewShape'
import { ExportButton } from './components/ExportButton'
import { useBreakpoint, useDialogs, useEditor } from '@tldraw/tldraw'
import { APIKeyInput } from './components/APIKeyInput'

const Tldraw = dynamic(async () => (await import('@tldraw/tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]

export default function Home() {
	return (
		<>
			<div className={'tldraw__editor'}>
				<Tldraw
					persistenceKey="tldraw"
					shapeUtils={shapeUtils}
					shareZone={<ExportButton />}
				>
					<APIKeyInput />
					<LockupLink />
				</Tldraw>
			</div>
		</>
	)
}

function LockupLink() {
	const breakpoint = useBreakpoint()
	return (
		<a
			className={`lockup__link ${breakpoint < 4 ? 'lockup__link__mobile' : ''}`}
			href="https://www.tldraw.dev"
		>
			<img
				className="lockup"
				src="/lockup.svg"
				style={{ padding: 8, height: 40 }}
			/>
		</a>
	)
}
