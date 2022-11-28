export default {
  namespaced: true,
  modules: {},
  mutations: {
    SET_TOKEN (state, value) {
      state.token = value;
    }
  },
  actions: {
    addToken ({ commit }, token) {
      if (token) {
        commit('SET_TOKEN', token);
      }
    }
  },
  state: () => ({
    token: null
  })
};
