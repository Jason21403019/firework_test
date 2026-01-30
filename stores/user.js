import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    udnland: null,
    udngold: null,
    email: null,
  }),

  getters: {
    isAuthenticated: (state) => state.isLoggedIn,
    userId: (state) => state.udnland,
  },

  actions: {
    setLoginStatus(status) {
      this.isLoggedIn = status;
    },

    setUserData({ udnland, udngold, email }) {
      this.udnland = udnland;
      this.udngold = udngold;
      this.email = email;
    },

    clearUserData() {
      this.isLoggedIn = false;
      this.udnland = null;
      this.udngold = null;
      this.email = null;
    },
  },
});
