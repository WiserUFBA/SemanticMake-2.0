let r = new Resource("contact", "contactData", "http://www.personalContact.com/")
r.addVocabulary("contact", "<http://contact.com#Person/")
r.addVocabulary("schema", "http://schema.org/")
r.addVocabulary("vcard", "<http://www.w3.org/2006/vcard/ns#>")
const p = new Property("about", "Email subject", "false", "")
r.addTriple("schema", p)
const p = new Property("url", "http://personalContact.com/7g4r-q5j3-7gl2-d9m3", "true", "")
r.addTriple("schema", p)
const p = new Property("email", "YahooMail", "false", "client")
r.addTriple("vcard", p)
const p = new Property("email", "somemail@email.com", "false", "hasValue")
r.addTriple("vcard", p)

   var btnSubmit = document.getElementById('buttonFormSubmit')
   btnSubmit.onclick = function(event){
      event.preventDefault();
      const config = {
         baseURL: 'http://localhost:8080/',
         workspace: 'workspace-5f833b81'
      }
      const api = new SemanticAPI(config)
      let resource = new Resource('contactData', 'contact', 'http://contactmail.com#Person')
      resource.addVocabulary('schema', 'http://schema.org/')
      resource.addVocabulary('vcard', 'http://www.w3.org/2006/vcard/ns#')
      const emailValue = document.getElementById('inputEmail').value
      const property = new Property('hasValue', 'email@email.com', false, 'email')
      resource.addProperty('vcard', property)
      const property1 = new Property('client', 'YahooMail', false, 'email')
      resource.addProperty('vcard', property1)
      const nameValue = document.getElementById('inputName').value
      const property2  = new Property('name', 'Eudes Diônatas Silva Souza', false, '')
      resource.addProperty('schema', property2)
      const subjectValue = document.getElementById('inputSubject').value
      const property3 = new Property('about', 'Assunto do email', false, '')
      resource.addProperty('schema', property3)
      const telValue = document.getElementById('inputTel').value
      const property4 = new Property ('telephone', '73991809696', false, '' )
      resource.addProperty('schema', property4)
      const messageValue = document.getElementById('inputMessage').value
      const property5 = new Property('text', 'Mensagem do e-mail', false, '')
      resource.addProperty('schema', property5)
      resource.addCoordinatesDateTime()
      resource.addLanguage('pt-br');
      api.saveResource(resource)
         .then(json => alert(`Recurso salvo com sucesso\nSeu workspace é: ${json.workspace}\nO ID do recurso é: ${json.resourceId}`))
        .catch(error => alert(`Problema de conexão ao tentar salvar a ontologia\n${error.message}`))
      api.deleteGraph()
         .then(json => alert(`Workspace '${json.workspace}' foi removido`))
         .catch(error => alert(`Problema de conexão ao tentar deletar apagar workspace: ${error.message}`))
      api.deleteResource("http://contactmail.com#Person/84ffb518-66df-4cf8-aa1e-ede6dac33613")
        .then(json => alert(`O recurso '${json.resourceId}' foi removido do workspce '${json.workspace}'`))
        .catch(error => alert(`Problema ao tentar deletar recurso: ${error.message}`))
      let now = new Date()
      now = now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds()
      api.updateProperty('http://contactmail.com#Person/8ff4d538-a20a-4ba9-a51d-554357ecfcad', 'http://www.w3.org/2006/vcard/ns#client', 'Gmail')
       .then(json => alert(`A propriedade do recurso foi atualizada`))
       .catch(json => alert(`Falha ao tentar atualizar o recurso`))      
      api.updateProperty('http://contactmail.com#Person/8ff4d538-a20a-4ba9-a51d-554357ecfcad', 'http://schema.org/geocoordinates', '369852147')
      api.deleteProperty('http://contactmail.com#Person/affa9dce-7e1a-42ba-8fe8-2b96c40bcb5b', 'http://schema.org/geocoordinates')
      .then(json => alert(`A propriedade com URI '${json.propertyUri}', do recurso '${json.resourceId}', do workspace '${json.workspace}', foi removida`))
      .catch(error => alert(`Problema de conexão ao tentar deletar propriedade: ${error.message}`))
      api.getResource("http://contactmail.com#Person/b1a43405-0f58-4971-b29d-6a01f588cb81")
      .then(resource => { alert(`O recurso '${resource.about}' foi retornado`)})
      .catch(error => alert(`Problema de conexão ao tentar recuperar o recurso: ${error.message}`))
      api.getResources('http://schema.org/name', 'Souza', false)
      .then(resources => console.log(resources))
      .catch(err => alert(`Problema ao tentar recuperar recursos ${err.msg}`))
      api.getResource("http://contactmail.com#Person/f4fe96f7-966c-4d6f-8e13-a6b38f51824b")
      .then(function(res){
         const newProperty = new Property('waterMark', 'weaky', false, '')
         api.addProperty(res ,'vcard', newProperty)
         commitChanges(res)
      })
      .catch(error => alert(`Problema ao tentar recuperar o recurso: ${error.message}`))
      api.getResource("http://contactmail.com#Person/ea73365f-2d2c-46a6-9dab-3d7df25178f2")
      .then(res => {
         res.addVocabulary('vpref', 'http://vocabularyUri#')
         const newProperty = new Property('newProp', 'newValue', false, 'new')
         const newProperty2 = new Property('music', 'Looking Too Closely', false, 'entertainment')
         api.addProperty (res, 'vpref', newProperty)
         api.addProperty (res, 'vpref', newProperty2)
         api.commitChanges(res);
       })
      .catch(err => alert(`Problema ao tentar recuperar recursos ${err.msg}`))
      }


