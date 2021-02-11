new Vue({
  el: '#app',

  data: {
    query:'',
    resultFor: '',
    listaFilm: [],
    listaSerie: [],
    maxVote: 5,
    lengFlagAv: ['ar', 'cn', 'de', 'en','es', 'fr', 'it', 'ja', 'pt' ]
  },

  methods: {
    searchAll: function() {
      this.searchMovie();
      this.searchSeries();
    },

    searchMovie: function() {
      const self = this;
      axios
      .get(('https://api.themoviedb.org/3/search/movie'), {
        params: {
          api_key: '87afaf40f86102cb8e49027ba59c133d',
          query: self.query,
          language: 'it-IT'
        }
      })
      .then(function(xhr) {
        let dataObject = xhr.data;
        self.listaFilm = dataObject.results;
        self.voteFive(self.listaFilm);
        self.queryResult();
      });
    },

    searchSeries: function() {
      const self = this;
      axios
      .get(('https://api.themoviedb.org/3/search/tv'), {
        params: {
          api_key: '87afaf40f86102cb8e49027ba59c133d',
          query: self.query,
          language: 'it-IT'
        }
      })
      .then(function(xhr) {
        let dataObject = xhr.data;
        self.listaSerie = dataObject.results;
        self.voteFive(self.listaSerie);
        self.queryResult();
        self.query = "";
      });
    },

    voteFive: function(lista) {
      let round;
      let whiteStar;
      let number_ws;
      lista.forEach((element) => {
        const {vote_average} = element
        round = Math.round(element.vote_average / 2);
        element.number_yellowstar = round;
        whiteStars = this.maxVote - round;
        element.number_whitestar = whiteStars;
      });
    },

    flagLang: function(index, lista) {
      const flagImage = lista[index].original_language;
      const imageString = `image/${flagImage}.svg`;
      return imageString;
    },

    flagVisibility: function(index, lista) {
      const language = lista[index].original_language;
      if(this.lengFlagAv.includes(language)) {
        return true;
      } else {
        return false;
      }
    },

    overview: function(index, lista) {
      const sinossi = lista[index].overview;
      let newSinossi;
      if(sinossi !== "") {
        return true;
      } else {
        return false;
      }
    },

    imagePoster: function(index, lista) {
      const poster = lista[index].poster_path;
      let imageRender;
      if(poster == null) {
        imageRender = 'image/image-na.png'
      } else {
        imageRender = `https://image.tmdb.org/t/p/w342${poster}`;
      }
      return imageRender;
    },

    queryResult: function() {
      if(this.listaFilm.length > 0 || this.listaSerie.length > 0) {
        return this.resultFor = `Risultati per: ${this.query}`;
      } else {
        return this.resultFor = `Nessun risultato per: ${this.query}`;
      }
    }
  }
})

Vue.config.devtools = true;
