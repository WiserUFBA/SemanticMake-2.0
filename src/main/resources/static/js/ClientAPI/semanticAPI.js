class Resource {
  constructor(name, prefix, uri){
      this.vocabularies   = {}
      this.name           = name
      this.prefix         = prefix
      this.about          = uri
  }
  addVocabulary(vocabPrefix, uri){
      const vocab                    = new Vocabulary (vocabPrefix, uri)
      vocab.prefix                   = vocabPrefix
      vocab.uri                      = uri
      this.vocabularies[vocabPrefix] = vocab
  }    
  addTriple(vocabPrefix, propertyName, value, asResource, subPropertyOf){
    if (subPropertyOf === '' ||subPropertyOf === null || subPropertyOf === undefined){
      const propery = { propertyName, value, asResource, subPropertyOf: '' }
      this.vocabularies[vocabPrefix].pairs.push(propery)
    } else {
      const property = { propertyName: subPropertyOf, value: '', asResource: true, subPropertyOf: '' }
      this.vocabularies[vocabPrefix].pairs.push(property)
      const subproperty = { propertyName, value, asResource, subPropertyOf }
      this.vocabularies[vocabPrefix].pairs.push(subproperty)
    }      
  }
  getResourceToSend(){
      const vocabularies      = Object.values(this.vocabularies)
      const resToSend         = Object.assign({}, this)
      resToSend.vocabularies  = vocabularies
      return resToSend
  }
  addLanguage(language) {
      if(this.vocabularyDcterms() === null){
        const vocab = { prefix: 'dcterms', uri: 'http://purl.org/dc/terms/', pairs: [] }
        this.vocabularies['dcterms'] = vocab 
      }
      const lang = { propertyName: 'language', value: language, asResource: false, subPropertyOf:'' }
      this.vocabularies['dcterms'].pairs.push(lang)

    }
  vocabularyDcterms(){
      for (let vocabulary of Object.values(this.vocabularies))
      if (vocabulary.prefix === "dcterms")
        return vocabulary.prefix;
    return null;
  }
  addCoordinatesDateTime(){
      if(this.vocabularySchema() === null){
        const vocab = { prefix: 'schema', uri: 'http://schema.org', pairs: [] }
        this.vocabularies['schema'] = vocab 
      }
      if(this.vocabularyIcal() === null){
        const vocab = { prefix: 'ical', uri: 'http://www.w3.org/2002/12/cal/ical#', pairs: [] }
        this.vocabularies['ical'] = vocab 
      }
      
      const locale = { propertyName: 'geocoordinates', value: '', asResource: true, subPropertyOf:'' }
      this.vocabularies['schema'].pairs.push(locale)
      const position = this.getPosition()
      const latitude = { propertyName: 'latitude', value: position.latitude, asResource: false, subPropertyOf:'geocoordinates' }
      this.vocabularies['schema'].pairs.push(latitude)
      const longitude = { propertyName: 'longitude', value: position.longitude, asResource: false, subPropertyOf:'geocoordinates' }
      this.vocabularies['schema'].pairs.push(longitude)
      
      const now = new Date()
      const dateTimeCreated = `${now.getFullYear()}/${now.getMonth()}/${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
      const created = { propertyName: 'created', value: dateTimeCreated, asResource: false, subPropertyOf:'' }
      this.vocabularies['ical'].pairs.push(created)
    }
    vocabularySchema(){
      for (let vocabulary of Object.values(this.vocabularies))
        if (vocabulary.prefix === "schema")
          return vocabulary.prefix;
      return null;
    }
    vocabularyIcal(){
      for (let vocabulary of Object.values(this.vocabularies))
        if (vocabulary.prefix === "ical")
          return vocabulary.prefix;
      return null;
    }
    getPosition(){
      // Verifica se o browser do usuario tem suporte a geolocation
      const p = {
        latitude: '',
        longitude: ''
      }
      if ( navigator.geolocation ){
          navigator.geolocation.getCurrentPosition( 
            function( position ){
              p.latitude  = position.coords.latitude
              p.longitude = position.coords.longitude  
            }
          );
      }
      return p
    }    
      
}

class Vocabulary{
    constructor(prefix,uri){
        this.pairs  = []
        this.prefix = prefix
        this.uri    = uri
    }
}

class SemanticAPI{
    /**
    * @param {Object} config Contém as configurações necessárias para o funcionamento da api e que
    * serão reutilizadas nos métodos internos. nesse exemplo só tem uma configuração obrigatória (baseURL)
    * @return {SemanticAPI} Uma nova instancia da api
    */
    constructor(config){
      if (!config || !config.baseURL) {
        throw Error('baseURL nao foi informada')
      }
      this.config = config
      // parametros comuns de todas as requisições
      // poderia ser passado no config tb
      this.defaultParams = {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    }
    /**
    * Abstrai o fetch global, concatenando a baseURL às URLs de endpoint
    * @param {String} endpoint URL parcial do endpoint q será invocado
    * @param {Object} params Configurações da requisição (headers, data, method, etc)
    * @return {Promise} Promise da requisição
    */
    call(endpoint, params){
      if (endpoint.startsWith('/')) {
        //Begin the extraction at position 1, and extract the rest of the string:
        endpoint = endpoint.substring(1) 
      }
      if (this.config.baseURL.endsWith('/')){
        this.config.baseURL = this.config.baseURL.substring(0, (this.config.baseURL.length - 1))
      }
      return fetch(`${this.config.baseURL}/${endpoint}`, Object.assign({}, this.defaultParams, params))
        .then(response => {
          return response.json()
        })
    }
    /**
    * Reutiliza o fetch inteno para fazer uma requisição POST
    * @param {String} endpoint URL parcial do endpoint q será invocado
    * @param {Object} body Objeto q será serializado e enviado como corpo da requisição
    * @return {Promise} Promise da requisição
    */
    post(endpoint, body){
      return this.call(endpoint, { 
        method: 'POST',
        body: JSON.stringify(body)
      })
    }
    /**
    * Realiza uma requisção POST para salvar um resource
    * @param {Object} resource Objeto representando um resource q será enviado como corpo da requisição
    * @return {Promise} Promise da requisição
    */
    saveResource(resource, workspace){
      const resourceToSend = resource.getResourceToSend()
      return this.post(`/resources/${workspace}`, resourceToSend)
    }
    /**
    * Realiza uma requisição GET para obter um resource por id
    * @param {Number | String} resourceId Id do resource
    * @returns {Promise} Promise da requisição
    */
    getResource(workspace, resourceId){
      return this.call(`/resources/${workspace}/${resourceId}`)
    }

    deleteResource(workspace, resourceURI){
      resourceId = substring(resourceURI,7)
      return this.call(`/resources/deleteResource/${workspace}/${resourceId}`, {method: 'DELETE'})
    }

    deleteGraph(workspace){
      return this.call(`/resources/deleteGraph/${workspace}`, {method: 'DELETE'})
    }
   
  }