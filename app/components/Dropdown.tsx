import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import sdk from '@stackblitz/sdk'
import { useCallback } from 'react'
import { stopEventPropagation, useToasts } from 'tldraw'
import {
	createReplitProject,
	createStackBlitzProject,
	getCodeSandboxUrl,
} from '../lib/third-parties'

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

	const copyLink = useCallback(() => {
		if (navigator && navigator.clipboard) {
			navigator.clipboard.writeText(uploadUrl)
			toast.addToast({
				icon: 'link',
				title: 'Copied link to clipboard',
			})
		}
	}, [uploadUrl, toast])

	const copyHtml = useCallback(() => {
		if (navigator && navigator.clipboard) {
			navigator.clipboard.writeText(html)
			toast.addToast({
				// icon: 'code',
				title: 'Copied html to clipboard',
			})
		}
	}, [html, toast])

	const openInCodeSandbox = useCallback(() => {
		try {
			const sandboxUrl = getCodeSandboxUrl(html)
			window.open(sandboxUrl)
		} catch {
			toast.addToast({ title: 'There was a problem opening in CodeSandbox.' })
		}
	}, [html, toast])

	const openInStackBlitz = useCallback(() => {
		try {
			const project = createStackBlitzProject(html)
			sdk.openProject(project, { openFile: 'index.html' })
		} catch (e) {
			toast.addToast({ title: 'There was a problem opening in Stackblitz.' })
		}
	}, [html, toast])

	const openInReplit = useCallback(async () => {
		try {
			const { error, url } = await createReplitProject(html)
			if (error) {
				console.error(error)
				throw Error()
			}
			window.open(url)
		} catch (e) {
			toast.addToast({ title: 'There was a problem opening in Replit.' })
		}
	}, [html, toast])

	// const openInCodePen = useCallback(async () => {
	// 	window.open(getCodePenUrl(html))
	// }, [html])

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content side="right" sideOffset={10} align="start">
					<div
						style={{ boxShadow, pointerEvents: 'all', background: '#fdfdfd' }}
						className="flex items-start flex-col text-xs bg-white rounded-[9px] w-full p-1"
					>
						<Item action={copyLink}>Copy link</Item>
						<Item action={copyHtml}>Copy HTML</Item>
						<div
							style={{
								height: '1px',
								margin: '4px -4px',
								width: 'calc(100% + 8px)',
								background: '#e8e8e8',
							}}
						></div>
						<Item action={() => window.open(uploadUrl)}>Open in new tab</Item>
						<Item action={openInCodeSandbox}>Open in CodeSandbox</Item>
						<Item action={openInStackBlitz}>Open in StackBlitz</Item>
						<Item action={openInReplit}>Open in Replit</Item>
						{/* <Item action={openInCodePen}>Open in CodePen</Item> */}
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

function Item({ action, children }: { action: () => void; children: React.ReactNode }) {
	return (
		<DropdownMenu.Item asChild>
			<button
				onPointerDown={stopEventPropagation}
				onClick={action}
				onTouchEnd={action}
				className=" hover:bg-gray-100 outline-none h-9 px-3 text-left w-full rounded-md box-border"
				style={{
					textShadow: '1px 1px #fff',
				}}
			>
				{children}
			</button>
		</DropdownMenu.Item>
	)
}
