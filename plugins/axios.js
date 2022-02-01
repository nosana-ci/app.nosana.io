export default ({ $axios, $auth, app }) => {
  $axios.setBaseURL(process.env.backendUrl)
}
