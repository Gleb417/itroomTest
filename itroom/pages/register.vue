<template>
	<div>
		<Navbar />
		<h1>Регистрация</h1>
		<form @submit.prevent="register">
			<label>
				Имя пользователя:
				<input v-model="username" type="text" required />
			</label>
			<label>
				Ваш email:
				<input v-model="email" type="email" required />
			</label>
			<label>
				Пароль:
				<input v-model="password" type="password" required />
			</label>
			<button type="submit">Зарегистрироваться</button>
		</form>
		<p v-if="message" class="message">{{ message }}</p>
		<p v-if="error" class="error">{{ error }}</p>

		<p>Уже зарегистрированы? <NuxtLink to="/login">Войдите</NuxtLink>.</p>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const email = ref('')
const password = ref('')
const message = ref('')
const error = ref('')
const router = useRouter()

const register = async () => {
	try {
		const { message: successMessage } = await $fetch(
			'http://localhost:3001/api/users/register',
			{
				method: 'POST',
				body: {
					username: username.value,
					email: email.value,
					password: password.value,
				},
			}
		)
		message.value = successMessage
		// Переход на страницу логина
		setTimeout(() => router.push('/login'), 3000)
	} catch (err) {
		error.value = err?.response?._data?.message || 'Ошибка при регистрации'
	}
}
</script>

<style scoped>
.message {
	color: green;
	margin-top: 10px;
}
.error {
	color: red;
	margin-top: 10px;
}
</style>
