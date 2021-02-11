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
      this.ajaxCall('https://api.themoviedb.org/3/search/movie')
      .then((xhr) => {
        let dataObject = xhr.data;
        this.listaFilm = dataObject.results;
        this.voteFive(this.listaFilm);
        this.queryResult();
      });
    },

    searchSeries: function() {
      this.ajaxCall('https://api.themoviedb.org/3/search/tv')
      .then((xhr) => {
        let dataObject = xhr.data;
        this.listaSerie = dataObject.results;
        this.voteFive(this.listaSerie);
        this.queryResult();
      });
    },

    // restituisce l'esecuzione della chiamata axios
    ajaxCall: function(URL) {
      return axios.get(URL, {
        params: {
          api_key: '87afaf40f86102cb8e49027ba59c133d',
          query: this.query,
          language: 'it-IT',
        },
      });
    },

    /*restituisce nella struttura dell'oggetto le proprietà whiteStar e yellowStar
    utilizzate per il render delle stelline*/
    voteFive: function(lista) {
      let round;
      let whiteStar;
      let number_ws;
      lista.forEach((element) => {
        const {vote_average} = element;
        round = Math.round(element.vote_average / 2);
        element.yellowStar = round;
        whiteStars = this.maxVote - round;
        element.whiteStar = whiteStars;
      });
    },

    //flag per il render della lingua originale
    flagVisibility: function(index, lista) {
      const language = lista[index].original_language;
      if(this.lengFlagAv.includes(language)) {
        return true;
      } else {
        return false;
      }
    },

    //flag per il render della sinossi
    overview: function(index, lista) {
      const sinossi = lista[index].overview;
      let newSinossi;
      if(sinossi !== "") {
        return true;
      } else {
        return false;
      }
    },

    //restituisce il percorso dell'immagine per il render della bandiera della lingua
    flagLang: function(index, lista) {
      const flagImage = lista[index].original_language;
      const imageString = `image/${flagImage}.svg`;
      return imageString;
    },

    //restituisce il percorso file del'immagine di copertina
    imagePoster: function(index, lista) {
      const poster = lista[index].poster_path;
      let imageRender;
      if(poster == null) {
        imageRender = 'image/image-na.png';
      } else {
        imageRender = `https://image.tmdb.org/t/p/w342${poster}`;
      }
      return imageRender;
    },

    //restituisce la stringa in base alla corrispondenza di risultati con la query
    queryResult: function() {
      if(this.listaFilm.length > 0 || this.listaSerie.length > 0) {
        return this.resultFor = `Risultati per: ${this.query}`;
      } else {
        return this.resultFor = `Nessun risultato per: ${this.query}`;
      }
    }
  }// end methods
});//end vue app

Vue.config.devtools = true;
