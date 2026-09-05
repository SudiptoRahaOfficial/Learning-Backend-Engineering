'use client'
import React, { useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function Home() {
	const router = useRouter()
	async function handleSubmit(event) {
		event.preventDefault()
		const formData = new FormData(event.target)
		axios
			.post('http://localhost:5000/create-post', formData)
			.then((res) => {
				router.push('/')
			})
	}
	return (
		<main className='min-h-screen bg-gray-200 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 flex items-center justify-center'>
			<section className='mx-auto w-full max-w-2xl'>
				{/* Page heading */}
				<div className='mb-8 text-center sm:mb-10'>
					<h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
						Create Post
					</h1>

					<p className='mt-2 text-sm leading-6 sm:text-base'>
						Upload an image and add a caption to create a new post.
					</p>
				</div>

				{/* Create post form */}
				<form
					onSubmit={handleSubmit}
					className='space-y-6 rounded-sm border border-gray-300 bg-gray-100 p-5 sm:p-6'
				>
					{/* Image input */}
					<div>
						<label
							htmlFor='image'
							className='mb-2 block text-sm font-semibold'
						>
							Post Image
						</label>

						<input
							id='image'
							type='file'
							name='image'
							accept='image/*'
							required
							className='block w-full cursor-pointer rounded-sm border border-gray-300 bg-white text-sm file:mr-4 file:border-0 file:border-r file:border-gray-300 file:bg-gray-200 file:px-4 file:py-3 file:text-sm file:font-medium hover:file:bg-gray-300'
						/>
					</div>

					{/* Caption input */}
					<div>
						<label
							htmlFor='caption'
							className='mb-2 block text-sm font-semibold'
						>
							Caption
						</label>

						<input
							id='caption'
							type='text'
							name='caption'
							placeholder='Enter caption'
							required
							className='w-full rounded-sm border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-base'
						/>
					</div>

					{/* Submit button */}
					<button
						type='submit'
						className='w-full cursor-pointer rounded-sm bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800'
					>
						Create Post
					</button>
				</form>
			</section>
		</main>
	)
}