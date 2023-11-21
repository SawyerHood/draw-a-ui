import { redirect } from 'next/navigation'
import { LINK_HOST, PROTOCOL } from '../../../lib/hosts'

export default async function LinkPage({ params }: { params: { id: string } }) {
	return redirect(`${PROTOCOL}${LINK_HOST}/${params.id}`)
}
