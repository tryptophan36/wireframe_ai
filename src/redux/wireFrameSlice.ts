import { fixSvgCode } from '@/app/utils/helpers'
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  svgCode_: 'Hello',
  htmlCode_: '',
  modificationImage_: null
}

const wireframeSlice = createSlice({
  name: 'wireframe',
  initialState,
  reducers: {
    setSvgCode_: (state, action) => {
      const cleanSvgCode= fixSvgCode(action.payload)
      state.svgCode_ = cleanSvgCode
    },
    setHtmlCode_: (state, action) => {
      state.htmlCode_ = action.payload
    },
    resetWireframe: (state) => {
      state.svgCode_ = ''
      state.htmlCode_ = ''
    },
    setModificationImage_:(state,action)=>{
      if (state.modificationImage_) {
        URL.revokeObjectURL(state.modificationImage_);
      }
      state.modificationImage_=action.payload
    }

  },
})

export const { setSvgCode_, setHtmlCode_, resetWireframe,setModificationImage_ } = wireframeSlice.actions
export default wireframeSlice.reducer