<template>
	<div class="navbar_div"><Navbar /></div>
	<div class="contentMain">
		<h1>Список постов</h1>
		<ul>
			<li v-for="post in posts" :key="post.id">
				<NuxtLink :to="`/post/${post.id}`">{{ post.label }}</NuxtLink>
			</li>
		</ul>
	</div>
	<div class="contentMain">
		<h1>Создайте пост!</h1>
		<button @click="goToCreatePost">Создать пост</button>
	</div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import Navbar from '~/components/Navbar.vue'

const router = useRouter()

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
const goToCreatePost = () => {
	router.push('/post/create-post') // Перенаправляем на страницу создания постов
}
</script>
