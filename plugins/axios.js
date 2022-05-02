export default ({ $axios, $auth, app }) => {
  $axios.setBaseURL(process.env.NUXT_ENV_BACKEND_URL);
};
