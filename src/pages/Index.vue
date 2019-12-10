<template>
  <q-page class="flex flex-center">
    <!-- SOMENTE É EXIBIDO QUANDO O ESTADO É IGUAL A INICIO  -->
    <div id="mapid" style="width: 49vh; height: 60vh;"></div>
    <div class="row" v-if="estadoDaAplicacao === 'mapa'">

    </div>

    <!-- SOMENTE É EXIBIDO QUANDO O ESTADO DA APLICAÇÃO É BUSCANDO -->
    <div v-if="estadoDaAplicacao === 'buscando'">
      <h5>Buscando pontos próximos a sua localização...</h5>
    </div>

    <div v-if="estadoDaAplicacao === 'selecionado'">
      <div v-if="textoParada">
        Parada: {{ textoParada }}
      </div>
      <ul>
        Status da previsão: {{ mensagemPrevisao }}
        <li v-bind:key="previsao.sgLin" v-for="previsao in previsoes">
          {{ previsao.sgLin }} - {{ previsao.apelidoLinha}}
          {{ previsao.prev }}
        </li>
      </ul>
    </div>
  </q-page>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PageIndex',
  data () {
    return {
      estadoDaAplicacao: 'mapa',
      location: null,
      gettingLocation: false,
      errorStr: null,
      objetoParada: {},
      paradas: [],
      previsoes: [],
      lib: null,
      mapa: null,
      textoParada: '',
      mensagemPrevisao: 'buscando...'
    }
  },
  created () {
    const self = this
    // do we support geolocation
    if (!('geolocation' in navigator)) {
      this.errorStr = 'Geolocation is not available.'
      return
    }

    this.gettingLocation = true
    // get position
    navigator.geolocation.getCurrentPosition(pos => {
      this.gettingLocation = false
      this.location = pos
      self.configurarMapa()
    }, err => {
      this.gettingLocation = false
      this.errorStr = err.message
      alert(this.errorStr)
    })
  },
  methods: {
    configurarMapa () {
      const self = this
      // eslint-disable-next-line no-undef
      self.mapa = L.map('mapid').setView([self.location.coords.latitude, this.location.coords.longitude], 16)
      self.buscarPontos()

      // eslint-disable-next-line no-undef
      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11'
      }).addTo(self.mapa)
    },
    buscarPontos: function () {
      const self = this
      const lat = self.location.coords.latitude
      const lon = this.location.coords.longitude

      self.estadoDaAplicacao = 'buscando'

      axios.get('https://bhonibus.brian.place/pontos/proximos/' + lat + '/' + lon)
        .then(function (response) {
          console.log(response)
          self.estadoDaAplicacao = 'mapa'
          if (response.data.errorMessage) {
            self.buscarPontos()
          } else {
            self.paradas = response.data.paradas
            self.plotarParadas()
          }
        })
        .catch(function (error) {
          console.log(error)
          self.estadoDaAplicacao = 'mapa'
        })
        .finally(function () {
          // always executed
        })
    },
    plotarParadas: function () {
      const self = this
      self.paradas.forEach((coord) => {
        self.objetoParada[coord.x + '#' + coord.y] = coord
        // eslint-disable-next-line no-undef
        L.marker([coord.y, coord.x]).addTo(self.mapa).on('click', function (e) {
          self.informacaoParada(e)
        })
      })
    },
    informacaoParada: function (e) {
      const self = this
      const concat = e.latlng.lng + '#' + e.latlng.lat
      self.textoParada = self.objetoParada[concat].desc
      self.estadoDaAplicacao = 'selecionado'

      axios.post('https://wd89y2nqbe.execute-api.us-east-2.amazonaws.com/prod/pontos/previsao', {
        codPonto: self.objetoParada[concat].cod.toString()
      })
        .then(function (response) {
          self.previsoes = response.data.previsoes
          self.mensagemPrevisao = response.data.mensagem
        })
        .catch(function (error) {
          console.log(error)
        })
        .finally(function () {
          // always executed
        })
    }
  }
}

</script>
