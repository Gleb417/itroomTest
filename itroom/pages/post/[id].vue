<template>
	<div>
		<Navbar />
		<h1>{{ post.label }}</h1>
		<p>Никнейм создателя поста: {{ post.user.username }}</p>
		<p>{{ post.text }}</p>
		<div v-if="post.filePath">
			<img
				:src="`http://localhost:3001${post.filePath}`"
				alt="Uploaded file"
				width="500"
			/>
		</div>
		<NuxtLink to="/dashboard">Назад к списку</NuxtLink>
	</div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'

const route = useRoute()
const { data: post, error } = await useFetch(
	() => `http://localhost:3001/api/posts/${route.params.id}`
)

if (error.value) {
	console.error('Ошибка при загрузке поста:', error.value)
}
</script>
