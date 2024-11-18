import { useCookie } from 'nuxt/app'

export function useAuth() {
	const accessToken = useCookie('access_token') // Храним токен доступа в Cookie

	// Устанавливаем токены
	const setTokens = (access, refresh) => {
		accessToken.value = access
		if (refresh) {
			localStorage.setItem('refresh_token', refresh) // Храним refresh токен в LocalStorage
		}
	}

	// Удаляем токены при выходе
	const logout = () => {
		accessToken.value = null
		localStorage.removeItem('refresh_token')
	}

	// Получаем refresh токен
	const getRefreshToken = () => localStorage.getItem('refresh_token')

	// Проверяем аутентификацию
	const isAuthenticated = () => !!accessToken.value

	// Обновляем токен доступа
	const refreshAccessToken = async () => {
		const refreshToken = getRefreshToken()
		if (!refreshToken) {
			throw new Error('Refresh токен отсутствует')
		}

		try {
			const { accessToken: newAccessToken } = await $fetch(
				'http://localhost:3001/api/users/refresh-token',
				{
					method: 'POST',
					body: { refreshToken },
				}
			)
			setTokens(newAccessToken, null) // Обновляем только access токен
		} catch (error) {
			console.error('Ошибка обновления токена:', error)
			logout() // Выходим, если токен не обновился
			throw error
		}
	}

	return {
		setTokens,
		logout,
		isAuthenticated,
		accessToken,
		getRefreshToken,
		refreshAccessToken,
	}
}
