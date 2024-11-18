<template>
	<nav class="navbar">
		<ul>
			<li>
				<NuxtLink to="/dashboard">Список постов</NuxtLink>
			</li>
			<li>
				<NuxtLink to="/profile">Профиль</NuxtLink>
			</li>
			<li v-if="isAuthenticated">
				<button @click="logoutUser">Выйти</button>
			</li>
		</ul>
	</nav>
</template>

<script setup>
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

const { logout, isAuthenticated } = useAuth()
const router = useRouter()

const logoutUser = () => {
	logout()
	router.push('/login')
}
</script>
