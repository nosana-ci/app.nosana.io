export default {
  namespaced: true,
  modules: {},
  mutations: {
    SET_TOKEN (state, value) {
      state.token = value;
    },
    SET_SIGNATURE (state, value) {
      state.logSignature = value;
    }
  },
  actions: {
    addToken ({ commit }, token) {
      if (token) {
        commit('SET_TOKEN', token);
      }
    },
    addLogSignature ({ commit }, signature) {
      if (signature) {
        commit('SET_SIGNATURE', signature);
      }
    }
  },
  state: () => ({
    token: null,
    logSignature: null
  })
};
