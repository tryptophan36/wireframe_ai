import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  svgCode_: localStorage.getItem("localSvgCode")||'Hello',
  htmlCode_: localStorage.getItem("localHtmlCode")||'',
}

const wireframeSlice = createSlice({
  name: 'wireframe',
  initialState,
  reducers: {
    setSvgCode_: (state, action) => {
      state.svgCode_ = action.payload
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