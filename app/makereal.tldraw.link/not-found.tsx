import { redirect } from 'next/navigation'
import { APP_HOST, PROTOCOL } from '../lib/hosts'

export default function NotFound() {
	return redirect(`${PROTOCOL}${APP_HOST}`)
}
