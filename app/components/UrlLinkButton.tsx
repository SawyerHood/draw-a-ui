'use client'

import { Icon, stopEventPropagation, useToasts } from '@tldraw/tldraw'
import { usePathname } from 'next/navigation'
import { PreviewShape } from '../PreviewShape/PreviewShape'

export function UrlLinkButton({ shape }: { shape: PreviewShape }) {
	const toast = useToasts()

	return (
		<button
			style={{
				all: 'unset',
				position: 'absolute',
				top: 40,
				right: -40,
				height: 40,
				width: 40,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				cursor: 'pointer',
				pointerEvents: 'all',
			}}
			onClick={() => {
				if (navigator && navigator.clipboard) {
					navigator.clipboard.writeText(`${window.location.origin}/link/${shape.id.split(':')[1]}`)
					toast.addToast({
						icon: 'code',
						title: 'Copied url to clipboard',
					})
				}
			}}
			onPointerDown={stopEventPropagation}
			title="Copy url to clipboard"
		>
			<Icon icon="link" />
		</button>
	)
}
