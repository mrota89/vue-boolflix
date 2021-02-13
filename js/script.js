new Vue({
  el: '#app',

  data: {
    flagDisplayCast: false,
    query:'',
    resultFor: '',
    listaDaMostrare: [],
    listaFilm: [],
    listaSerie: [],
    listaIdFilm: [],
    listaIdSerie: [],
    scelte: ['Film', 'Serie TV'],
    scelteIDX: 0,
    maxVote: 5,
    lengFlagAv: ['ja', 'de', 'en', 'es', 'fr', 'it', 'pt']
  },

  methods: {
    searchAll: function() {
      this.searchMovie();
      this.searchSeries();
      setTimeout(() => {
        this.query = "";
      }, 5000)
    },

    searchMovie: function() {
      this.ajaxCall('https://api.themoviedb.org/3/search/movie')
      .then((xhr) => {
        this.flagDisplayCast = false;
        let dataObject = xhr.data;
        this.listaIdFilm = [];
        this.listaFilm = dataObject.results;
        this.voteFive(this.listaFilm);
        this.changeTab(this.scelteIDX);
        this.IdElemFunction(this.listaFilm, this.listaIdFilm);
        this.actorCallsFilm();
        this.displayDelay();
        this.queryResult();
      });
    },

    searchSeries: function() {
      this.ajaxCall('https://api.themoviedb.org/3/search/tv')
      .then((xhr) => {
        this.flagDisplayCast = false;
        let dataObject = xhr.data;
        this.listaIdSerie = [];
        this.listaSerie = dataObject.results;
        this.voteFive(this.listaSerie);
        this.changeTab(this.scelteIDX);
        this.IdElemFunction(this.listaSerie, this.listaIdSerie);
        this.actorCallsSerie();
        this.displayDelay();
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

    /*restituisce nell'oggetto film una proprietà con valore un array con i nomi
    degli attori di quel film*/
    actorCallsFilm: function() {
      /*per ogni Id eseguo una chiamata ajax per ottenere i credits
      del film corrispondente*/
      this.listaIdFilm.forEach((element, index) => {
        let arrayAttori = [];
        axios.get(`https://api.themoviedb.org/3/movie/${element}/credits`, {
          params: {
            api_key: '87afaf40f86102cb8e49027ba59c133d',
            language: 'en-US',
          },
        }).then((xhr) => {
          //accedo alle informazioni sul cast
          let dataObject = xhr.data.cast;
          //in questo modo prendo solo i primi 5 attori (nel caso di un ampio cast)
          if(dataObject.length > 5) {
            dataObject.length = 5
          }
          //pusho in un array i nomi degli attori
          for (let i = 0; i < dataObject.length ; i++) {
           arrayAttori.push(dataObject[i].original_name);
          };
          //pusho nell'oggetto film il corrispondete array di attori
          this.listaFilm.forEach((film, indice) => {
            if(index === indice) {
              film.actors = arrayAttori;
            };
          });
        });//end then
      });//end listaIdFilm.ForEach
    },

    actorCallsSerie: function() {
      this.listaIdSerie.forEach((element, index) => {
        let arrayAttori = [];
        axios.get(`https://api.themoviedb.org/3/tv/${element}/credits`, {
          params: {
            api_key: '87afaf40f86102cb8e49027ba59c133d',
            language: 'en-US',
          },
        }).then((xhr) => {
          let dataObject = xhr.data.cast;
          if(dataObject.length > 5) {
            dataObject.length = 5
          }
          for (let i = 0; i < dataObject.length ; i++) {
            arrayAttori.push(dataObject[i].original_name);
          };
          this.listaSerie.forEach((serie, indice) => {
            if(index === indice) {
              serie.actors = arrayAttori;
            };
          });
        });//end then
      });//end listaIdSerie.ForEach
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

    //pusha in un array gli id di ogni film
    IdElemFunction: function(lista, listaId) {
      lista.forEach((element) => {
        const {id} = element;
        listaId.push(element.id)
      });
    },

    //ritorna la lista da renderizzare
    changeTab: function(indexClickedTab) {
      this.scelteIDX = indexClickedTab;
      if(this.scelteIDX == 0) {
        return this.listaDaMostrare = this.listaFilm;
      } else {
        return this.listaDaMostrare = this.listaSerie;
      }
    },

    //evidenzia la tab selezionata
    selectedTab: function(indexSelectedTab) {
      const selected = 'btn-menu-active';
      if (indexSelectedTab === this.scelteIDX) {
        return selected;
      }
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

    //restituisce il percorso file dell'immagine di copertina
    imagePoster: function(index, lista) {
      const poster = lista[index].poster_path;
      let imageRender;
      if(poster == null) {
        imageRender = 'image/image-na.png';
      } else {
        imageRender = `https://image.tmdb.org/t/p/w185${poster}`;
      }
      return imageRender;
    },

    //restituisce una stringa in base alla corrispondenza di risultati con la query
    queryResult: function() {
      if(this.listaFilm.length > 0 || this.listaSerie.length > 0) {
        return this.resultFor = `Risultati per: ${this.query}`;
      } else {
        return this.resultFor = `Nessun risultato per: ${this.query}`;
      }
    },

    /* flag che dopo 5 secondi mostra la sezione attori nella scheda film/serie,
    in modo da non rallentare il caricamento della pagina, dovuto alle molteplici chiamate ajax*/
    displayDelay: function() {
      setTimeout(() => {
        return this.flagDisplayCast = true;
      }, 5000)
    }
  }// end methods
});//end vue app

Vue.config.devtools = true;
