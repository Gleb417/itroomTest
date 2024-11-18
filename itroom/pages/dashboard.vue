<template>
	<div>
		<Navbar />
		<h1>Список постов</h1>
		<ul>
			<li v-for="post in posts" :key="post.id">
				<NuxtLink :to="`/post/${post.id}`">{{ post.label }}</NuxtLink>
			</li>
		</ul>
	</div>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'
import Navbar from '~/components/Navbar.vue'

definePageMeta({
	middleware: 'auth',
})

const { accessToken } = useAuth()
const { data: posts, error } = await useFetch(
	'http://localhost:3001/api/posts',
	{
		headers: { Authorization: `Bearer ${accessToken.value}` },
	}
)

if (error.value) {
	console.error('Ошибка при загрузке данных:', error.value)
}
</script>
