import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    isLoggedIn: false,
    udnmember: null,
    um2: null,
    email: null,
  }),

  getters: {
    isAuthenticated: (state) => state.isLoggedIn,
    userId: (state) => state.udnmember,
  },

  actions: {
    setLoginStatus(status) {
      this.isLoggedIn = status;
    },

    setUserData({ udnmember, um2, email }) {
      this.udnmember = udnmember;
      this.um2 = um2;
      this.email = email;
    },

    clearUserData() {
      this.isLoggedIn = false;
      this.udnmember = null;
      this.um2 = null;
      this.email = null;
    },
  },
});
