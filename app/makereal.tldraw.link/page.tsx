import { redirect } from 'next/navigation'
import { APP_HOST, PROTOCOL } from '../lib/hosts'

export default function MainPage() {
	// redirect makereal.tldraw.link to makereal.tldraw.com
	return redirect(`${PROTOCOL}${APP_HOST}`)
}
