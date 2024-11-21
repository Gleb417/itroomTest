<template>
	<div class="navbar_div"><Navbar /></div>
	<div class="contentMain">
		<h1>{{ post.label }}</h1>
		<p>Никнейм создателя поста: {{ post.user.username }}</p>
		<div class="imgPost" v-if="post.filePath">
			<img
				:src="`http://localhost:3001${post.filePath}`"
				alt="Uploaded file"
				width="100%"
			/>
		</div>
		<p>{{ post.text }}</p>

		<!-- Блок активности -->
		<div class="activities">
			<h2>Активности</h2>
			<div>
				<button @click="toggleLike">
					{{ liked ? 'Убрать лайк' : 'Поставить лайк' }}
				</button>
				<span>Всего лайков: {{ totalLikes }}</span>
			</div>
			<div>
				<h3>Комментарии</h3>

				<!-- Вывод комментариев -->
				<div>
					<!-- В корневом комментарии -->
					<div
						v-for="comment in rootComments"
						:key="comment.id"
						class="comment"
					>
						<p>
							<strong>{{ comment.user.username }}:</strong>
							{{ comment.content }}
						</p>
						<div>
							<button @click="toggleCommentLike(comment.id)">
								{{
									comment.likedByCurrentUser ? 'Убрать лайк' : 'Поставить лайк'
								}}
							</button>
							<span>Лайков: {{ comment.likesCount }}</span>
							<button @click="replyToComment(comment.id)">Ответить</button>
						</div>

						<!-- Для ответов -->
						<div v-if="comment.replies?.length" class="replies">
							<h4>Ответы:</h4>
							<div
								v-for="reply in comment.replies"
								:key="reply.id"
								class="reply"
							>
								<p>
									<strong>{{ reply.user.username }}:</strong>
									{{ reply.content }}
								</p>
								<div>
									<button @click="toggleCommentLike(reply.id)">
										{{
											reply.likedByCurrentUser
												? 'Убрать лайк'
												: 'Поставить лайк'
										}}
									</button>
									<span>Лайков: {{ reply.likesCount }}</span>
									<button @click="replyToComment(reply.id)">Ответить</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Форма для добавления нового комментария -->
				<div class="comment-form">
					<textarea
						v-model="newComment"
						placeholder="Написать комментарий"
					></textarea>
					<button @click="addComment">Добавить комментарий</button>
				</div>
			</div>
		</div>

		<NuxtLink to="/dashboard">Назад к списку</NuxtLink>
	</div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
import { ref, computed } from 'vue'

const route = useRoute()

const getCookie = name => {
	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) return parts.pop().split(';').shift()
	return null
}

// Пост
const { data: post, error } = await useFetch(
	() => `http://localhost:3001/api/posts/${route.params.id}`
)
if (error.value) {
	console.error('Ошибка при загрузке поста:', error.value)
}

// Список активностей
const activities = ref([]) // Активности поста
const liked = ref(false)
const totalLikes = ref(0) // Общее количество лайков
const newComment = ref('') // Новый комментарий

// Корневые комментарии
const rootComments = computed(() =>
	activities.value.filter(
		activity => activity.type === 'comment' && !activity.parentId
	)
)

// Группировка активностей по parentId
const groupReplies = activities => {
	const activityMap = {}

	// Создаем карту активностей
	activities.forEach(activity => {
		if (activity.type === 'comment' || activity.type === 'reply') {
			activityMap[activity.id] = {
				...activity,
				replies: [],
				likesCount: 0,
				likedByCurrentUser: false,
			}
		}
	})

	// Подсчитываем лайки
	activities.forEach(activity => {
		if (activity.type === 'comment-like' || activity.type === 'reply-like') {
			if (activityMap[activity.targetId]) {
				activityMap[activity.targetId].likesCount++
				if (activity.userId === post.value.user.id) {
					activityMap[activity.targetId].likedByCurrentUser = true
				}
			}
		}
	})

	// Добавляем ответы к родительским комментариям
	activities.forEach(activity => {
		if (activity.parentId && activityMap[activity.parentId]) {
			activityMap[activity.parentId].replies.push(activityMap[activity.id])
		}
	})

	// Возвращаем только корневые комментарии
	return Object.values(activityMap).filter(a => !a.parentId)
}

// Получение активностей
const fetchActivities = async () => {
	try {
		const token = getCookie('access_token')
		if (!token) {
			console.error('Токен отсутствует')
			return
		}

		const response = await $fetch(
			`http://localhost:3001/api/activities/${route.params.id}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)

		// Устанавливаем обработанные активности
		activities.value = groupReplies(response)

		// Обновляем количество лайков и статус лайка
		totalLikes.value = response.filter(a => a.type === 'like').length
		liked.value = !!response.find(
			a => a.type === 'like' && a.userId === post.value.user.id
		)
	} catch (err) {
		console.error('Ошибка при загрузке активностей:', err)
	}
}

// Лайк или удаление лайка
const toggleLike = async () => {
	const token = getCookie('access_token')
	if (!token) {
		console.error('Токен отсутствует')
		return
	}

	try {
		await $fetch('http://localhost:3001/api/activities', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ type: 'like', postId: route.params.id }),
		})
		await fetchActivities()
	} catch (err) {
		console.error('Ошибка при изменении лайка:', err)
	}
}

// Добавление комментария
const addComment = async () => {
	const token = getCookie('access_token')
	if (!token) {
		console.error('Токен отсутствует')
		return
	}

	if (!newComment.value.trim()) return

	try {
		await $fetch('http://localhost:3001/api/activities', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: 'comment',
				postId: route.params.id,
				content: newComment.value,
			}),
		})
		newComment.value = ''
		await fetchActivities()
	} catch (err) {
		console.error('Ошибка при добавлении комментария:', err)
	}
}

// Ответ на комментарий
const replyToComment = async parentId => {
	const token = getCookie('access_token')
	if (!token) {
		console.error('Токен отсутствует')
		return
	}

	const replyContent = prompt('Введите ваш ответ:')
	if (!replyContent?.trim()) return

	try {
		await $fetch('http://localhost:3001/api/activities', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: 'reply',
				postId: route.params.id,
				parentId,
				content: replyContent,
			}),
		})
		await fetchActivities()
	} catch (err) {
		console.error('Ошибка при добавлении ответа:', err)
	}
}

const toggleCommentLike = async commentId => {
	const token = getCookie('access_token')
	if (!token) {
		console.error('Токен отсутствует')
		return
	}

	try {
		await $fetch('http://localhost:3001/api/activities', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				type: 'like_comment', // Тип активности для лайка комментария
				postId: route.params.id, // Идентификатор поста
				parentId: commentId, // Используем commentId для лайка комментария
			}),
		})
		await fetchActivities() // Обновляем активности
	} catch (err) {
		console.error('Ошибка при изменении лайка для комментария:', err)
	}
}

fetchActivities()
</script>
