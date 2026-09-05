'use client'
import React, { useState, useEffect } from 'react'

export default function Home() {
	const [posts, setPosts] = useState([])

	return (
		<main className='min-h-screen px-4 py-8 sm:px-6 sm:py-10 lg:px-8 bg-gray-200'>
			<section className='mx-auto w-full max-w-7xl'>
				{/* Page heading */}
				<div className='mb-8 sm:mb-10'>
					<h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
						Posts
					</h1>

					<p className='mt-2 text-sm leading-6 sm:text-base'>
						Explore the latest posts.
					</p>
				</div>

				{/* Posts */}
				{posts.length > 0 ? (
					<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
						{posts.map((post) => (
							<div
								key={post._id}
								className='group overflow-hidden bg-gray-100 p-5 rounded-sm border border-gray-300 cursor-pointer'
							>
								{/* Post image */}
								<div className='aspect-video w-full overflow-hidden'>
									<img
										src={post.image}
										alt={post.caption || 'Post image'}
										loading='lazy'
										className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
									/>
								</div>

								{/* Post content */}
								<p className='line-clamp-3 text-sm leading-6 sm:text-base'>
									{post.caption}
								</p>
							</div>
						))}
					</div>
				) : (
					<div className='min-h-72 flex items-center justify-center px-6 text-center bg-gray-100 border border-dashed rounded-sm'>
						<div>
							<h2 className='text-lg font-semibold'>
								No posts yet
							</h2>

							<p className='mt-2 text-sm'>
								New posts will appear here once they are
								available.
							</p>
						</div>
					</div>
				)}
			</section>
		</main>
	)
}