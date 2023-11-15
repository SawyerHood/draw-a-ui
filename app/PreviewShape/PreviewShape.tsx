/* eslint-disable react-hooks/rules-of-hooks */
import {
	TLBaseShape,
	BaseBoxShapeUtil,
	useIsEditing,
	HTMLContainer,
	toDomPrecision,
	SvgExportContext,
	TLFrameShape,
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
			</HTMLContainer>
		)
	}

	indicator(shape: PreviewShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}

	override toSvg(shape: TLFrameShape): SVGElement | Promise<SVGElement> {
		const image = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'image'
		)
		image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '')
		image.id = `preview_${shape.id}`
		return image
	}
}
