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
    addTriple(vocabPrefix, propertyName, value){
        const pair          = {propertyName, value}      
        pair.propertyName   = propertyName
        pair.value          = value
        this.vocabularies[vocabPrefix].pairs.push(pair)
    }
    getResourceToSend(){
        const vocabularies      = Object.values(this.vocabularies)
        const resToSend         = Object.assign({}, this)
        resToSend.vocabularies  = vocabularies
        return resToSend
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
    saveResource(resource){
      return this.post('/resources', resource)
    }
    /**
    * Realiza uma requisição GET para obter um resource por id
    * @param {Number | String} resourceId Id do resource
    * @returns {Promise} Promise da requisição
    */
    getResource(resourceId){
      return this.call(`/resources/${resourceId}`)
    }
  }