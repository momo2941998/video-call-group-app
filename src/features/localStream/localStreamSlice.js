import { createSlice } from "@reduxjs/toolkit";

export const localStreamSlice = createSlice({
  name: 'localStream',
  initialState: {
    value: {
      videoTrackID: '',
      videoTrackEnabled: true,
      audioTrackID: '',
      audioTrackEnabled: true
    }
  },
  reducers: {
    setVideoTrackID: (state, action) => {
      state.value.videoTrackID = action.payload
    },
    setAudioTrackID: (state, action) => {
      state.value.audioTrackID = action.payload
    },
    setVideoTrackEnabled: (state, action) => {
      state.value.videoTrackEnabled = action.payload
    },
    setAudioTrackEnabled: (state, action) => {
      state.value.audioTrackEnabled = action.payload
    },
    toggleVideoTrackEnabled: (state) => {
      state.value.videoTrackEnabled = !state.value.videoTrackEnabled
    },
    toggleAudioTrackEnabled: (state) => {
      state.value.audioTrackEnabled = !state.value.audioTrackEnabled
    },
  }
})

export const { 
  setVideoTrackID, 
  setAudioTrackID,
  setVideoTrackEnabled,
  setAudioTrackEnabled,
  toggleVideoTrackEnabled,
  toggleAudioTrackEnabled
} = localStreamSlice.actions

export default localStreamSlice.reducer