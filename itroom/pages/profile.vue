<template>
	<div>
		<Navbar />
		<h1>Профиль пользователя</h1>

		<div v-if="loading">Загрузка данных...</div>
		<div v-else-if="error">{{ error }}</div>
		<div v-else>
			<p><strong>Имя пользователя:</strong> {{ user.username }}</p>
			<p><strong>Email:</strong> {{ user.email }}</p>
			<p><strong>Статус:</strong> {{ user.status }}</p>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import Navbar from '~/components/Navbar.vue'

const user = ref({})
const loading = ref(true)
const error = ref('')
const { accessToken } = useAuth()
const router = useRouter()

// Функция для получения данных пользователя
const fetchUserData = async () => {
	try {
		if (!accessToken.value) {
			// Перенаправление на страницу входа, если нет токена
			router.push('/login')
			return
		}

		const response = await fetch('http://localhost:3001/api/users/profile', {
			headers: {
				Authorization: `Bearer ${accessToken.value}`,
			},
		})

		if (!response.ok) {
			throw new Error('Ошибка при загрузке данных: ' + (await response.text()))
		}

		const data = await response.json()
		user.value = data
	} catch (err) {
		error.value = 'Ошибка при загрузке данных пользователя: ' + err.message
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	fetchUserData()
})
</script>

<style scoped>
h1 {
	margin-bottom: 20px;
}

p {
	font-size: 18px;
	margin: 10px 0;
}
</style>
