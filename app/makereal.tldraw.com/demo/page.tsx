/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
'use client'

export const maxDuration = 120

import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'
import { PreviewShapeUtil } from '../../PreviewShape/PreviewShape'
import '../../Slides/slides.css'
import { MakeRealButton } from '../../components/MakeRealButton'

import { useEffect } from 'react'
import {
	DefaultMainMenu,
	DefaultMainMenuContent,
	TLAnyShapeUtilConstructor,
	TLUiOverrides,
	computed,
} from 'tldraw'
import { SlideShapeTool } from '../../Slides/SlideShapeTool'
import { SlideShapeUtil } from '../../Slides/SlideShapeUtil'
import { SlidesPanel } from '../../Slides/SlidesPanel'
import { $currentSlide, getSlides, moveToSlide } from '../../Slides/useSlides'
import { LinkArea } from '../../components/LinkArea'
import { Links } from '../../components/Links'
import { makeRealSettings } from '../../lib/settings'

const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
	ssr: false,
})

const overrides: TLUiOverrides = {
	actions(editor, actions) {
		const $slides = computed('slides', () => getSlides(editor))
		return {
			...actions,
			'next-slide': {
				id: 'next-slide',
				label: 'Next slide',
				kbd: 'right',
				onSelect() {
					const slides = $slides.get()
					const currentSlide = $currentSlide.get()
					const index = slides.findIndex((s) => s.id === currentSlide?.id)
					const nextSlide = slides[index + 1] ?? currentSlide ?? slides[0]
					if (nextSlide) {
						editor.stopCameraAnimation()
						moveToSlide(editor, nextSlide)
					}
				},
			},
			'previous-slide': {
				id: 'previous-slide',
				label: 'Previous slide',
				kbd: 'left',
				onSelect() {
					const slides = $slides.get()
					const currentSlide = $currentSlide.get()
					const index = slides.findIndex((s) => s.id === currentSlide?.id)
					const previousSlide = slides[index - 1] ?? currentSlide ?? slides[slides.length - 1]
					if (previousSlide) {
						editor.stopCameraAnimation()
						moveToSlide(editor, previousSlide)
					}
				},
			},
		}
	},
	tools(editor, tools) {
		tools.slide = {
			id: 'slide',
			icon: 'group',
			label: 'Slide',
			kbd: 's',
			onSelect: () => editor.setCurrentTool('slide'),
		}
		return tools
	},
}

const shapeUtils: TLAnyShapeUtilConstructor[] = [PreviewShapeUtil, SlideShapeUtil]
const tools = [SlideShapeTool]
const components = {
	SharePanel: MakeRealButton,
	HelperButtons: SlidesPanel,
	Minimap: null,
	MainMenu: () => (
		<DefaultMainMenu>
			<DefaultMainMenuContent />
			<Links />
		</DefaultMainMenu>
	),
}

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
				persistenceKey="tldraw-demo"
				shapeUtils={shapeUtils}
				tools={tools}
				overrides={overrides}
				components={components}
				onMount={(editor) => {
					window['editor'] = editor
				}}
			>
				<LinkArea />
			</Tldraw>
		</div>
	)
}
