import { fixSvgCode } from '@/app/utils/helpers'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  svgCode_: 'Hello',
  htmlCode_: '',
}

const wireframeSlice = createSlice({
  name: 'wireframe',
  initialState,
  reducers: {
    setSvgCode_: (state, action) => {
      const cleanSvgCode= fixSvgCode(action.payload)
      console.log(cleanSvgCode)
      state.svgCode_ = cleanSvgCode
    },
    setHtmlCode_: (state, action) => {
      state.htmlCode_ = action.payload
    },
    resetWireframe: (state) => {
      state.svgCode_ = ''
      state.htmlCode_ = ''
    },
  },
})

export const { setSvgCode_, setHtmlCode_, resetWireframe } = wireframeSlice.actions
export default wireframeSlice.reducer