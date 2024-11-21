<template>
	<div>
		<Navbar />
		<h1>Создать пост</h1>
		<form @submit.prevent="handleSubmit">
			<div>
				<label for="label">Заголовок:</label>
				<input v-model="form.label" id="label" type="text" required />
			</div>
			<div>
				<label for="text">Текст поста:</label>
				<textarea v-model="form.text" id="text" required></textarea>
			</div>
			<div>
				<label for="file">Изображение:</label>
				<input
					@change="handleFileUpload"
					id="file"
					type="file"
					accept=".jpg, .jpeg, .png"
				/>
			</div>
			<button type="submit">Создать</button>
		</form>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { accessToken } = useAuth()

const form = ref({
	label: '',
	text: '',
	file: null,
})

const handleFileUpload = event => {
	form.value.file = event.target.files[0]
}

const handleSubmit = async () => {
	const formData = new FormData()
	formData.append('label', form.value.label)
	formData.append('text', form.value.text)
	if (form.value.file) {
		formData.append('filePath', form.value.file)
	}

	try {
		const response = await fetch('http://localhost:3001/api/posts', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken.value}`,
			},
			body: formData,
		})

		if (response.ok) {
			router.push('/profile') // Возвращаемся на главную страницу после успешного создания поста
		} else {
			const errorData = await response.json()
			console.error('Ошибка при создании поста:', errorData.message)
			alert(errorData.message || 'Ошибка при создании поста')
		}
	} catch (error) {
		console.error('Ошибка:', error)
		alert('Ошибка при подключении к серверу')
	}
}
</script>
