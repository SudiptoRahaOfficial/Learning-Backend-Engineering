import '../styles/globals.css'

export const metadata = {
	title: 'Post Creation App',
	description:
		'This is the home page of post creation app. This is a full-stack application.',
}

export default function RootLayout({ children }) {
	return (
		<html
			lang='en'
			className={`h-full antialiased`}
		>
			<body className='min-h-full flex flex-col'>{children}</body>
		</html>
	)
}