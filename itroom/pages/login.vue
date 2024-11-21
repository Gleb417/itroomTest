<template>
	<div class="navbar_div"><Navbar /></div>
	<div class="contentMain">
		<h1>Вход</h1>
		<form @submit.prevent="login">
			<label>
				Имя пользователя:
				<input v-model="username" type="text" required />
			</label>
			<label>
				Пароль:
				<input v-model="password" type="password" required />
			</label>
			<button type="submit">Войти</button>
		</form>
		<p v-if="error" class="error">{{ error }}</p>
		<NuxtLink to="/register"><button>Зарегистрироваться</button></NuxtLink>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const { setTokens } = useAuth()

const login = async () => {
	try {
		const { accessToken, refreshToken } = await $fetch(
			'http://localhost:3001/api/users/login',
			{
				method: 'POST',
				body: { username: username.value, password: password.value },
			}
		)
		setTokens(accessToken, refreshToken)
		router.push('/dashboard')
	} catch (err) {
		error.value = err?.response?._data?.message || 'Ошибка при входе'
	}
}
</script>

<style scoped>
.error {
	color: red;
	margin-top: 10px;
}
</style>
