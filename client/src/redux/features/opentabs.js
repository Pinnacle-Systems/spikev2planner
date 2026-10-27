import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tabs: [{ name: "Home", active: true }],
};

export const openTabs = createSlice({
  name: "openTabs",
  initialState,
  reducers: {
    push: (state, action) => {
      const existingIndex = state.tabs.findIndex(
        (item) => item.name === action.payload.name
      );

      state.tabs = state.tabs.map((tab) => {
        return { ...tab, active: false };
      });

      if (existingIndex >= 0) {
        state.tabs[existingIndex] = {
          ...state.tabs[existingIndex],
          ...action.payload,
          active: true,
        };
      } else {
        state.tabs.push({
          ...action.payload,
          active: true,
        });
      }
    },
    remove: (state, action) => {
      if (action.payload.name?.toUpperCase() === "HOME") {
        return;
      }
      const existingIndex = state.tabs.findIndex(
        (item) => item.name === action.payload.name
      );
      if (state.tabs[existingIndex]?.active) {
        if (state.tabs.length > 1) {
          state.tabs = state.tabs.map((tab) => {
            return { ...tab, active: false };
          });
          if (existingIndex === state.tabs.length - 1) {
            state.tabs[existingIndex - 1] = {
              ...state.tabs[existingIndex - 1],
              active: true,
            };
          } else {
            state.tabs[existingIndex + 1] = {
              ...state.tabs[existingIndex + 1],
              active: true,
            };
          }
        }
      }
      state.tabs = state.tabs.filter(tab => tab.name !== action.payload.name);
      if (!state.tabs.some(tab => tab.name.toUpperCase() === "HOME")) {
        state.tabs.unshift({ name: "Home", active: state.tabs.length === 0 });
      }
    },
    clearAll: (state) => {
      const homeTab = state.tabs.find(
        (tab) => tab.name?.toUpperCase() === "HOME"
      );
      if (homeTab) {
        state.tabs = [{ ...homeTab, active: true }];
      } else {
        state.tabs = [{ name: "Home", active: true }];
      }
    },
  },
});

export const { push, remove, clearAll } = openTabs.actions;

export default openTabs.reducer;
