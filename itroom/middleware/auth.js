import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware(async to => {
	const { isAuthenticated, refreshAccessToken } = useAuth()

	// Если пользователь не аутентифицирован и переходит на защищённый маршрут
	if (!isAuthenticated() && !['/login', '/register'].includes(to.path)) {
		// Попробуем обновить токен
		try {
			await refreshAccessToken()
		} catch (error) {
			return navigateTo('/login') // Перенаправляем на логин, если токены недействительны
		}
	}

	// Если после попытки обновления токенов пользователь всё ещё не аутентифицирован
	if (!isAuthenticated() && !['/login', '/register'].includes(to.path)) {
		return navigateTo('/login')
	}
})
