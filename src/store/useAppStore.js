import { create } from 'zustand'
import { supabase } from '../api/supabase.js'

const NICK_KEY = 'jeju-myth-nickname'

export const useAppStore = create((set, get) => ({
  // 닉네임: 새로고침해도 유지
  nickname: localStorage.getItem(NICK_KEY) || '',
  setNickname: (nickname) => {
    localStorage.setItem(NICK_KEY, nickname)
    set({ nickname })
    get().loadFavorites()
    get().loadChat()
  },

  // 알림
  toast: '',
  notify: (toast) => {
    set({ toast })
    setTimeout(() => set({ toast: '' }), 2500)
  },

  // 즐겨찾기 (Supabase)
  favorites: [],
  loadFavorites: async () => {
    const { nickname } = get()
    if (!nickname) return set({ favorites: [] })
    const { data, error } = await supabase.from('favorites').select('*').eq('nickname', nickname).order('created_at', { ascending: false })
    if (error) return get().notify('즐겨찾기 불러오기 실패: ' + error.message)
    set({ favorites: data })
  },
  addFavorite: async ({ kind, title, detail }) => {
    const { nickname } = get()
    if (!nickname) return get().notify('먼저 닉네임을 입력하세요')
    const { error } = await supabase.from('favorites').insert({ nickname, kind, title, detail })
    if (error) return get().notify('저장 실패: ' + error.message)
    get().notify('즐겨찾기에 저장했어요')
    get().loadFavorites()
  },
  removeFavorite: async (id) => {
    await supabase.from('favorites').delete().eq('id', id)
    get().loadFavorites()
  },

  // 에이전트 대화 (Supabase에 저장)
  messages: [],
  loadChat: async () => {
    const { nickname } = get()
    if (!nickname) return set({ messages: [] })
    const { data } = await supabase.from('chats').select('*').eq('nickname', nickname).order('id')
    set({ messages: data || [] })
  },
  saveMessage: async (m) => {
    set((s) => ({ messages: [...s.messages, m] }))
    const { nickname } = get()
    if (nickname) await supabase.from('chats').insert({ nickname, role: m.role, content: m.content, tools: m.tools || null })
  },
}))
