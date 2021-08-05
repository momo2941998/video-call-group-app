import { configureStore } from "@reduxjs/toolkit";

// import reducers
import localStreamSlice from "../features/localStream/localStreamSlice";

const store = configureStore({
  reducer: {
    localStream: localStreamSlice
  }
})

export default store