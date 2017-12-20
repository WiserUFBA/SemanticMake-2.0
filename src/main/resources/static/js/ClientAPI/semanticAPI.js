class Resource {
  
  constructor(name, prefix, uri){
      this.vocabularies   = {}
      this.name           = name
      this.prefix         = prefix
      this.about          = uri
  }
  setName(name){
    this.name = name
  }

  setPrefix(prefix){
    this.prefix = prefix
  }

  setAbout(uri){
    this.about = uri
  }

  setVocabularies(vocabularies){
    this.vocabularies
  }

  addVocabulary(vocabPrefix, uri){
      const vocab                    = new Vocabulary(vocabPrefix, uri)
      if(!this.vocabExists(vocabPrefix, this.vocabularies))
        this.vocabularies[vocabPrefix] = vocab
  }

  vocabExists(vocabPrefix, vocabularies){
    if(vocabularies[vocabPrefix] === undefined || vocabularies[vocabPrefix === null])
        return false
    return true
  }

  addProperty(vocabPrefix, property){
    const propName      = property.propertyName
    const value         = property.value
    const asResource    = property.asResource
    const subPropertyOf = property.subPropertyOf

    if (subPropertyOf === '' || subPropertyOf === null || subPropertyOf === undefined){
      const property = { propertyName: propName, value: value, asResource: asResource, subPropertyOf: '' }
      this.vocabularies[vocabPrefix].pairs.push(property)
    } else {
      if (!this.propertyExists(vocabPrefix, subPropertyOf)){
        const property = { propertyName: subPropertyOf, value: '', asResource: true, subPropertyOf: '' }
        this.vocabularies[vocabPrefix].pairs.push(property)
      }
      const subproperty = { propertyName: propName, value: value, asResource: asResource, subPropertyOf: subPropertyOf }
      this.vocabularies[vocabPrefix].pairs.push(subproperty)
    }    
  }

  propertyExists(vocabPrefix, subPropertyOf){
    for (let pair of this.vocabularies[vocabPrefix].pairs){
      if(pair.propertyName === subPropertyOf)
        return true
    }
    return false
  }

  getResourceToSend(){
      const vocabularies      = Object.values(this.vocabularies)
      const resToSend         = Object.assign({}, this)
      resToSend.vocabularies  = vocabularies
      return resToSend
  }

  addLanguage(language) {
      if(!this.vocabularyDctermsExists()){
        const vocab = new Vocabulary('dcterms', 'http://purl.org/dc/terms/')
        this.vocabularies['dcterms'] = vocab 
      }
      const lang = { propertyName: 'language', value: language, asResource: false, subPropertyOf:'' }
      this.vocabularies['dcterms'].pairs.push(lang)
  }

  addCoordinatesDateTime(){
      if(!this.vocabularySchemaExists()){
        const vocab = new Vocabulary('schema', 'http://schema.org') 
        this.vocabularies['schema'] = vocab 
      }
      if(!this.vocabularyIcalExists()){
        const vocab = new Vocabulary('ical', 'http://www.w3.org/2002/12/cal/ical#')
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

    vocabularyDctermsExists(){
      for (let vocabulary of Object.values(this.vocabularies))
      if (vocabulary.prefix === "dcterms")
        return true
      return false;
    }

    vocabularySchemaExists(){
      for (let vocabulary of Object.values(this.vocabularies))
        if (vocabulary.prefix === "schema")
          return true;
      return false;
    }

    vocabularyIcalExists(){
      for (let vocabulary of Object.values(this.vocabularies))
        if (vocabulary.prefix === "ical")
          return true;
      return false;
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

class Property {
  
  constructor(propertyName, value, asResource, subPropertyOf){
    this.propertyName   = propertyName
    this.value          = value
    this.asResource     = asResource
    this.subPropertyOf  = subPropertyOf
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
      if (!config.workspace){
        throw Error('O workspace não foi informado')
      }
      this.config = config
      // Parâmetros comuns de todas as requisições
      // Poderia ser passado no config também
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
      .then( response => response.json() )
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
     * @param {Object} resource Objeto representando um resource, de seu respectivo workspace, que será enviado como corpo da requisição
     */
    saveResource(resource){
      const resourceToSend = resource.getResourceToSend()
      return this.post(`/resources/saveResource/${this.config.workspace}`, resourceToSend)
    }

    /**
     * Função para deletar workspace que foi previamente configurado
     */
    deleteGraph(){
      return this.call(`/resources/deleteGraph/${this.config.workspace}`, {method: 'DELETE'})
    }
    
    /**
    * Função para deletar recurso 
    * @param {String} resourceURI URI do recurso, de seu respectivo workspace, que será deletado
    */
    deleteResource(resourceURI){
      resourceURI  = encodeURIComponent(resourceURI);
      return this.call(`/resources/deleteResource/${this.config.workspace}?resourceId=${resourceURI}`, {method: 'DELETE'})
    }
    
    /**
     * Função para deletar uma propriedade de um recurso
     * @param {*} resourceId Id (URI) do recurso com a propriedade a ser deletada
     * @param {*} propertyUri URI da propriedade a ser deletada
     */
    deleteProperty(resourceId, propertyUri){
      resourceId  = encodeURIComponent(resourceId)
      propertyUri = encodeURIComponent(propertyUri)
      return this.call(`/resources/deleteProperty/${this.config.workspace}?resourceId=${resourceId}&propertyUri=${propertyUri}`, {method: 'DELETE'})
    }

    /**
     * Função que retorna um recurso, de seu respectivo workspace, dado seu URI
     * @param {String} resourceURI URI do recurso
     */
    getResource(resourceURI){
      let resourceId  = resourceURI
      resourceId      = encodeURIComponent(resourceId);
      return this.call(`/resources/getResource/${this.config.workspace}?resourceId=${resourceId}`, {method: 'GET'})
        .then(function(json) {
          const resource  = new Resource();
          resource.setName(json.name) 
          resource.setPrefix(json.prefix)
          resource.setAbout(json.about)
          for(let vocab of json.vocabularies){
            const vocabulary  = new Vocabulary()
            vocabulary.prefix = vocab.prefix
            vocabulary.uri    = vocab.uri
            for (let pair of vocab.pairs){
              vocabulary.pairs.push(pair)
            }
            resource.vocabularies[vocab.prefix] = vocab
          }
          return resource
        })
    }

    /**
     * Função que retonra uma lista de recursos de seu respectivo workspace dada a URI de uma propriedade e seu valor
     * @param {*} propertyUri URI da propriedade
     * @param {*} value Valor da propriedade
     * @param {*} isExactly Booleano que considera se o valor passado deverá ser exatamente igual ao valor passado ou se deve apenas conter o valor passado
     */
    getResources(propertyUri, value, isExactly){
      propertyUri = encodeURIComponent(propertyUri)
      value       = encodeURIComponent(value)
      return this.call(`/resources/getResources/${this.config.workspace}?propertyUri=${propertyUri}&value=${value}&isExactly=${isExactly}`, {method: 'GET'})
        .then(function(resourcesJson){
          const resourcesList = []
          for (let res of resourcesJson){
            const resource  = new Resource();
            resource.setName(res.name) 
            resource.setPrefix(res.prefix)
            resource.setAbout(res.about)
            for(let vocab of res.vocabularies){
              const vocabulary  = new Vocabulary()
              vocabulary.prefix = vocab.prefix
              vocabulary.uri    = vocab.uri
              for (let pair of vocab.pairs){
                vocabulary.pairs.push(pair)
              }
              resource.vocabularies[vocab.prefix] = vocab
            }
            resourcesList.push(resource)
          }
          return resourcesList
        })
    }

    /**
     * Função para atualizar o valor de uma propriedade
     * @param {*} resourceId Recurso que tem a propriedade
     * @param {*} propertyUri URI da propriedade
     * @param {*} newValue  Novo valor a ser atribuído
     */
    updateProperty(resourceId, propertyUri, newValue){
      resourceId  = encodeURIComponent(resourceId);
      propertyUri = encodeURIComponent(propertyUri);
      newValue    = encodeURIComponent(newValue);
      return this.call(`/resources/updateProperty/${this.config.workspace}?resourceId=${resourceId}&propertyUri=${propertyUri}&newValue=${newValue}`, {method: 'PUT'})
    }

    /**
     * Função para adicionar uma nova propriedade a um recurso retornado do servidor
     * @param {*} resource Recurso retornado do servidor
     * @param {*} vocabPrefix Prefixo do vocabulário no qual será adicionada a nova propriedade
     * @param {*} property Nova propriedade que será adicionada
     */
    addProperty(resource, vocabPrefix, property){
      const propName      = property.propertyName
      const value         = property.value
      const asResource    = property.asResource
      const subPropertyOf = property.subPropertyOf

      if (subPropertyOf === '' || subPropertyOf === null || subPropertyOf === undefined){
        const property = { propertyName: propName, value: value, asResource: asResource, subPropertyOf: '' }
        resource.vocabularies[vocabPrefix].pairs.push(property)
      } else {
        if (!resource.propertyExists(vocabPrefix, subPropertyOf)){
          const property = { propertyName: subPropertyOf, value: '', asResource: true, subPropertyOf: '' }
          resource.vocabularies[vocabPrefix].pairs.push(property)
        }
        const subproperty = { propertyName: propName, value: value, asResource: asResource, subPropertyOf: subPropertyOf }
        resource.vocabularies[vocabPrefix].pairs.push(subproperty)
      } 
    }

    commitChanges(resource){
      this.deleteResource(resource.about)         
      .then(() => {
        console.log("Recurso antigo deletado")
        this.saveResource(resource)
        console.log("Recurso atualizado salvo")
       })
      .then(() => {
        console.log("Pronto")
       })
    }

    localNameExists(resource){
      let localNameSize = getLocalNameResource(resource)
      return (localNameSize == 37 && (!getResourceLocalName(resource).includes(".")));
    }
  
    getResourceLocalName(resource){
      let localNameSize = 0;
      const aboutResource = resource.about;
      for (let x = aboutResource.length() - 2; aboutResource.charAt(x) != '/'; x--)
          localNameSize++;
      localNameSize++ ;
      return localNameSize;
    }
  
    alreadyExistsInDatabase(resource){
      return localNameExists(resource)
    }

  }