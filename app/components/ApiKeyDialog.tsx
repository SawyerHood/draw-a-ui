import { useRef } from 'react'
import {
	TLUiDialogProps,
	TldrawUiButton,
	TldrawUiButtonLabel,
	TldrawUiDialogBody,
	TldrawUiDialogCloseButton,
	TldrawUiDialogFooter,
	TldrawUiDialogHeader,
	TldrawUiDialogTitle,
	TldrawUiIcon,
	TldrawUiInput,
	useValue,
} from 'tldraw'
import { makeRealSettings } from '../lib/apiKeys'

export const ApiKeyDialog = ({ onClose }: TLUiDialogProps) => {
	const settings = useValue('settings', () => makeRealSettings.get(), [])
	const rRef = useRef<HTMLInputElement>(null)

	return (
		<>
			<TldrawUiDialogHeader>
				<TldrawUiDialogTitle>API Keys</TldrawUiDialogTitle>
				<TldrawUiDialogCloseButton />
			</TldrawUiDialogHeader>
			<TldrawUiDialogBody
				style={{ maxWidth: 350, display: 'flex', flexDirection: 'column', gap: 8 }}
			>
				<p>
					To use Make Real, you will need to enter your API key for each provider you wish to use.
					For help on how to get an API key for a provider, click the question mark button beside
					the provider name.
				</p>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
					<div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
						<label style={{ flexGrow: 2 }}>Provider</label>
					</div>
					<select
						className="apikey_select"
						value={settings.provider}
						onChange={(e) => {
							const next = { ...settings, provider: e.target.value as any }
							localStorage.setItem('makereal_settings_2', JSON.stringify(next))
							makeRealSettings.set(next)
						}}
					>
						<option value="openai">OpenAI (gpt-4o)</option>
						<option value="anthropic">Anthropic (Claude Sonnet 3.5)</option>
					</select>
				</div>
				<hr style={{ margin: '12px 0px' }} />
				<div
					className="apikey_dialog"
					ref={rRef}
					style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
				>
					<div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
						<label style={{ flexGrow: 2 }}>OpenAI</label>
						<a
							target="_blank"
							style={{ pointerEvents: 'all' }}
							href="https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e?pvs=4"
						>
							<TldrawUiIcon icon={'question'} small />
						</a>
					</div>
					<TldrawUiInput
						className="apikey_input"
						value={settings.keys.openai}
						placeholder="risky but cool"
						onValueChange={(value) => {
							const next = { ...settings, keys: { ...settings.keys, openai: value } }
							localStorage.setItem('makereal_settings_2', JSON.stringify(next))
							makeRealSettings.set(next)
						}}
					/>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<div style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
						<label style={{ flexGrow: 2 }}>Anthropic</label>
						<a
							target="_blank"
							style={{ pointerEvents: 'all' }}
							href="https://tldraw.notion.site/Make-Real-FAQs-93be8b5273d14f7386e14eb142575e6e?pvs=4"
						>
							<TldrawUiIcon icon={'question'} small />
						</a>
					</div>
					<TldrawUiInput
						className="apikey_input"
						value={settings.keys.anthropic}
						placeholder="risky but cool"
						onValueChange={(value) => {
							const next = { ...settings, keys: { ...settings.keys, anthropic: value } }
							localStorage.setItem('makereal_settings_2', JSON.stringify(next))
							makeRealSettings.set(next)
						}}
					/>
				</div>
			</TldrawUiDialogBody>
			<TldrawUiDialogFooter className="tlui-dialog__footer__actions">
				<TldrawUiButton
					type="primary"
					onClick={async () => {
						onClose()
					}}
				>
					<TldrawUiButtonLabel>Save</TldrawUiButtonLabel>
				</TldrawUiButton>
			</TldrawUiDialogFooter>
		</>
	)
}
