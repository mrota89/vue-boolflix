new Vue({
  el: '#app',

  data: {
    query:'',
    resultFor: '',
    listaFilm: []
  },

  methods: {
    cercaFilm: function() {
      const self = this;
      axios
      .get(`https://api.themoviedb.org/3/search/movie?api_key=87afaf40f86102cb8e49027ba59c133d&query=${self.query}`)
      .then(function(xhr) {
        let dataObject = xhr.data;
        self.listaFilm = dataObject.results;
        self.resultFor = `risultati per: ${self.query}`
        self.query = "";
      })
    }
  }
})

Vue.config.devtools = true;
