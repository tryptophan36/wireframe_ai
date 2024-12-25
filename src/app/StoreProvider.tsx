'use client'
import React from 'react'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../redux/store'
import { useEffect } from 'react'

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>(undefined)
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }


  useEffect(() => {
    const store = storeRef.current
    if (store && typeof window !== 'undefined') {
      // Initialize from localStorage
      const savedSvgCode = localStorage.getItem('localSvgCode') || 'Hello'
      const savedHtmlCode = localStorage.getItem('localHtmlCode') || ''
      store.dispatch({ 
        type: 'wireframe/setSvgCode_', 
        payload: savedSvgCode 
      })
      store.dispatch({ 
        type: 'wireframe/setHtmlCode_', 
        payload: savedHtmlCode 
      })
    }
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
} 