/* eslint-disable react-hooks/rules-of-hooks */
import {
	TLBaseShape,
	BaseBoxShapeUtil,
	useIsEditing,
	HTMLContainer,
	toDomPrecision,
	SvgExportContext,
	TLFrameShape,
	Icon,
	useToasts,
	stopEventPropagation,
} from '@tldraw/tldraw'

export type PreviewShape = TLBaseShape<
	'preview',
	{
		html: string
		w: number
		h: number
	}
>
export class PreviewShapeUtil extends BaseBoxShapeUtil<PreviewShape> {
	static override type = 'preview' as const

	getDefaultProps(): PreviewShape['props'] {
		return {
			html: '',
			w: (960 * 2) / 3,
			h: (540 * 2) / 3,
		}
	}

	override canEdit = () => true
	override isAspectRatioLocked = (_shape: PreviewShape) => false
	override canResize = (_shape: PreviewShape) => true
	override canBind = (_shape: PreviewShape) => false

	override component(shape: PreviewShape) {
		const isEditing = useIsEditing(shape.id)
		const toast = useToasts()
		return (
			<HTMLContainer className="tl-embed-container" id={shape.id}>
				<iframe
					className="tl-embed"
					srcDoc={shape.props.html}
					width={toDomPrecision(shape.props.w)}
					height={toDomPrecision(shape.props.h)}
					draggable={false}
					style={{
						border: 0,
						pointerEvents: isEditing ? 'auto' : 'none',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						top: 0,
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
							navigator.clipboard.writeText(shape.props.html)
							toast.addToast({
								icon: 'duplicate',
								title: 'Copied to clipboard',
							})
						}
					}}
					onPointerDown={stopEventPropagation}
				>
					<Icon icon="duplicate" />
				</div>
			</HTMLContainer>
		)
	}

	indicator(shape: PreviewShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}
