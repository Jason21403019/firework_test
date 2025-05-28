import { defineNuxtPlugin } from "#app";
import Container from "~/components/Container.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("Container", Container);
});
