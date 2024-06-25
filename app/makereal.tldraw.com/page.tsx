/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

export const maxDuration = 120

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'
import { PreviewShapeUtil } from '../PreviewShape/PreviewShape'
import { MakeRealButton } from '../components/MakeRealButton'

import { useEffect } from 'react'
import { DefaultMainMenu, DefaultMainMenuContent, useDialogs } from 'tldraw'
import { LinkArea } from '../components/LinkArea'
import { Links } from '../components/Links'
import { SettingsDialog } from '../components/SettingsDialog'
import { PROVIDERS, makeRealSettings } from '../lib/settings'

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

const shapeUtils = [PreviewShapeUtil]
const components = {
	SharePanel: () => <MakeRealButton />,
	MainMenu: () => (
		<DefaultMainMenu>
			<DefaultMainMenuContent />
			<Links />
		</DefaultMainMenu>
	),
}

export default function Home() {
	return (
		<div className="tldraw__editor">
			<Tldraw persistenceKey="tldraw" shapeUtils={shapeUtils} components={components}>
				<LinkArea />
				<InsideTldrawContext />
			</Tldraw>
		</div>
	)
}

function InsideTldrawContext() {
	const { addDialog } = useDialogs()

	useEffect(() => {
		const value = localStorage.getItem('makereal_settings_2')
		if (value) {
			const json = JSON.parse(value)
			makeRealSettings.set(json)
		}
		const settings = makeRealSettings.get()

		for (const provider of PROVIDERS) {
			const apiKey = settings.keys[provider.id]
			if (apiKey && provider.validate(apiKey)) {
				return
			}
		}

		// no valid key found, show the settings modal
		addDialog({
			id: 'api keys',
			component: SettingsDialog,
		})
	}, [addDialog])

	return null
}
