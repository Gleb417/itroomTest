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

			<h2>Ваши посты</h2>
			<div v-if="postsLoading">Загрузка постов...</div>
			<div v-else-if="postsError">{{ postsError }}</div>
			<div v-else>
				<ul>
					<li v-for="post in posts" :key="post.id">
						{{ post.label }}
						<button @click="selectPost(post)">Редактировать</button>
					</li>
				</ul>
			</div>

			<!-- Форма редактирования поста -->
			<div v-if="selectedPost">
				<h2>Редактировать пост</h2>
				<form @submit.prevent="updatePost">
					<div>
						<label for="label">Заголовок</label>
						<input id="label" v-model="editedPost.label" type="text" required />
					</div>
					<div>
						<label for="text">Текст</label>
						<textarea id="text" v-model="editedPost.text" required></textarea>
					</div>
					<div>
						<label for="file">Файл</label>
						<input id="file" type="file" @change="handleFileChange" />
					</div>
					<button type="submit">Сохранить</button>
					<button @click="cancelEdit">Отмена</button>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import Navbar from '~/components/Navbar.vue'

// Состояние пользователя
const user = ref({})
const loading = ref(true)
const error = ref('')

// Состояние для постов
const posts = ref([])
const postsLoading = ref(true)
const postsError = ref('')

// Состояние для редактирования поста
const selectedPost = ref(null)
const editedPost = ref({
	label: '',
	text: '',
})
const file = ref(null)

const { accessToken } = useAuth()

// Получение данных пользователя
const fetchUserData = async () => {
	try {
		if (!accessToken.value) {
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

		user.value = await response.json()
	} catch (err) {
		error.value = 'Ошибка при загрузке данных пользователя: ' + err.message
	} finally {
		loading.value = false
	}
}

// Получение постов текущего пользователя
const fetchUserPosts = async () => {
	try {
		const response = await fetch('http://localhost:3001/api/posts', {
			headers: {
				Authorization: `Bearer ${accessToken.value}`,
			},
		})

		if (!response.ok) {
			throw new Error('Ошибка при загрузке постов: ' + (await response.text()))
		}

		posts.value = await response.json()
	} catch (err) {
		postsError.value = 'Ошибка при загрузке постов: ' + err.message
	} finally {
		postsLoading.value = false
	}
}

// Выбор поста для редактирования
const selectPost = post => {
	selectedPost.value = post
	editedPost.value = { ...post }
}

// Отмена редактирования
const cancelEdit = () => {
	selectedPost.value = null
}

// Обработка изменения файла
const handleFileChange = event => {
	file.value = event.target.files[0]
}

// Обновление поста
const updatePost = async () => {
	if (!selectedPost.value) return

	const formData = new FormData()
	formData.append('label', editedPost.value.label)
	formData.append('text', editedPost.value.text)
	if (file.value) formData.append('filePath', file.value)

	try {
		await $fetch(`http://localhost:3001/api/posts/${selectedPost.value.id}`, {
			method: 'PUT',
			body: formData,
			headers: {
				Authorization: `Bearer ${accessToken.value}`,
			},
		})
		alert('Пост успешно обновлен!')
		selectedPost.value = null
		await fetchUserPosts()
	} catch (err) {
		console.error('Ошибка при обновлении поста:', err)
	}
}

// Инициализация данных
onMounted(() => {
	fetchUserData()
	fetchUserPosts()
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

ul {
	list-style: none;
	padding: 0;
}

li {
	margin-bottom: 10px;
}

button {
	margin-left: 10px;
}
</style>
