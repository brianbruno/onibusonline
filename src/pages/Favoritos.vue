<template>
  <q-page class="flex flex-center">
    TESTE
  </q-page>
</template>

<script>
export default {
  name: 'PageFavoritos',
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
      buscandoPrevisoes: false,
      card: false,
      paradaInfo: {
        nome: '',
        numero: '',
        distancia: '',
        previsoes: []
      },
      stars: 3,
      LeafIcon: null
    }
  },
  created () {},
  methods: {}
}

</script>
