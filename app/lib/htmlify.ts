export function htmlify(text: string) {
	const message = text
	const start = message.indexOf('<!DOCTYPE html>')
	const end = message.indexOf('</html>')
	if (end > 0) {
		return message.slice(start, end + '</html>'.length)
	} else {
		return message.slice(start)
	}
}
