<template>
  <q-page class="flex flex-center">
    <div class="row">
      <div id="mapid" style="width: 49vh; height: 60vh;"></div>
    </div>

  </q-page>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PageIndex',
  data () {
    return {
      location: null,
      gettingLocation: false,
      errorStr: null
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
      let mymap = L.map('mapid').setView([self.location.coords.latitude, this.location.coords.longitude], 16)
      self.buscarPontos()

      // eslint-disable-next-line no-undef
      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11'
      }).addTo(mymap)

      // eslint-disable-next-line no-undef
      L.marker([51.5, -0.09]).addTo(mymap)
    },
    buscarPontos: function () {
      const self = this
      const lat = self.location.coords.latitude
      const lon = this.location.coords.longitude

      axios.post('https://wd89y2nqbe.execute-api.us-east-2.amazonaws.com/prod/pontos/proximos', {
        lat: lat.toString(),
        lon: lon.toString()
      })
        .then(function (response) {
          console.log(response)
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
