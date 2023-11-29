import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { stopEventPropagation, useToasts } from '@tldraw/tldraw'
import { useCallback } from 'react'
import sdk, { Project } from '@stackblitz/sdk'

function createStackBlitzProject(html: string) {
	const stacklitzProject: Project = {
		title: 'Make real from tldraw',
		description: 'Your AI generated example made at https://makereal.tldraw.com/',
		template: 'html',
		files: { 'index.html': html },
	}
	return stacklitzProject
}

export function Dropdown({
	boxShadow,
	children,
	html,
	uploadUrl,
}: {
	boxShadow: string
	children: React.ReactNode
	html: string
	uploadUrl: string
}) {
	const toast = useToasts()
	const copyHtml = useCallback(() => {
		console.log('copy link')
		if (navigator && navigator.clipboard) {
			navigator.clipboard.writeText(html)
			toast.addToast({
				icon: 'code',
				title: 'Copied html to clipboard',
			})
		}
	}, [html, toast])

	const copyLink = useCallback(() => {
		if (navigator && navigator.clipboard) {
			navigator.clipboard.writeText(uploadUrl)
			toast.addToast({
				icon: 'code',
				title: 'Copied url to clipboard',
			})
		}
	}, [uploadUrl, toast])

	const openInCodeSandBox = useCallback(() => {
		console.log('codesandbox', html)
	}, [html])

	const openInStackBlitz = useCallback(() => {
		console.log('oepning')
		const project = createStackBlitzProject(html)
		sdk.openProject(project, { openFile: 'index.html' })
	}, [html])

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>{children}</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content side="right" sideOffset={10} align="start">
					<div
						style={{ boxShadow, pointerEvents: 'all' }}
						className="flex items-start flex-col text-xs bg-white rounded-[9px] w-full p-0.5"
					>
						<Item action={copyHtml}>Copy HTML</Item>
						<Item action={copyLink}>Copy link</Item>
						<Item action={() => window.open(uploadUrl)}>Open in new tab</Item>
						<div
							style={{
								height: '1px',
								margin: '0 -4px',
								width: 'calc(100% + 8px)',
								background: '#e8e8e8',
							}}
						></div>
						<Item action={openInCodeSandBox}>Open in CodeSandbox</Item>
						<Item action={openInStackBlitz}>Open in StackBlitz</Item>
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

function Item({ action, children }: { action: () => void; children: React.ReactNode }) {
	return (
		<DropdownMenu.Item asChild>
			<div
				className="flex items-center w-full px-1 h-10 group cursor-pointer"
				onPointerDown={stopEventPropagation}
				onClick={action}
			>
				<button className="p-2 group-hover:bg-gray-100 text-left h-8 w-full rounded-md">
					{children}
				</button>
			</div>
		</DropdownMenu.Item>
	)
}
