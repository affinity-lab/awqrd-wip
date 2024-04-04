export type FileSizeWithUnit =
	`${number}KB` | `${number}kb` | `${number}kB` |
	`${number}MB` | `${number}mb` |
	`${number}GB` | `${number}gb` |
	`${number}TB` | `${number}tb` |
	`${number}B` | `${number}b`

export type Attachment = {
	name: string
	size: number
	id: string
	metadata: Record<string, any>
}

export type Attachments = Array<Attachment>;

export type AttachmentRecord = {
	id: number
	name: string
	itemId: number
	data: string
}

export type TmpFile = {
	file: string
	filename: string
	release: () => void | Promise<void>
}