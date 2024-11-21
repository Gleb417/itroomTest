import { useCookie } from 'nuxt/app'

export function useAuth() {
	// Используем Cookie для хранения access_token
	const accessTokenCookie = useCookie('access_token', { sameSite: 'strict' })

	// Ключ для хранения refresh_token в LocalStorage
	const refreshTokenKey = 'refresh_token'

	/**
	 * Устанавливает токены аутентификации.
	 * @param {string|null} access - Новый access_token.
	 * @param {string|null} refresh - Новый refresh_token.
	 */
	const setTokens = (access, refresh) => {
		if (access) accessTokenCookie.value = access // Сохраняем access_token в Cookie
		if (refresh) localStorage.setItem(refreshTokenKey, refresh) // Сохраняем refresh_token в LocalStorage
	}

	/**
	 * Удаляет токены при выходе из системы.
	 */
	const logout = () => {
		accessTokenCookie.value = null // Удаляем access_token из Cookie
		localStorage.removeItem(refreshTokenKey) // Удаляем refresh_token из LocalStorage
	}

	/**
	 * Возвращает refresh_token из LocalStorage.
	 * @returns {string|null} - Refresh токен.
	 */
	const getRefreshToken = () => localStorage.getItem(refreshTokenKey)

	/**
	 * Проверяет, аутентифицирован ли пользователь.
	 * @returns {boolean} - Статус аутентификации.
	 */
	const isAuthenticated = () => !!accessTokenCookie.value

	/**
	 * Обновляет access_token, используя refresh_token.
	 * @throws {Error} - Ошибка, если обновление не удалось.
	 */
	const refreshAccessToken = async () => {
		const refreshToken = getRefreshToken()
		if (!refreshToken) {
			throw new Error('Refresh токен отсутствует')
		}

		try {
			const response = await $fetch(
				'http://localhost:3001/api/users/refresh-token',
				{
					method: 'POST',
					body: { refreshToken },
				}
			)

			if (response?.accessToken) {
				setTokens(response.accessToken, null) // Обновляем только access_token
			} else {
				throw new Error('Ответ сервера не содержит нового токена')
			}
		} catch (error) {
			console.error('Ошибка обновления токена:', error)
			logout() // Удаляем токены, если обновление не удалось
			throw error
		}
	}

	/**
	 * Выполняет запрос с токеном и автоматическим обновлением access_token при необходимости.
	 * @param {string} url - URL запроса.
	 * @param {object} options - Параметры запроса.
	 * @returns {Promise<any>} - Ответ от сервера.
	 * @throws {Error} - Ошибка при выполнении запроса.
	 */
	const fetchWithAuth = async (url, options = {}) => {
		try {
			const response = await $fetch(url, {
				...options,
				headers: {
					Authorization: `Bearer ${accessTokenCookie.value}`, // Добавляем токен в заголовки
					...options.headers,
				},
			})
			return response
		} catch (error) {
			if (error.response?.status === 403) {
				// Если токен истек, обновляем и повторяем запрос
				try {
					await refreshAccessToken()
					return fetchWithAuth(url, options)
				} catch (refreshError) {
					console.error('Ошибка при повторной аутентификации:', refreshError)
					logout() // Удаляем токены при повторной ошибке
					throw error
				}
			}
			throw error // Пробрасываем остальные ошибки
		}
	}

	return {
		setTokens,
		logout,
		isAuthenticated,
		accessToken: accessTokenCookie,
		getRefreshToken,
		refreshAccessToken,
		fetchWithAuth,
	}
}
